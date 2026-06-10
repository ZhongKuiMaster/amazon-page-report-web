create extension if not exists pgcrypto;

create table if not exists public.commercial_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  wechat_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tool_credit_balances (
  user_id uuid not null references public.commercial_users(id) on delete cascade,
  tool_id text not null check (tool_id in ('ads-workbench', 'alexa-listing-builder', 'growth-profit-planner')),
  remaining_credits integer not null default 0 check (remaining_credits >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

create table if not exists public.tool_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.commercial_users(id) on delete cascade,
  tool_id text not null check (tool_id in ('ads-workbench', 'alexa-listing-builder', 'growth-profit-planner')),
  delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.redemption_codes (
  code text primary key,
  source text not null default 'wechat-community',
  redeemed_by uuid references public.commercial_users(id) on delete set null,
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_order_id text,
  email text not null,
  plan_id text not null check (plan_id in ('starter', 'operator', 'expert')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  amount_cents integer not null,
  currency text not null default 'USD',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wechat_private_domain_events (
  id uuid primary key default gen_random_uuid(),
  email text,
  wechat_id text,
  event_type text not null,
  note text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.consume_tool_credit(p_user_id uuid, p_tool_id text)
returns table(ok boolean, remaining_credits integer, message text)
language plpgsql
security definer
as $$
declare
  current_credits integer;
begin
  select b.remaining_credits
    into current_credits
    from public.tool_credit_balances b
   where b.user_id = p_user_id
     and b.tool_id = p_tool_id
   for update;

  if current_credits is null then
    return query select false, 0, 'No credits found for this tool.';
    return;
  end if;

  if current_credits <= 0 then
    return query select false, current_credits, 'No remaining credits.';
    return;
  end if;

  update public.tool_credit_balances
     set remaining_credits = remaining_credits - 1,
         updated_at = now()
   where user_id = p_user_id
     and tool_id = p_tool_id;

  insert into public.tool_credit_ledger(user_id, tool_id, delta, reason)
  values (p_user_id, p_tool_id, -1, 'tool-run');

  return query select true, current_credits - 1, 'Credit consumed.';
end;
$$;

alter table public.commercial_users enable row level security;
alter table public.tool_credit_balances enable row level security;
alter table public.tool_credit_ledger enable row level security;
alter table public.redemption_codes enable row level security;
alter table public.payment_orders enable row level security;
alter table public.wechat_private_domain_events enable row level security;

grant usage on schema public to service_role;

grant select, insert, update, delete on public.commercial_users to service_role;
grant select, insert, update, delete on public.tool_credit_balances to service_role;
grant select, insert, update, delete on public.tool_credit_ledger to service_role;
grant select, insert, update, delete on public.redemption_codes to service_role;
grant select, insert, update, delete on public.payment_orders to service_role;
grant select, insert, update, delete on public.wechat_private_domain_events to service_role;
grant execute on function public.consume_tool_credit(uuid, text) to service_role;

-- P0 uses SUPABASE_SERVICE_ROLE_KEY from Next.js route handlers only.
-- Do not expose service role keys to the browser.

insert into public.redemption_codes(code, source)
values
  ('WECHAT-DEMO-0001', 'wechat-community'),
  ('WECHAT-DEMO-0002', 'wechat-community'),
  ('WECHAT-DEMO-0003', 'wechat-community')
on conflict (code) do nothing;
