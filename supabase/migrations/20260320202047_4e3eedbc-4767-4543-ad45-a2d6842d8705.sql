
-- Add last access tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_sign_in_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_session_minutes integer DEFAULT 0;

-- Recreate admin_users_view to include new columns
DROP VIEW IF EXISTS public.admin_users_view;
CREATE VIEW public.admin_users_view AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.avatar_url,
  p.created_at,
  p.onboarding_completed,
  p.last_sign_in_at,
  p.last_active_at,
  p.total_session_minutes,
  s.plan,
  s.max_accounts,
  s.max_projects,
  s.started_at AS subscription_started_at,
  s.expires_at AS subscription_expires_at,
  s.is_trial,
  s.trial_ends_at,
  s.user_status,
  s.subscription_type,
  COALESCE(ur.role, 'viewer'::app_role) AS role,
  (SELECT COUNT(*) FROM public.lovable_accounts la WHERE la.user_id = p.user_id) AS accounts_count,
  (SELECT COUNT(*) FROM public.projects pr WHERE pr.user_id = p.user_id) AS projects_count
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.user_id
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id;
