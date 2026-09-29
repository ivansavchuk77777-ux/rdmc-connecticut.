-- Run against the RDMC Connecticut project. The owner may block a profile;
-- a blocked profile fails the existing active/exempt member access policies.
alter table public.profiles drop constraint if exists profiles_subscription_status_check;
alter table public.profiles add constraint profiles_subscription_status_check
  check (subscription_status = any (array['pending','active','exempt','expired','blocked']));
drop policy if exists "owner updates member profiles" on public.profiles;
create policy "owner updates member profiles" on public.profiles for update to authenticated
  using (public.is_owner() and id <> (select auth.uid()))
  with check (public.is_owner() and id <> (select auth.uid())
    and role = any (array['member','officer'])
    and subscription_status = any (array['pending','active','exempt','expired','blocked'])
    and access_scope = any (array['ct_member','world_brother']));
