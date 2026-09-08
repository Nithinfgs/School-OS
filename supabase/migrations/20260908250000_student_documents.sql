create table if not exists public.student_document_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade, document_type text not null, reason text not null,
  required_by_date date, notes text, status text not null default 'Submitted', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade, document_type text not null, title text not null,
  academic_year_id uuid, issued_date date, file_path text, template_id uuid, request_id uuid references public.student_document_requests(id) on delete set null,
  status text not null default 'Draft', released_to_student boolean not null default false, released_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists student_document_requests_org_status_idx on public.student_document_requests(organization_id,status,created_at desc);
create index if not exists student_documents_org_student_idx on public.student_documents(organization_id,student_id,status,issued_date desc);
alter table public.student_document_requests enable row level security; alter table public.student_documents enable row level security;
create policy student_doc_requests_access on public.student_document_requests for all using (public.schoolos_can_manage_org(organization_id) or public.schoolos_is_student_owner(student_id)) with check (public.schoolos_can_manage_org(organization_id) or public.schoolos_is_student_owner(student_id));
create policy student_docs_access on public.student_documents for select using ((released_to_student and public.schoolos_is_student_owner(student_id)) or public.schoolos_can_manage_org(organization_id));
create policy student_docs_manager_write on public.student_documents for all using (public.schoolos_can_manage_org(organization_id)) with check (public.schoolos_can_manage_org(organization_id));
