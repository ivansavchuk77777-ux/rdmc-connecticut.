-- All fixture users and entries are rolled back. Fails immediately on any access regression.
begin;
select set_config('test.member_id', gen_random_uuid()::text, true);
select set_config('test.owner_id', owner_user_id::text, true) from public.app_settings where id=1;
select set_config('test.roster_id', id::text, true) from public.consumption_members order by sort_order limit 1;
insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data)
values (current_setting('test.member_id')::uuid,'consumption-access-test@example.invalid','{}','{}');
set local role anon;
do $$begin
  begin perform 1 from public.consumption_members; raise exception 'Anonymous roster access was allowed'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.consumption_entries; raise exception 'Anonymous entry access was allowed'; exception when insufficient_privilege then null; end;
end$$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.member_id'),true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.member_id'),'role','authenticated')::text,true);
set local role authenticated;
do $$begin
  if (select count(*) from public.consumption_members) <> 0 then raise exception 'Pending member could read roster'; end if;
end$$;
reset role;
update public.profiles set subscription_status='active',access_scope='ct_member' where id=current_setting('test.member_id')::uuid;
set local role authenticated;
do $$begin
  if (select count(*) from public.consumption_members) <> 12 then raise exception 'Approved chapter member cannot read full roster'; end if;
  begin
    insert into public.consumption_entries(member_id,product,quantity,used_on) values(current_setting('test.roster_id')::uuid,'Beer',1,current_date);
    raise exception 'Ordinary member could write entries';
  exception when insufficient_privilege then null; end;
end$$;
reset role;
update public.profiles set access_scope='world_brother' where id=current_setting('test.member_id')::uuid;
set local role authenticated;
do $$begin
  if (select count(*) from public.consumption_members) <> 0 then raise exception 'Worldwide account could read chapter roster'; end if;
end$$;
reset role;
update public.profiles set subscription_status='blocked',access_scope='ct_member' where id=current_setting('test.member_id')::uuid;
set local role authenticated;
do $$begin
  if (select count(*) from public.consumption_members) <> 0 then raise exception 'Blocked member could read roster'; end if;
end$$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.owner_id'),true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('test.owner_id'),'role','authenticated')::text,true);
set local role authenticated;
do $$declare entry_id uuid; begin
  insert into public.consumption_entries(member_id,product,quantity,used_on) values(current_setting('test.roster_id')::uuid,'Water',2,(now() at time zone 'America/New_York')::date) returning id into entry_id;
  if not exists(select 1 from public.consumption_entries where id=entry_id and recorded_by=auth.uid()) then raise exception 'Owner save not visible or audit identity missing'; end if;
  begin update public.consumption_entries set quantity=3 where id=entry_id; raise exception 'Ledger quantity was mutable'; exception when insufficient_privilege then null; end;
  update public.consumption_entries set voided_at=now() where id=entry_id;
  if not exists(select 1 from public.consumption_entries where id=entry_id and voided_at is not null) then raise exception 'Owner correction failed'; end if;
  begin delete from public.consumption_entries where id=entry_id; raise exception 'Ledger deletion was allowed'; exception when insufficient_privilege then null; end;
end$$;
reset role;
rollback;
select 'PASS: anonymous, pending, active chapter, worldwide, blocked, owner save, correction and immutable audit history' as result;
