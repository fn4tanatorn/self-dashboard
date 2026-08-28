create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- The service role key used below is stored in Supabase Vault (see
-- `select vault.create_secret('<key>', 'service_role_key')`), never committed
-- to source control.
select
  cron.schedule(
    'dispatch-push-notifications',
    '* * * * *',
    $$
    select
      net.http_post(
        url := 'https://cwcxhtplspkqtfhuejic.supabase.co/functions/v1/dispatch-notifications',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (
            select decrypted_secret from vault.decrypted_secrets
            where name = 'service_role_key'
            limit 1
          )
        )
      ) as request_id;
    $$
  );
