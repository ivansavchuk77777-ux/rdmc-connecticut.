create table if not exists public.member_chat (
  id bigint generated always as identity primary key,
  author_id uuid not null references auth.users(id),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.member_chat enable row level security;
create policy "active chapter members read chat" on public.member_chat for select to authenticated
  using (exists(select 1 from public.profiles p where p.id=(select auth.uid())
    and p.access_scope='ct_member' and p.subscription_status in ('active','exempt')));
create policy "active chapter members post chat" on public.member_chat for insert to authenticated
  with check (author_id=(select auth.uid()) and exists(select 1 from public.profiles p
    where p.id=(select auth.uid()) and p.access_scope='ct_member'
    and p.subscription_status in ('active','exempt')));
grant select, insert on public.member_chat to authenticated;
alter publication supabase_realtime add table public.member_chat;
