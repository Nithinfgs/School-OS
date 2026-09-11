-- Production RLS & Supabase Storage Hardening Migration
-- Enforces complete organization isolation, relationship-based access, and storage object policies.

-- 1. Ensure private buckets exist
insert into storage.buckets (id, name, public)
values
  ('student-documents', 'student-documents', false),
  ('admissions-documents', 'admissions-documents', false),
  ('inquiry-attachments', 'inquiry-attachments', false)
on conflict (id) do nothing;

-- 2. Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- 3. Storage Policies for student-documents
drop policy if exists student_documents_manager_all on storage.objects;
create policy student_documents_manager_all on storage.objects
for all to authenticated
using (
  bucket_id = 'student-documents'
  and public.schoolos_can_manage_org(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'student-documents'
  and public.schoolos_can_manage_org(((storage.foldername(name))[1])::uuid)
);

drop policy if exists student_documents_student_read on storage.objects;
create policy student_documents_student_read on storage.objects
for select to authenticated
using (
  bucket_id = 'student-documents'
  and exists (
    select 1 from public.students s
    where s.organization_id = ((storage.foldername(name))[1])::uuid
      and s.id = ((storage.foldername(name))[3])::uuid
      and public.schoolos_is_student_owner(s.id)
  )
);

drop policy if exists student_documents_parent_read on storage.objects;
create policy student_documents_parent_read on storage.objects
for select to authenticated
using (
  bucket_id = 'student-documents'
  and exists (
    select 1 from public.students s
    where s.organization_id = ((storage.foldername(name))[1])::uuid
      and s.id = ((storage.foldername(name))[3])::uuid
      and public.schoolos_parent_can_access_student(s.organization_id, s.id)
  )
);

drop policy if exists student_documents_teacher_read on storage.objects;
create policy student_documents_teacher_read on storage.objects
for select to authenticated
using (
  bucket_id = 'student-documents'
  and exists (
    select 1 from public.students s
    where s.organization_id = ((storage.foldername(name))[1])::uuid
      and s.id = ((storage.foldername(name))[3])::uuid
      and public.schoolos_teacher_can_access_student(s.organization_id, s.id)
  )
);

-- 4. Storage Policies for admissions-documents
drop policy if exists admissions_documents_manager_all on storage.objects;
create policy admissions_documents_manager_all on storage.objects
for all to authenticated
using (
  bucket_id = 'admissions-documents'
  and public.schoolos_can_manage_org(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'admissions-documents'
  and public.schoolos_can_manage_org(((storage.foldername(name))[1])::uuid)
);

-- 5. Storage Policies for inquiry-attachments
drop policy if exists inquiry_attachments_public_insert on storage.objects;
create policy inquiry_attachments_public_insert on storage.objects
for insert to anon, authenticated
with check (
  bucket_id = 'inquiry-attachments'
  and exists (
    select 1 from public.organizations org
    where org.id = ((storage.foldername(name))[1])::uuid
  )
);

drop policy if exists inquiry_attachments_staff_read on storage.objects;
create policy inquiry_attachments_staff_read on storage.objects
for select to authenticated
using (
  bucket_id = 'inquiry-attachments'
  and public.schoolos_is_member(((storage.foldername(name))[1])::uuid)
);

-- 6. Table-Level RLS Hardening for Core Tables
-- Staff Leave Requests
create table if not exists public.staff_leave_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'Submitted',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_leave_requests enable row level security;

drop policy if exists staff_leave_read on public.staff_leave_requests;
create policy staff_leave_read on public.staff_leave_requests
for select using (
  staff_id = auth.uid() or public.schoolos_can_manage_org(organization_id)
);

drop policy if exists staff_leave_insert on public.staff_leave_requests;
create policy staff_leave_insert on public.staff_leave_requests
for insert with check (
  staff_id = auth.uid() and public.schoolos_is_member(organization_id)
);

drop policy if exists staff_leave_update on public.staff_leave_requests;
create policy staff_leave_update on public.staff_leave_requests
for update using (
  (staff_id = auth.uid() and status = 'Submitted') or public.schoolos_can_manage_org(organization_id)
)
with check (
  (staff_id = auth.uid() and status in ('Submitted', 'Cancelled')) or public.schoolos_can_manage_org(organization_id)
);

-- Visitors & Visitor Logs
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  company text,
  purpose text not null,
  host_staff_id uuid references public.profiles(id) on delete set null,
  status text not null default 'Expected',
  expected_arrival timestamptz not null,
  check_in_time timestamptz,
  check_out_time timestamptz,
  badge_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.visitors enable row level security;

drop policy if exists visitors_read on public.visitors;
create policy visitors_read on public.visitors
for select using (
  public.schoolos_is_member(organization_id)
);

drop policy if exists visitors_write on public.visitors;
create policy visitors_write on public.visitors
for all using (
  public.schoolos_can_manage_org(organization_id) or public.schoolos_has_role(organization_id, array['admin', 'staff', 'transport_staff']::public.school_role[])
)
with check (
  public.schoolos_can_manage_org(organization_id) or public.schoolos_has_role(organization_id, array['admin', 'staff', 'transport_staff']::public.school_role[])
);

-- Idempotency and audit indices
create index if not exists staff_leave_org_staff_idx on public.staff_leave_requests(organization_id, staff_id, status);
create index if not exists visitors_org_status_idx on public.visitors(organization_id, status, expected_arrival desc);
