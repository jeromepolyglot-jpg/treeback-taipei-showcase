create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant insert on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users read own roles"
on public.user_roles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Bootstrap first admin or self user role"
on public.user_roles for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    role = 'user'
    or (role = 'admin' and not exists (select 1 from public.user_roles where role = 'admin'))
  )
);

create policy "Admins read all subscriptions"
on public.tree_subscriptions for select to authenticated
using (public.has_role((select auth.uid()), 'admin'));

create policy "Admins read all alerts"
on public.tree_alerts for select to authenticated
using (public.has_role((select auth.uid()), 'admin'));

create policy "Admins read all roles"
on public.user_roles for select to authenticated
using (public.has_role((select auth.uid()), 'admin'));