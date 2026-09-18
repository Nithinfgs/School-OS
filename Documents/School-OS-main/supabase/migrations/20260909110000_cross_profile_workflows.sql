-- Cross-profile workflow hardening.  Parent links are explicit, and every
-- workflow write uses its canonical source row plus activity/audit records.

alter type public.school_role add value if not exists 'parent';

create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  parent_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text,
  primary_guardian boolean not null default false,
  receives_communications boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, parent_profile_id, student_id)
);
create index if not exists parent_student_links_parent_idx on public.parent_student_links(organization_id,parent_profile_id,student_id);
alter table public.parent_student_links enable row level security;

create or replace function public.schoolos_parent_can_access_student(org uuid, student uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.parent_student_links link
    where link.organization_id=org and link.student_id=student
      and link.parent_profile_id=auth.uid()
  );
$$;

create or replace function public.schoolos_can_access_student(org uuid, student uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.schoolos_is_student_owner(student)
    or public.schoolos_parent_can_access_student(org,student)
    or public.schoolos_teacher_can_access_student(org,student)
    or public.schoolos_can_manage_org(org);
$$;

create policy parent_student_links_read on public.parent_student_links for select using (
  parent_profile_id=auth.uid() or public.schoolos_has_permission(organization_id,'students.viewAll')
);
create policy parent_student_links_manage on public.parent_student_links for all using (
  public.schoolos_has_permission(organization_id,'students.manage')
) with check (public.schoolos_has_permission(organization_id,'students.manage'));

-- Replace the original request policy. Parents must own both the profile and
-- the explicit child relationship; a supplied student_id alone is never enough.
drop policy if exists parent_requests_access on public.parent_student_requests;
create policy parent_requests_access on public.parent_student_requests for all using (
  public.schoolos_has_permission(organization_id,'student.requests.manage')
  or (parent_guardian_id=auth.uid() and public.schoolos_parent_can_access_student(organization_id,student_id))
) with check (
  public.schoolos_has_permission(organization_id,'student.requests.manage')
  or (parent_guardian_id=auth.uid() and public.schoolos_parent_can_access_student(organization_id,student_id))
);

-- HOS may read organization records through explicit permissions, but routine
-- operational writes stay with the role that owns the workflow.
insert into public.role_permissions(role_id,permission)
  select id,'students.viewAll' from public.roles where code in ('admin','head_of_school') on conflict do nothing;
insert into public.role_permissions(role_id,permission)
  select id,'students.manage' from public.roles where code='admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission)
  select id,'student.requests.manage' from public.roles where code in ('admin','staff') on conflict do nothing;

create or replace function public.schoolos_workflow_event(
  p_organization_id uuid, p_actor_id uuid, p_actor_role text, p_event_type text,
  p_module text, p_entity_type text, p_entity_id uuid, p_student_id uuid,
  p_metadata jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.activity_events(
    organization_id,event_type,module,actor_id,actor_role,subject_type,subject_id,
    related_student_id,entity_type,entity_id,tags,metadata
  ) values (
    p_organization_id,p_event_type,p_module,p_actor_id,p_actor_role,p_entity_type,p_entity_id,
    p_student_id,p_entity_type,p_entity_id,
    array['organization:' || p_organization_id::text,'module:' || lower(replace(p_module,' ','-')),'type:' || lower(p_event_type)],p_metadata
  );
  insert into public.audit_logs(organization_id,actor_id,actor_role,entity_type,entity_id,action,after)
  values(p_organization_id,p_actor_id,p_actor_role,p_entity_type,p_entity_id,p_event_type,p_metadata);
end;
$$;
