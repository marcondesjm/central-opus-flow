-- Fix: Change the view to use security invoker instead of security definer
DROP VIEW IF EXISTS public.admin_users_view;

CREATE VIEW public.admin_users_view
WITH (security_invoker=on) AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.avatar_url,
  p.created_at,
  p.onboarding_completed,
  s.plan,
  s.max_accounts,
  s.max_projects,
  s.started_at as subscription_started_at,
  s.expires_at as subscription_expires_at,
  s.is_trial,
  s.trial_ends_at,
  s.user_status,
  COALESCE(ur.role, 'viewer'::app_role) as role,
  (SELECT COUNT(*) FROM public.lovable_accounts la WHERE la.user_id = p.user_id) as accounts_count,
  (SELECT COUNT(*) FROM public.projects pr WHERE pr.user_id = p.user_id) as projects_count
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.user_id
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id;

-- Admin can read this view
GRANT SELECT ON public.admin_users_view TO authenticated;