alter table public.profiles add column directory_access boolean not null default false;
alter policy "connecticut members read directory" on public.member_directory
using (exists (select 1 from public.profiles p where p.id = (select auth.uid())
and p.access_scope = 'ct_member' and p.subscription_status in ('active','exempt') and p.directory_access));
