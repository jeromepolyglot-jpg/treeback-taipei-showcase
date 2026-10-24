create table public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  message text not null,
  page text not null default '',
  created_at timestamptz not null default now()
);

alter table public.user_feedback enable row level security;

grant select, insert on public.user_feedback to authenticated;
grant all on public.user_feedback to service_role;

create policy "Users send feedback"
  on public.user_feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users read own feedback"
  on public.user_feedback for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins read all feedback"
  on public.user_feedback for select to authenticated
  using (public.has_role((select auth.uid()), 'admin'::app_role));

create policy "Admins can delete feedback"
  on public.user_feedback for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'::app_role));

create or replace function public.admin_user_activity()
returns table(
  user_id uuid,
  email text,
  signed_up_at timestamptz,
  reports bigint,
  subscriptions bigint,
  alerts bigint,
  plant3d_scores bigint,
  oasis_played boolean,
  feedback bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'not authorized';
  end if;
  return query
  select
    u.id,
    u.email::text,
    u.created_at,
    (select count(*) from public.tree_reports r where r.user_id = u.id),
    (select count(*) from public.tree_subscriptions s where s.user_id = u.id),
    (select count(*) from public.tree_alerts a where a.user_id = u.id),
    (select count(*) from public.plant3d_scores p where p.user_id = u.id),
    exists(select 1 from public.oasis_progress o where o.user_id = u.id),
    (select count(*) from public.user_feedback f where f.user_id = u.id)
  from auth.users u
  order by u.created_at desc;
end;
$$;