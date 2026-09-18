-- Tighten role boundaries after the initial shared-platform rollout.
-- Admin operates school workflows; HOS has leadership visibility and only the
-- permissions explicitly granted below.

create or replace function public.schoolos_can_manage_org(org uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.schoolos_has_role(org,array['admin']::public.school_role[]);
$$;

-- Teachers may only read records for students in one of their assigned classes.
drop policy if exists student_records_teacher_read on public.student_records;
create policy student_records_teacher_read on public.student_records for select using (
  not restricted and public.schoolos_teacher_can_access_student(organization_id,student_id)
);

-- Report cards are authored only by a teacher who can access the linked student
-- or by an administrator. Organization membership alone is never sufficient.
drop policy if exists student_reports_staff_write on public.student_reports;
create policy student_reports_staff_write on public.student_reports for all using (
  public.schoolos_can_manage_org(organization_id)
  or public.schoolos_teacher_can_access_student(organization_id,student_id)
) with check (
  public.schoolos_can_manage_org(organization_id)
  or public.schoolos_teacher_can_access_student(organization_id,student_id)
);
drop policy if exists report_entries_staff_write on public.subject_report_entries;
create policy report_entries_staff_write on public.subject_report_entries for all using (
  exists(select 1 from public.student_reports report where report.id=report_id and (
    public.schoolos_can_manage_org(report.organization_id)
    or public.schoolos_teacher_can_access_student(report.organization_id,report.student_id)
  ))
) with check (
  exists(select 1 from public.student_reports report where report.id=report_id and (
    public.schoolos_can_manage_org(report.organization_id)
    or public.schoolos_teacher_can_access_student(report.organization_id,report.student_id)
  ))
);

-- A recipient can mark only their own notification read. Managers can still
-- generate notifications through the server workflow layer.
create policy notifications_own_update on public.notifications for update using (
  user_id=auth.uid()
) with check (user_id=auth.uid());

-- Linked guardians have the same released-document and request visibility as
-- their authorized child, without receiving unrelated records.
drop policy if exists student_doc_requests_access on public.student_document_requests;
create policy student_doc_requests_access on public.student_document_requests for all using (
  public.schoolos_can_manage_org(organization_id)
  or public.schoolos_is_student_owner(student_id)
  or public.schoolos_parent_can_access_student(organization_id,student_id)
) with check (
  public.schoolos_can_manage_org(organization_id)
  or public.schoolos_is_student_owner(student_id)
  or public.schoolos_parent_can_access_student(organization_id,student_id)
);
drop policy if exists student_docs_access on public.student_documents;
create policy student_docs_access on public.student_documents for select using (
  (released_to_student and (
    public.schoolos_is_student_owner(student_id)
    or public.schoolos_parent_can_access_student(organization_id,student_id)
  )) or public.schoolos_can_manage_org(organization_id)
);

-- HOS may review visitor visibility, never operate check-in/out.
delete from public.role_permissions rp using public.roles r
  where rp.role_id=r.id and r.code='head_of_school' and rp.permission='visitors.manage';

-- HOS receives high-level operational reads through membership and explicit
-- dashboard queries; operational write policies exclude it.
drop policy if exists damage_operational_write on public.damage_records;
create policy damage_operational_write on public.damage_records for all using (
  public.schoolos_has_role(organization_id,array['lab_assistant','librarian','admin']::public.school_role[])
) with check (public.schoolos_has_role(organization_id,array['lab_assistant','librarian','admin']::public.school_role[]));
drop policy if exists lab_requests_authorized_write on public.lab_requests;
create policy lab_requests_authorized_write on public.lab_requests for all using (
  requester_id=auth.uid() or public.schoolos_has_role(organization_id,array['lab_assistant','admin']::public.school_role[])
) with check (public.schoolos_is_member(organization_id));
drop policy if exists lab_usage_operational_write on public.lab_usage;
create policy lab_usage_operational_write on public.lab_usage for all using (
  public.schoolos_has_role(organization_id,array['lab_assistant','admin']::public.school_role[])
) with check (public.schoolos_has_role(organization_id,array['lab_assistant','admin']::public.school_role[]));
drop policy if exists buses_transport_write on public.buses;
create policy buses_transport_write on public.buses for all using (
  public.schoolos_has_role(organization_id,array['transport_staff','admin']::public.school_role[])
) with check (public.schoolos_has_role(organization_id,array['transport_staff','admin']::public.school_role[]));
drop policy if exists arrival_transport_write on public.bus_arrival_records;
create policy arrival_transport_write on public.bus_arrival_records for all using (
  public.schoolos_has_role(organization_id,array['transport_staff','admin']::public.school_role[])
) with check (public.schoolos_has_role(organization_id,array['transport_staff','admin']::public.school_role[]));
drop policy if exists departure_transport_write on public.bus_departure_records;
create policy departure_transport_write on public.bus_departure_records for all using (
  public.schoolos_has_role(organization_id,array['transport_staff','admin']::public.school_role[])
) with check (public.schoolos_has_role(organization_id,array['transport_staff','admin']::public.school_role[]));
drop policy if exists activity_transport_write on public.transport_activity;
create policy activity_transport_write on public.transport_activity for insert with check (
  public.schoolos_has_role(organization_id,array['transport_staff','admin']::public.school_role[])
);
drop policy if exists borrowed_assets_operational_write on public.borrowed_assets;
create policy borrowed_assets_operational_write on public.borrowed_assets for all using (
  public.schoolos_has_role(organization_id,array['librarian','lab_assistant','admin']::public.school_role[])
) with check (public.schoolos_has_role(organization_id,array['librarian','lab_assistant','admin']::public.school_role[]));

-- Atomic minimum enrollment: a single database transaction creates the student,
-- links an available class for the requested grade, updates the application,
-- and records the leadership trail. Account invitations remain a separate
-- server-side step because they require Supabase Auth administration.
create or replace function public.schoolos_enroll_admission(
  p_application_id uuid,
  p_actor_id uuid,
  p_admission_number text default null,
  p_class_id uuid default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare
  application public.admission_applications%rowtype;
  enrolled_id uuid;
  enrollment_class uuid;
  external_student_id text;
begin
  select * into application from public.admission_applications
    where id=p_application_id for update;
  if not found then raise exception 'Application was not found'; end if;
  if application.enrolled_student_id is not null then return application.enrolled_student_id; end if;
  if application.status not in ('Accepted','Offered') then
    raise exception 'Only accepted or offered applications can be enrolled';
  end if;
  external_student_id := coalesce(nullif(trim(p_admission_number),''), 'ADM-' || upper(substr(replace(application.id::text,'-',''),1,10)));
  if exists(select 1 from public.students where organization_id=application.organization_id and external_id=external_student_id) then
    raise exception 'Admission number already exists';
  end if;
  insert into public.students(organization_id,external_id,grade)
    values(application.organization_id,external_student_id,application.applying_grade)
    returning id into enrolled_id;
  enrollment_class := p_class_id;
  if enrollment_class is null then
    select id into enrollment_class from public.classes
      where organization_id=application.organization_id and grade=application.applying_grade
      order by title limit 1;
  end if;
  if enrollment_class is not null then
    insert into public.class_memberships(organization_id,class_id,student_id,membership_role)
      values(application.organization_id,enrollment_class,enrolled_id,'student');
  end if;
  update public.admission_applications
    set status='Enrolled', enrolled_student_id=enrolled_id, updated_at=now()
    where id=application.id;
  insert into public.admission_timeline(organization_id,application_id,action,actor_id,details)
    values(application.organization_id,application.id,'Student enrolled',p_actor_id,
      jsonb_build_object('studentId',enrolled_id,'admissionNumber',external_student_id,'classId',enrollment_class));
  insert into public.activity_events(organization_id,event_type,module,actor_id,actor_role,subject_type,subject_id,related_student_id,entity_type,entity_id,tags,metadata)
    values(application.organization_id,'STUDENT_ENROLLED','Admissions',p_actor_id,'Admin','student',enrolled_id,enrolled_id,'admission_application',application.id,
      array['organization:'||application.organization_id::text,'module:admissions','type:student-enrolled','student:'||enrolled_id::text],
      jsonb_build_object('admissionNumber',external_student_id,'classId',enrollment_class));
  insert into public.audit_logs(organization_id,actor_id,actor_role,entity_type,entity_id,action,after)
    values(application.organization_id,p_actor_id,'Admin','admission_application',application.id,'STUDENT_ENROLLED',
      jsonb_build_object('studentId',enrolled_id,'admissionNumber',external_student_id,'classId',enrollment_class));
  return enrolled_id;
end;
$$;
