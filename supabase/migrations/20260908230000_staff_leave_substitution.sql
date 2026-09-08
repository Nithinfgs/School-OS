create table if not exists public.staff_leave_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid not null references public.staff(id) on delete cascade, department_id uuid references public.departments(id) on delete set null,
  leave_type text not null, start_date date not null, end_date date not null, day_type text not null default 'FullDay', reason text not null,
  supporting_document text, notes text, status text not null default 'Submitted', created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.staff_substitutions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  date date not null, period_id uuid, class_id uuid references public.classes(id) on delete cascade, subject_id uuid, room_id uuid,
  original_teacher_id uuid references public.teachers(id) on delete set null, substitute_teacher_id uuid references public.teachers(id) on delete set null,
  leave_request_id uuid references public.staff_leave_requests(id) on delete cascade, status text not null default 'Unassigned', reason text,
  assigned_by uuid references public.profiles(id) on delete set null, assigned_at timestamptz, confirmed_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists staff_leave_org_dates_idx on public.staff_leave_requests(organization_id,start_date,end_date,status);
create index if not exists staff_substitutions_org_date_idx on public.staff_substitutions(organization_id,date,status);
alter table public.staff_leave_requests enable row level security;
alter table public.staff_substitutions enable row level security;
create policy staff_leave_admin_access on public.staff_leave_requests for all using (public.schoolos_has_permission(organization_id,'staff.leave.manage') or public.schoolos_has_permission(organization_id,'staff.leave.view')) with check (public.schoolos_has_permission(organization_id,'staff.leave.manage'));
create policy staff_substitution_admin_access on public.staff_substitutions for all using (public.schoolos_has_permission(organization_id,'staff.leave.manage') or public.schoolos_has_permission(organization_id,'staff.leave.view')) with check (public.schoolos_has_permission(organization_id,'staff.leave.manage'));
insert into public.role_permissions(role_id,permission) select id,'staff.leave.view' from public.roles where code in ('admin','head_of_school','teacher') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'staff.leave.manage' from public.roles where code='admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'staff.substitution.manage' from public.roles where code='admin' on conflict do nothing;
