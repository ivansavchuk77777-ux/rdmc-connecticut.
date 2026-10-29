-- Monthly sheets are calculated from an append-only usage ledger.
-- Member roster is seeded separately in the private database, not in public source.
begin;
create table public.consumption_members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 1 and 100),
  sort_order integer not null default 0
);
create table public.consumption_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.consumption_members(id),
  product text not null check (product in ('Beer','Shots','Mixed drinks','Soda','Water','Chips')),
  quantity integer not null check (quantity between 1 and 999),
  used_on date not null check (used_on >= date '2020-01-01' and used_on <= (now() at time zone 'America/New_York')::date),
  notes text not null default '' check (char_length(notes) <= 300),
  recorded_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  voided_at timestamptz
);
create index consumption_entries_month_idx on public.consumption_entries(used_on, created_at, id);
create index consumption_entries_member_idx on public.consumption_entries(member_id);
create index consumption_entries_recorder_idx on public.consumption_entries(recorded_by);
alter table public.consumption_members enable row level security;
alter table public.consumption_entries enable row level security;
revoke all on public.consumption_members, public.consumption_entries from anon, authenticated;
grant select on public.consumption_members, public.consumption_entries to authenticated;
grant insert (id,member_id,product,quantity,used_on,notes) on public.consumption_entries to authenticated;
grant update (voided_at) on public.consumption_entries to authenticated;
create policy "chapter reads consumption roster" on public.consumption_members for select to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.access_scope='ct_member' and p.subscription_status in ('active','exempt')));
create policy "chapter reads consumption entries" on public.consumption_entries for select to authenticated
using (exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.access_scope='ct_member' and p.subscription_status in ('active','exempt')));
create policy "owner records consumption" on public.consumption_entries for insert to authenticated
with check ((select public.is_owner()) and recorded_by=(select auth.uid()) and voided_at is null and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.access_scope='ct_member' and p.subscription_status in ('active','exempt')));
create policy "owner voids consumption" on public.consumption_entries for update to authenticated
using ((select public.is_owner()) and voided_at is null and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.access_scope='ct_member' and p.subscription_status in ('active','exempt')))
with check ((select public.is_owner()) and voided_at is not null and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.access_scope='ct_member' and p.subscription_status in ('active','exempt')));
alter publication supabase_realtime add table public.consumption_members, public.consumption_entries;
commit;
