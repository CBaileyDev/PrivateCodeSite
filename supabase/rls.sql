-- Row Level Security policies for PrivateCode.
--
-- Apply AFTER running the Drizzle migrations (which create the tables):
--   psql "$DATABASE_URL" -f supabase/rls.sql
-- or paste into the Supabase SQL editor.
--
-- Model: the browser never receives database credentials. All reads and writes
-- happen through trusted server-side code using DATABASE_URL. RLS is enabled as
-- defense in depth for any exposed Supabase roles, with no browser policies.

alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.licenses enable row level security;
alter table public.license_activations enable row level security;
alter table public.webhook_events enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "licenses_select_own" on public.licenses;

-- With no customer accounts or browser database client, there are deliberately
-- NO select/insert/update/delete policies for anon/authenticated roles. Only
-- trusted server-side code should read or mutate these tables.

-- Note: there are deliberately NO insert/update/delete policies for the
-- anon/authenticated roles — every mutation is performed by trusted
-- server-side code using the service role.
