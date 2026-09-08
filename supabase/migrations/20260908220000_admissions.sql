create table if not exists public.admission_applications (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  applicant_name text not null, date_of_birth date not null, applying_grade text not null, academic_year_id uuid,
  parent_guardian_name text not null, parent_email text not null, parent_phone text not null, current_school text,
  previous_school text, nationality text, address text, application_date date not null default current_date,
  documents jsonb not null default '[]', notes text, status text not null default 'Draft', assigned_reviewer uuid references public.profiles(id) on delete set null,
  enrolled_student_id uuid references public.students(id) on delete set null, created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.admission_notes (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  application_id uuid not null references public.admission_applications(id) on delete cascade, author_id uuid references public.profiles(id) on delete set null,
  body text not null, created_at timestamptz not null default now()
);
create table if not exists public.admission_assessments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  application_id uuid not null references public.admission_applications(id) on delete cascade, scheduled_at timestamptz, result text, status text not null default 'Scheduled',
  assessor_id uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.admission_interviews (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  application_id uuid not null references public.admission_applications(id) on delete cascade, scheduled_at timestamptz, location text, interviewer_id uuid references public.profiles(id) on delete set null,
  notes text, status text not null default 'Scheduled', created_at timestamptz not null default now()
);
create table if not exists public.admission_timeline (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  application_id uuid not null references public.admission_applications(id) on delete cascade, action text not null, actor_id uuid references public.profiles(id) on delete set null,
  details jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists admission_applications_org_status_idx on public.admission_applications(organization_id,status,applying_grade,application_date desc);
create index if not exists admission_timeline_application_idx on public.admission_timeline(application_id,created_at desc);
alter table public.admission_applications enable row level security;
alter table public.admission_notes enable row level security;
alter table public.admission_assessments enable row level security;
alter table public.admission_interviews enable row level security;
alter table public.admission_timeline enable row level security;
create policy admissions_manager_access on public.admission_applications for all using (public.schoolos_has_permission(organization_id,'admissions.manage') or public.schoolos_has_permission(organization_id,'admissions.view')) with check (public.schoolos_has_permission(organization_id,'admissions.manage'));
create policy admission_notes_manager_access on public.admission_notes for all using (public.schoolos_has_permission(organization_id,'admissions.manage')) with check (public.schoolos_has_permission(organization_id,'admissions.manage'));
create policy admission_assessments_manager_access on public.admission_assessments for all using (public.schoolos_has_permission(organization_id,'admissions.manage') or public.schoolos_has_permission(organization_id,'admissions.view')) with check (public.schoolos_has_permission(organization_id,'admissions.manage'));
create policy admission_interviews_manager_access on public.admission_interviews for all using (public.schoolos_has_permission(organization_id,'admissions.manage') or public.schoolos_has_permission(organization_id,'admissions.view')) with check (public.schoolos_has_permission(organization_id,'admissions.manage'));
create policy admission_timeline_manager_access on public.admission_timeline for all using (public.schoolos_has_permission(organization_id,'admissions.manage') or public.schoolos_has_permission(organization_id,'admissions.view')) with check (public.schoolos_has_permission(organization_id,'admissions.manage'));
insert into public.role_permissions(role_id,permission) select id,'admissions.view' from public.roles where code in ('admin','head_of_school') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'admissions.review' from public.roles where code in ('admin','head_of_school') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'admissions.manage' from public.roles where code='admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'admissions.enroll' from public.roles where code='admin' on conflict do nothing;
