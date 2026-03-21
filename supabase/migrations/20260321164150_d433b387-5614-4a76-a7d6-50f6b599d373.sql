INSERT INTO public.system_config (key, value, updated_at)
VALUES ('last_build_timestamp', '', now())
ON CONFLICT (key) DO NOTHING;