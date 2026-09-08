-- Report cards use the existing school entities and preserve an immutable published snapshot.
create table if not exists public.report_cycles (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, academic_year_id uuid, term text not null, reporting_period_start date not null, reporting_period_end date not null,
  classes uuid[] not null default '{}', grades text[] not null default '{}', subjects text[] not null default '{}',
  teacher_submission_deadline timestamptz, review_deadline timestamptz, publication_date timestamptz, template_id uuid,
  status text not null default 'Draft' check (status in ('Draft','Open','TeacherSubmission','Review','Approved','Published','Archived')),
  created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.student_reports (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  cycle_id uuid not null references public.report_cycles(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null, teacher_id uuid references public.teachers(id) on delete set null,
  status text not null default 'Draft' check (status in ('Draft','Submitted','Returned','UnderReview','Approved','Published')),
  overall_remarks text, attendance_snapshot jsonb not null default '{}', published_snapshot jsonb, published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(cycle_id,student_id)
);
create table if not exists public.subject_report_entries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  report_id uuid not null references public.student_reports(id) on delete cascade, subject text not null, subject_grade text,
  predicted_grade text, teacher_comment text, effort text, participation text, academic_progress text, areas_for_improvement text,
  achievement_note text, attendance_summary text, version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.report_reviews (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  report_id uuid not null references public.student_reports(id) on delete cascade, reviewer_id uuid references public.profiles(id) on delete set null,
  action text not null, internal_note text, created_at timestamptz not null default now()
);
create table if not exists public.report_versions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  report_id uuid not null references public.student_reports(id) on delete cascade, version integer not null, snapshot jsonb not null,
  submitted_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), unique(report_id,version)
);
create table if not exists public.report_templates (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, settings jsonb not null default '{}', created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists report_cycles_org_status_idx on public.report_cycles(organization_id,status,publication_date);
create index if not exists student_reports_org_cycle_status_idx on public.student_reports(organization_id,cycle_id,status);
create index if not exists student_reports_org_student_idx on public.student_reports(organization_id,student_id,updated_at desc);
create index if not exists report_entries_report_idx on public.subject_report_entries(report_id);

alter table public.report_cycles enable row level security;
alter table public.student_reports enable row level security;
alter table public.subject_report_entries enable row level security;
alter table public.report_reviews enable row level security;
alter table public.report_versions enable row level security;
alter table public.report_templates enable row level security;
create policy report_cycles_staff_read on public.report_cycles for select using (public.schoolos_is_member(organization_id));
create policy report_cycles_manager_write on public.report_cycles for all using (public.schoolos_can_manage_org(organization_id)) with check (public.schoolos_can_manage_org(organization_id));
create policy student_reports_permitted_read on public.student_reports for select using (public.schoolos_can_manage_org(organization_id) or (status='Published' and public.schoolos_is_student_owner(student_id)) or public.schoolos_teacher_can_access_student(organization_id,student_id));
create policy student_reports_staff_write on public.student_reports for all using (public.schoolos_is_member(organization_id)) with check (public.schoolos_is_member(organization_id));
create policy report_entries_permitted_read on public.subject_report_entries for select using (exists(select 1 from public.student_reports r where r.id=report_id and (public.schoolos_can_manage_org(r.organization_id) or (r.status='Published' and public.schoolos_is_student_owner(r.student_id)) or public.schoolos_teacher_can_access_student(r.organization_id,r.student_id))));
create policy report_entries_staff_write on public.subject_report_entries for all using (public.schoolos_is_member(organization_id)) with check (public.schoolos_is_member(organization_id));
create policy report_reviews_manager_read on public.report_reviews for select using (public.schoolos_can_manage_org(organization_id) or reviewer_id=auth.uid());
create policy report_reviews_manager_write on public.report_reviews for all using (public.schoolos_can_manage_org(organization_id)) with check (public.schoolos_can_manage_org(organization_id));
create policy report_versions_manager_read on public.report_versions for select using (public.schoolos_can_manage_org(organization_id) or exists(select 1 from public.student_reports r where r.id=report_id and r.status='Published' and public.schoolos_is_student_owner(r.student_id)));
create policy report_versions_staff_write on public.report_versions for insert with check (public.schoolos_is_member(organization_id));
create policy report_templates_manager_access on public.report_templates for all using (public.schoolos_can_manage_org(organization_id)) with check (public.schoolos_can_manage_org(organization_id));
