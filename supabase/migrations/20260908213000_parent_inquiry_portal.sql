create table if not exists public.external_parent_guardians (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, email text not null, phone text, linked_student_id uuid references public.students(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists external_parent_guardians_org_contact_idx on public.external_parent_guardians(organization_id,email,phone);
alter table public.external_parent_guardians enable row level security;
create policy external_parent_guardians_staff_read on public.external_parent_guardians for select using (public.schoolos_can_manage_org(organization_id));
create policy external_parent_guardians_staff_write on public.external_parent_guardians for all using (public.schoolos_can_manage_org(organization_id)) with check (public.schoolos_can_manage_org(organization_id));
