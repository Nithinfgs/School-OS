create table if not exists public.visitor_profiles (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, phone text not null, email text, visitor_type text not null, visitor_organization text, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,phone)
);
create table if not exists public.visit_records (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  visit_id text not null, visitor_id uuid not null references public.visitor_profiles(id) on delete cascade, visit_date date not null,
  host_id uuid references public.profiles(id) on delete set null, department_id uuid references public.departments(id) on delete set null,
  purpose text not null, student_id uuid references public.students(id) on delete set null, inquiry_id uuid references public.inquiries(id) on delete set null,
  appointment_id uuid, arrival_time timestamptz, expected_departure_time timestamptz, actual_departure_time timestamptz,
  vehicle_number text, id_type text, notes text, status text not null default 'Expected', checked_in_by uuid references public.profiles(id) on delete set null,
  checked_out_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,visit_id)
);
create index if not exists visit_records_org_date_status_idx on public.visit_records(organization_id,visit_date,status,arrival_time desc);
alter table public.visitor_profiles enable row level security; alter table public.visit_records enable row level security;
create policy visitor_profiles_frontoffice_access on public.visitor_profiles for all using (public.schoolos_has_permission(organization_id,'visitors.manage')) with check (public.schoolos_has_permission(organization_id,'visitors.manage'));
create policy visit_records_frontoffice_access on public.visit_records for all using (public.schoolos_has_permission(organization_id,'visitors.view') or public.schoolos_has_permission(organization_id,'visitors.manage')) with check (public.schoolos_has_permission(organization_id,'visitors.manage'));
insert into public.role_permissions(role_id,permission) select id,'visitors.view' from public.roles where code in ('admin','head_of_school','staff') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'visitors.manage' from public.roles where code in ('admin','head_of_school','staff') on conflict do nothing;
