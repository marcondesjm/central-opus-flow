-- Add progress/completion percentage to projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Add comment for clarity
COMMENT ON COLUMN public.projects.progress IS 'Project completion percentage (0-100)';

-- Create admin-only view for all users and subscriptions (for admin panel)
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.avatar_url,
  p.created_at,
  p.onboarding_completed,
  COALESCE(s.plan, 'free') as plan,
  COALESCE(s.max_accounts, 1) as max_accounts,
  COALESCE(s.max_projects, 20) as max_projects,
  s.started_at as subscription_started_at,
  s.expires_at as subscription_expires_at,
  COALESCE(r.role, 'viewer') as role,
  (SELECT COUNT(*) FROM public.lovable_accounts la WHERE la.user_id = p.user_id) as accounts_count,
  (SELECT COUNT(*) FROM public.projects proj WHERE proj.user_id = p.user_id) as projects_count
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.user_id
LEFT JOIN public.user_roles r ON r.user_id = p.user_id;

-- RLS for admin view - only admins can see it
ALTER VIEW public.admin_users_view SET (security_invoker = on);

-- Create policy function for admin-only access to profiles (for admin operations)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Allow admins to update all subscriptions
CREATE POLICY "Admins can update all subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (public.is_admin());