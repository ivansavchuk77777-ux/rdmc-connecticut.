-- The App Review account has its own credential, sessions and sample records.
-- No review token is a Supabase Auth JWT or grants access to chapter tables.
create schema rdmc_review;
revoke all on schema rdmc_review from public, anon, authenticated;
create table rdmc_review.account (
  email text primary key,
  password_digest bytea not null,
  journal jsonb not null default '[]'
);
create table rdmc_review.sessions (
  token_digest bytea primary key,
  email text not null references rdmc_review.account(email),
  expires_at timestamptz not null
);
create function public.rdmc_review_login(login_email text, login_password text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  token text;
begin
  if not exists (select from rdmc_review.account where email = lower(trim(login_email))
    and password_digest = extensions.digest(login_password, 'sha256')) then
    raise exception 'Invalid reviewer credentials';
  end if;
  token := encode(extensions.gen_random_bytes(32), 'hex');
  delete from rdmc_review.sessions where expires_at <= now();
  insert into rdmc_review.sessions values (extensions.digest(token, 'sha256'), lower(trim(login_email)), now()+interval '7 days');
  return token;
end;
$$;
create function public.rdmc_review_records(session_token text, action_name text default 'read', message_body text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  account_email text;
  result jsonb;
  new_row jsonb;
begin
  select email into strict account_email from rdmc_review.sessions
    where token_digest = extensions.digest(session_token, 'sha256') and expires_at > now();
  if action_name = 'logout' then
    delete from rdmc_review.sessions where token_digest = extensions.digest(session_token, 'sha256');
    return '[]'::jsonb;
  end if;
  select journal into strict result from rdmc_review.account where email = account_email for update;
  if action_name = 'read' then return result; end if;
  if action_name = 'chat' and length(trim(message_body)) between 1 and 4000 then
    new_row := jsonb_build_object('table_name','member_chat','id',gen_random_uuid(),'author_id','review-member','body',trim(message_body),'created_at',now());
  elsif action_name = 'deletion' then
    if result @> '[{"table_name":"account_deletion_requests"}]'::jsonb then return result; end if;
    new_row := jsonb_build_object('table_name','account_deletion_requests','user_id','review-member','status','pending','requested_at',now());
  else
    raise exception 'Unsupported reviewer action';
  end if;
  result := result || jsonb_build_array(new_row);
  update rdmc_review.account set journal=result where email=account_email;
  return result;
end;
$$;
revoke all on function public.rdmc_review_login(text,text), public.rdmc_review_records(text,text,text) from public;
grant execute on function public.rdmc_review_login(text,text), public.rdmc_review_records(text,text,text) to anon;
