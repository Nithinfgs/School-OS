create table if not exists public.procurement_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  request_number text not null, requester_id uuid references public.profiles(id) on delete set null, requester_role text not null,
  department_id uuid references public.departments(id) on delete set null, source_module text not null, items jsonb not null default '[]',
  estimated_total numeric not null default 0, supplier_preference text, reason text not null, priority text not null default 'Normal',
  required_by_date date, notes text, attachments jsonb not null default '[]', status text not null default 'Draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,request_number)
);
create table if not exists public.procurement_suppliers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, contact_name text, phone text, email text, address text, categories_supplied text[] not null default '{}', active boolean not null default true, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  po_number text not null, supplier_id uuid references public.procurement_suppliers(id) on delete set null, request_ids uuid[] not null default '{}', items jsonb not null default '[]', subtotal numeric not null default 0, tax numeric not null default 0, total_cost numeric not null default 0, delivery_address text, expected_delivery_date date, notes text, status text not null default 'Draft', issued_by uuid references public.profiles(id) on delete set null, issued_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,po_number)
);
create table if not exists public.procurement_deliveries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade, received_items jsonb not null default '[]', received_by uuid references public.profiles(id) on delete set null, received_at timestamptz not null default now(), notes text
);
create index if not exists procurement_requests_org_status_idx on public.procurement_requests(organization_id,status,priority,created_at desc);
create index if not exists purchase_orders_org_status_idx on public.purchase_orders(organization_id,status,created_at desc);
alter table public.procurement_requests enable row level security; alter table public.procurement_suppliers enable row level security; alter table public.purchase_orders enable row level security; alter table public.procurement_deliveries enable row level security;
create policy procurement_manager_access on public.procurement_requests for all using (public.schoolos_has_permission(organization_id,'procurement.manage') or public.schoolos_has_permission(organization_id,'procurement.view')) with check (public.schoolos_has_permission(organization_id,'procurement.manage'));
create policy procurement_supplier_access on public.procurement_suppliers for all using (public.schoolos_has_permission(organization_id,'procurement.manage') or public.schoolos_has_permission(organization_id,'procurement.view')) with check (public.schoolos_has_permission(organization_id,'procurement.manage'));
create policy purchase_order_access on public.purchase_orders for all using (public.schoolos_has_permission(organization_id,'procurement.manage') or public.schoolos_has_permission(organization_id,'procurement.view')) with check (public.schoolos_has_permission(organization_id,'procurement.manage'));
create policy procurement_delivery_access on public.procurement_deliveries for all using (public.schoolos_has_permission(organization_id,'procurement.manage') or public.schoolos_has_permission(organization_id,'procurement.view')) with check (public.schoolos_has_permission(organization_id,'procurement.manage'));
insert into public.role_permissions(role_id,permission) select id,'procurement.view' from public.roles where code in ('admin','head_of_school','lab_assistant','librarian','teacher') on conflict do nothing;
insert into public.role_permissions(role_id,permission) select id,'procurement.manage' from public.roles where code='admin' on conflict do nothing;
