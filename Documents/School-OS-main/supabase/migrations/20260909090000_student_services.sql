-- Student Services expansion. All records remain organization-scoped and can
-- be referenced by approvals, notifications, activity events and timelines.
create table if not exists public.parent_student_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  parent_guardian_id uuid references public.profiles(id) on delete set null, student_id uuid not null references public.students(id) on delete cascade,
  request_type text not null, request_date date not null, requested_time time, expected_time time, reason text, notes text,
  status text not null default 'Submitted', metadata jsonb not null default '{}'::jsonb, assigned_to uuid references public.profiles(id) on delete set null,
  acknowledged_by uuid references public.profiles(id) on delete set null, completed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  source_type text not null, source_id uuid not null, title text not null, requester_id uuid references public.profiles(id) on delete set null,
  student_id uuid references public.students(id) on delete set null, module text not null, priority text not null default 'Normal', status text not null default 'Awaiting Action',
  assigned_to uuid references public.profiles(id) on delete set null, due_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,source_type,source_id)
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null, message text not null, audience jsonb not null default '{}'::jsonb, priority text not null default 'Normal',
  publish_at timestamptz not null default now(), expires_at timestamptz, pinned boolean not null default false, require_acknowledgement boolean not null default false,
  status text not null default 'Published', related_event_id uuid, created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.announcement_acknowledgements (
  announcement_id uuid not null references public.announcements(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, acknowledged_at timestamptz not null default now(), primary key(announcement_id,user_id)
);
create table if not exists public.school_forms (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null, description text, category text, audience jsonb not null default '{}'::jsonb, open_at timestamptz, close_at timestamptz,
  approval_required boolean not null default false, allow_attachments boolean not null default false, confirmation_message text, status text not null default 'Active', created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.school_form_fields (
  id uuid primary key default gen_random_uuid(), form_id uuid not null references public.school_forms(id) on delete cascade, field_key text not null, label text not null, field_type text not null, help_text text, options jsonb not null default '[]'::jsonb, required boolean not null default false, sort_order integer not null default 0, unique(form_id,field_key)
);
create table if not exists public.school_form_submissions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, form_id uuid not null references public.school_forms(id) on delete cascade, submitted_by uuid references public.profiles(id) on delete set null, student_id uuid references public.students(id) on delete set null, answers jsonb not null default '{}'::jsonb, status text not null default 'Submitted', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.id_cards (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, card_number text not null, academic_year_id uuid, status text not null default 'Active', issued_at timestamptz, replaced_card_id uuid references public.id_cards(id) on delete set null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,card_number)
);
create table if not exists public.id_card_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, card_id uuid not null references public.id_cards(id) on delete cascade, action text not null, actor_id uuid references public.profiles(id) on delete set null, details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.library_suggestions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, title text not null, author text, isbn text, publisher text, category text, reason text, academic_relevance text, status text not null default 'Submitted', procurement_request_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.lab_purchase_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, requester_id uuid references public.profiles(id) on delete set null, laboratory text not null, item text not null, item_type text, category text, quantity numeric not null, unit text not null, reason text, required_by date, priority text not null default 'Normal', estimated_cost numeric, status text not null default 'Draft', procurement_request_id uuid, inventory_transaction_id uuid, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.student_information_change_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, requested_by uuid references public.profiles(id) on delete set null, field_key text not null, current_value text, requested_value text, reason text, status text not null default 'Submitted', reviewed_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, name text not null, relationship text not null, primary_phone text not null, secondary_phone text, email text, priority_order integer not null default 1, authorized_pickup boolean not null default false, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.school_policies (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, title text not null, category text not null, summary text, content text not null, audience jsonb not null default '{}'::jsonb, owner_id uuid references public.profiles(id) on delete set null, effective_date date, version text not null default '1.0', status text not null default 'Draft', attachment_path text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.school_service_status (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, service_key text not null, service_name text not null, status text not null default 'Available', note text, effective_from timestamptz, effective_until timestamptz, normal_hours jsonb not null default '{}'::jsonb, updated_by uuid references public.profiles(id) on delete set null, updated_at timestamptz not null default now(), unique(organization_id,service_key)
);
create table if not exists public.student_feedback (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, submitted_by uuid references public.profiles(id) on delete set null, student_id uuid references public.students(id) on delete set null, category text not null, subject text not null, message text not null, related_area text, anonymous boolean not null default false, status text not null default 'Submitted', assigned_to uuid references public.profiles(id) on delete set null, internal_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists approvals_org_status_idx on public.approvals(organization_id,status,priority,created_at desc);
create index if not exists parent_requests_org_student_idx on public.parent_student_requests(organization_id,student_id,request_date,status);
create index if not exists form_submissions_org_student_idx on public.school_form_submissions(organization_id,student_id,created_at desc);
create index if not exists feedback_org_status_idx on public.student_feedback(organization_id,status,created_at desc);

do $$ declare t text; begin
  foreach t in array array['parent_student_requests','approvals','announcements','announcement_acknowledgements','school_forms','school_form_fields','school_form_submissions','id_cards','id_card_events','library_suggestions','lab_purchase_requests','student_information_change_requests','emergency_contacts','school_policies','school_service_status','student_feedback'] loop
    execute format('alter table public.%I enable row level security',t);
  end loop;
end $$;

-- Organization isolation plus permission gates. Parent access is limited to
-- their linked student records by the existing schoolos_can_access_student helper.
create policy parent_requests_access on public.parent_student_requests for all using (public.schoolos_has_permission(organization_id,'student.requests.manage') or (parent_guardian_id=auth.uid() and public.schoolos_can_access_student(organization_id,student_id))) with check (public.schoolos_is_member(organization_id) and (public.schoolos_has_permission(organization_id,'student.requests.manage') or (parent_guardian_id=auth.uid() and public.schoolos_can_access_student(organization_id,student_id))));
create policy approvals_access on public.approvals for all using (public.schoolos_has_permission(organization_id,'approvals.view') or public.schoolos_has_permission(organization_id,'approvals.manage')) with check (public.schoolos_has_permission(organization_id,'approvals.manage'));
create policy announcements_access on public.announcements for select using (public.schoolos_is_member(organization_id));
create policy announcements_manage on public.announcements for all using (public.schoolos_has_permission(organization_id,'announcements.manage')) with check (public.schoolos_has_permission(organization_id,'announcements.manage'));
create policy announcement_ack_access on public.announcement_acknowledgements for all using (user_id=auth.uid() or exists(select 1 from public.announcements a where a.id=announcement_id and public.schoolos_has_permission(a.organization_id,'announcements.manage')));
create policy forms_access on public.school_forms for select using (public.schoolos_is_member(organization_id));
create policy forms_manage on public.school_forms for all using (public.schoolos_has_permission(organization_id,'forms.manage')) with check (public.schoolos_has_permission(organization_id,'forms.manage'));
create policy form_fields_access on public.school_form_fields for select using (exists(select 1 from public.school_forms f where f.id=form_id and public.schoolos_is_member(f.organization_id)));
create policy form_submissions_access on public.school_form_submissions for all using (submitted_by=auth.uid() or public.schoolos_has_permission(organization_id,'forms.review')) with check (public.schoolos_is_member(organization_id));
create policy id_cards_access on public.id_cards for select using (public.schoolos_can_access_student(organization_id,student_id) or public.schoolos_has_permission(organization_id,'idcards.view'));
create policy id_cards_manage on public.id_cards for all using (public.schoolos_has_permission(organization_id,'idcards.manage')) with check (public.schoolos_has_permission(organization_id,'idcards.manage'));
create policy id_card_events_access on public.id_card_events for select using (public.schoolos_has_permission(organization_id,'idcards.view'));
create policy id_card_events_manage on public.id_card_events for insert with check (public.schoolos_has_permission(organization_id,'idcards.manage'));
create policy library_suggestions_access on public.library_suggestions for all using (student_id in (select s.id from public.students s where s.organization_id=public.library_suggestions.organization_id and s.profile_id=auth.uid()) or public.schoolos_has_permission(organization_id,'library.suggestions.manage')) with check (public.schoolos_is_member(organization_id));
create policy lab_purchase_access on public.lab_purchase_requests for all using (public.schoolos_has_permission(organization_id,'lab.purchase.manage') or public.schoolos_has_permission(organization_id,'procurement.manage')) with check (public.schoolos_is_member(organization_id));
create policy info_change_access on public.student_information_change_requests for all using (requested_by=auth.uid() or public.schoolos_has_permission(organization_id,'student.records.edit')) with check (public.schoolos_is_member(organization_id));
create policy emergency_contacts_access on public.emergency_contacts for select using (public.schoolos_can_access_student(organization_id,student_id) and public.schoolos_has_permission(organization_id,'student.emergency.view'));
create policy emergency_contacts_manage on public.emergency_contacts for all using (public.schoolos_has_permission(organization_id,'student.emergency.manage')) with check (public.schoolos_has_permission(organization_id,'student.emergency.manage'));
create policy policies_access on public.school_policies for select using (status='Published' and public.schoolos_is_member(organization_id) or public.schoolos_has_permission(organization_id,'policies.manage'));
create policy policies_manage on public.school_policies for all using (public.schoolos_has_permission(organization_id,'policies.manage')) with check (public.schoolos_has_permission(organization_id,'policies.manage'));
create policy service_status_access on public.school_service_status for select using (public.schoolos_is_member(organization_id));
create policy service_status_manage on public.school_service_status for all using (public.schoolos_has_permission(organization_id,'services.manage')) with check (public.schoolos_has_permission(organization_id,'services.manage'));
create policy feedback_access on public.student_feedback for all using (submitted_by=auth.uid() or public.schoolos_has_permission(organization_id,'feedback.manage')) with check (public.schoolos_is_member(organization_id));

insert into public.role_permissions(role_id,permission) select id,'approvals.view' from public.roles where code in ('admin','head_of_school') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'approvals.manage' from public.roles where code in ('admin','head_of_school') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'announcements.manage' from public.roles where code in ('admin','head_of_school','teacher') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'forms.manage' from public.roles where code='admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'forms.review' from public.roles where code in ('admin','head_of_school','teacher') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'idcards.view' from public.roles where code in ('admin','head_of_school','teacher') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'idcards.manage' from public.roles where code='admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'library.suggestions.manage' from public.roles where code in ('admin','librarian') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'lab.purchase.manage' from public.roles where code in ('admin','lab_assistant') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'student.emergency.view' from public.roles where code in ('admin','head_of_school','teacher') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'student.emergency.manage' from public.roles where code='admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'policies.manage' from public.roles where code in ('admin','head_of_school') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'services.manage' from public.roles where code in ('admin','head_of_school','staff') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'feedback.manage' from public.roles where code in ('admin','head_of_school') on conflict do nothing;
insert into public.roles(code,label) values ('parent','Parent / Guardian') on conflict(code) do nothing;
insert into public.role_permissions(role_id,permission) select id,'student.requests.create' from public.roles where code='parent' on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'student.requests.viewOwn' from public.roles where code='parent' on conflict do nothing;

-- Canonical source records automatically create approval queue entries. The
-- source row remains authoritative; approvals only reference it.
create or replace function public.schoolos_create_service_approval() returns trigger language plpgsql security definer set search_path=public as $$
declare source_type text; title text; module_name text; requester uuid; student uuid; priority text := 'Normal';
begin
  if tg_table_name='parent_student_requests' then source_type := upper(new.request_type); title := replace(new.request_type,'DropOff',' drop-off') || ' request'; module_name := 'Student Services'; requester := new.parent_guardian_id; student := new.student_id;
  elsif tg_table_name='library_suggestions' then source_type := 'LIBRARY_SUGGESTION'; title := new.title; module_name := 'Library'; requester := null; student := new.student_id;
  elsif tg_table_name='lab_purchase_requests' then source_type := 'LAB_PURCHASE'; title := new.item || ' purchase request'; module_name := 'Laboratory'; requester := new.requester_id; priority := coalesce(new.priority,'Normal');
  else return new; end if;
  insert into public.approvals(organization_id,source_type,source_id,title,requester_id,student_id,module,priority,status,metadata)
    values(new.organization_id,source_type,new.id,title,requester,student,module_name,priority,'Awaiting Action',jsonb_build_object('sourceTable',tg_table_name)) on conflict(organization_id,source_type,source_id) do nothing;
  return new;
end $$;
drop trigger if exists parent_request_approval on public.parent_student_requests;
create trigger parent_request_approval after insert on public.parent_student_requests for each row execute function public.schoolos_create_service_approval();
drop trigger if exists library_suggestion_approval on public.library_suggestions;
create trigger library_suggestion_approval after insert on public.library_suggestions for each row execute function public.schoolos_create_service_approval();
drop trigger if exists lab_purchase_approval on public.lab_purchase_requests;
create trigger lab_purchase_approval after insert on public.lab_purchase_requests for each row execute function public.schoolos_create_service_approval();
