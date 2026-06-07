-- Row Level Security policies for PrivateCode.
--
-- Apply AFTER running the Drizzle migrations (which create the tables):
--   psql "$DATABASE_URL" -f supabase/rls.sql
-- or paste into the Supabase SQL editor.
--
-- Model: all WRITES happen server-side through the Postgres connection
-- (DATABASE_URL) / Supabase service role, both of which BYPASS RLS. These
-- policies therefore govern only the anon/authenticated keys that could ever
-- be exposed to a browser, and they default-deny everything that isn't
-- explicitly allowed below.

alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.licenses enable row level security;
alter table public.webhook_events enable row level security;

-- USERS — a signed-in person may read only their own record.
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select to authenticated
  using (
    auth_user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- ORDERS — read only orders that match the signed-in user's email.
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- LICENSES — read only licenses attached to one of your own orders.
drop policy if exists "licenses_select_own" on public.licenses;
create policy "licenses_select_own" on public.licenses
  for select to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = licenses.order_id
        and lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- WEBHOOK_EVENTS — sensitive audit log. RLS is enabled with NO policies, so
-- anon/authenticated roles are denied entirely; only the service role can read
-- it. (Intentionally no policy statements here.)

-- Note: there are deliberately NO insert/update/delete policies for the
-- anon/authenticated roles — every mutation is performed by trusted
-- server-side code using the service role.
