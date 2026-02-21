
-- Fix security definer view by adding security_invoker
DROP VIEW IF EXISTS public.admin_users_view;

CREATE VIEW public.admin_users_view WITH (security_invoker=on) AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.avatar_url,
  p.created_at,
  p.onboarding_completed,
  COALESCE(s.plan, 'free'::subscription_plan) as plan,
  COALESCE(s.max_accounts, 1) as max_accounts,
  COALESCE(s.max_projects, 20) as max_projects,
  s.started_at as subscription_started_at,
  s.expires_at as subscription_expires_at,
  s.is_trial,
  s.trial_ends_at,
  s.user_status,
  COALESCE(s.subscription_type, 'monthly') as subscription_type,
  COALESCE(ur.role, 'viewer'::app_role) as role,
  COALESCE(ac.accounts_count, 0) as accounts_count,
  COALESCE(pc.projects_count, 0) as projects_count
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.user_id
LEFT JOIN user_roles ur ON ur.user_id = p.user_id
LEFT JOIN LATERAL (
  SELECT COUNT(*)::bigint as accounts_count 
  FROM lovable_accounts la 
  WHERE la.user_id = p.user_id
) ac ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::bigint as projects_count 
  FROM projects pr 
  WHERE pr.user_id = p.user_id
) pc ON true;
