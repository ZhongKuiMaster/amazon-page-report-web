grant usage on schema public to service_role;

grant select, insert, update, delete on public.commercial_users to service_role;
grant select, insert, update, delete on public.tool_credit_balances to service_role;
grant select, insert, update, delete on public.tool_credit_ledger to service_role;
grant select, insert, update, delete on public.redemption_codes to service_role;
grant select, insert, update, delete on public.payment_orders to service_role;
grant select, insert, update, delete on public.wechat_private_domain_events to service_role;

grant execute on function public.consume_tool_credit(uuid, text) to service_role;
