
-- Create cron job to check expired license keys every hour
SELECT cron.schedule(
  'check-expired-license-keys',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT value FROM public.system_config WHERE key = 'supabase_url' LIMIT 1) || '/functions/v1/check-expired-keys',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (SELECT value FROM public.system_config WHERE key = 'service_role_key' LIMIT 1),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
