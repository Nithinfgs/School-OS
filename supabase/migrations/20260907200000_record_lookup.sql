-- Organization-scoped indexes and explicit HOS record lookup permissions.
-- The existing RLS manager rules continue to enforce organization isolation.
insert into public.role_permissions(role_id,permission)
select id,'teacherRecords.viewAll' from public.roles where code='head_of_school' on conflict do nothing;
insert into public.role_permissions(role_id,permission)
select id,'studentRecords.viewAll' from public.roles where code='head_of_school' on conflict do nothing;

create index if not exists profiles_organization_email_lookup_idx on public.profiles(organization_id,email);
create index if not exists students_organization_external_lookup_idx on public.students(organization_id,external_id);
create index if not exists teachers_organization_external_lookup_idx on public.teachers(organization_id,external_id);
create index if not exists classes_organization_lookup_idx on public.classes(organization_id,created_at desc);
create index if not exists tracked_records_organization_student_lookup_idx on public.tracked_records(organization_id,student_id,created_at desc);
create index if not exists tracked_records_organization_teacher_lookup_idx on public.tracked_records(organization_id,teacher_id,created_at desc);
