-- RDMC chapter Zoom calls. The Zoom host creates the meeting in Zoom and adds its invite link here.
create table if not exists public.zoom_meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 3 and 120),
  host_chapter text not null check (length(trim(host_chapter)) between 2 and 120),
  starts_at timestamptz not null,
  join_url text not null check (join_url ~ '^https://([a-zA-Z0-9-]+\.)*zoom\.(us|com)/j/[0-9]+([?][^[:space:]]*)?$'),
  audience text not null default 'all' check (audience in ('all','ct_member','world_brother')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists zoom_meetings_starts_at_idx on public.zoom_meetings(starts_at);
alter table public.zoom_meetings enable row level security;
revoke all on public.zoom_meetings from anon;
grant select, insert, delete on public.zoom_meetings to authenticated;
create policy "approved brothers read zoom calls" on public.zoom_meetings for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.subscription_status in ('active','exempt')
      and p.access_scope in ('ct_member','world_brother')
      and (audience = 'all' or audience = p.access_scope)
  ) or (select public.is_owner())
);
create policy "owner adds zoom calls" on public.zoom_meetings for insert to authenticated
with check ((select public.is_owner()) and created_by = (select auth.uid()));
create policy "owner removes zoom calls" on public.zoom_meetings for delete to authenticated
using ((select public.is_owner()));
