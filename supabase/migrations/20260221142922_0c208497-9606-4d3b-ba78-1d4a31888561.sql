
-- 1. Remove contributor_email from public changelog entries visibility
-- (already restricted by RLS, but clean up the column exposure)

-- 2. Create a secure view for lovable_accounts that hides sensitive keys
CREATE OR REPLACE VIEW public.lovable_accounts_safe
WITH (security_invoker = on) AS
SELECT 
  id, user_id, created_at, updated_at, credits, credits_updated_at,
  email, name, color, admin_email, supabase_project_id, supabase_url, notes,
  -- Mask sensitive keys - show only last 8 chars
  CASE WHEN anon_key IS NOT NULL THEN '••••••••' || RIGHT(anon_key, 8) ELSE NULL END as anon_key_masked,
  CASE WHEN service_role_key IS NOT NULL THEN '••••••••' || RIGHT(service_role_key, 8) ELSE NULL END as service_role_key_masked,
  -- Boolean indicators
  (anon_key IS NOT NULL AND anon_key != '') as has_anon_key,
  (service_role_key IS NOT NULL AND service_role_key != '') as has_service_role_key
FROM public.lovable_accounts;

-- 3. Remove contributor_email from public visibility in changelog
-- Update the column to be null for all public entries
UPDATE public.changelog_entries SET contributor_email = NULL WHERE is_public = true;
