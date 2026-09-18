-- Production hardening: enforce canonical workflow values and query ownership.
-- Constraints are NOT VALID so existing legacy/demo rows do not block deployment;
-- PostgreSQL still enforces them for all future writes.

create index if not exists notifications_recipient_unread_idx
  on public.notifications(organization_id, user_id, read, created_at desc);
create index if not exists parent_student_requests_owner_idx
  on public.parent_student_requests(organization_id, parent_guardian_id, student_id, created_at desc);
create index if not exists tracked_records_scope_idx
  on public.tracked_records(organization_id, student_id, class_id, teacher_id, source_module, created_at desc);

alter table public.parent_student_requests
  drop constraint if exists parent_student_requests_status_check;
alter table public.parent_student_requests
  add constraint parent_student_requests_status_check
  check (status in ('Submitted','Acknowledged','Approved','Rejected','Completed','Cancelled','Arrived','Received','Collected')) not valid;

alter table public.transport_notices
  drop constraint if exists transport_notices_status_check;
alter table public.transport_notices
  add constraint transport_notices_status_check
  check (status in ('Submitted','Acknowledged','Resolved','Cancelled')) not valid;

alter table public.procurement_requests
  drop constraint if exists procurement_requests_status_check;
alter table public.procurement_requests
  add constraint procurement_requests_status_check
  check (status in ('Draft','Submitted','Approved','Rejected','POCreated','Ordered','Delivered','Received')) not valid;

-- A direct database user may never update a notification belonging to another user.
drop policy if exists notifications_own_update on public.notifications;
create policy notifications_own_update on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Private buckets use the organization-scoped path convention
-- <organization-id>/<uuid>. Storage object policies remain deployment-specific
-- until the canonical membership/RLS helper is selected.
insert into storage.buckets(id, name, public)
  values ('student-documents','student-documents',false),
         ('admissions-documents','admissions-documents',false),
         ('inquiry-attachments','inquiry-attachments',false)
  on conflict (id) do nothing;
