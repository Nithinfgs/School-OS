-- SchoolOS mock bootstrap
--
-- Before running this migration, create the Supabase Auth user in the dashboard:
-- Authentication → Users → Add user → nithinselvaraj9@gmail.com.
-- Do not insert passwords into SQL or source control. This migration only links
-- that authenticated user to a SchoolOS organization and the Admin role.

do $$
declare
  v_user_id uuid;
  v_organization_id uuid;
  v_admin_role_id uuid;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = 'nithinselvaraj9@gmail.com'
  limit 1;

  if v_user_id is null then
    raise exception using message =
      'Create the Supabase Auth user nithinselvaraj9@gmail.com first, then run this bootstrap again.';
  end if;

  insert into public.organizations (external_id, name, school_year, owner_id)
  values ('westbridge-international', 'Westbridge International', '2026-27', v_user_id)
  on conflict (external_id) do update
    set name = excluded.name,
        school_year = excluded.school_year,
        owner_id = excluded.owner_id,
        updated_at = now()
  returning id into v_organization_id;

  insert into public.profiles (id, organization_id, display_name, email, active)
  values (
    v_user_id,
    v_organization_id,
    'Nithin Selvaraj',
    'nithinselvaraj9@gmail.com',
    true
  )
  on conflict (id) do update
    set organization_id = excluded.organization_id,
        display_name = excluded.display_name,
        email = excluded.email,
        active = true,
        updated_at = now();

  select id into v_admin_role_id
  from public.roles
  where code = 'admin';

  if v_admin_role_id is null then
    raise exception using message = 'The SchoolOS core migration has not been applied: Admin role is missing.';
  end if;

  insert into public.user_roles (organization_id, user_id, role_id)
  values (v_organization_id, v_user_id, v_admin_role_id)
  on conflict (organization_id, user_id, role_id) do nothing;
end $$;
