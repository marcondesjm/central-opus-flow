
-- Create helper function to get current user email safely
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Fix project_collaborators policies that reference auth.users
DROP POLICY IF EXISTS "Invited users can accept invitations" ON public.project_collaborators;
DROP POLICY IF EXISTS "Users can see their invitations" ON public.project_collaborators;

CREATE POLICY "Invited users can accept invitations"
ON public.project_collaborators FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR invited_email = public.get_auth_email())
WITH CHECK (user_id = auth.uid() OR invited_email = public.get_auth_email());

CREATE POLICY "Users can see their invitations"
ON public.project_collaborators FOR SELECT TO authenticated
USING (invited_email = public.get_auth_email());

-- Fix account_collaborators policies that reference auth.users
DROP POLICY IF EXISTS "Invited users can accept account invitations" ON public.account_collaborators;
DROP POLICY IF EXISTS "Users can see their account invitations" ON public.account_collaborators;

CREATE POLICY "Invited users can accept account invitations"
ON public.account_collaborators FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR invited_email = public.get_auth_email())
WITH CHECK (user_id = auth.uid() OR invited_email = public.get_auth_email());

CREATE POLICY "Users can see their account invitations"
ON public.account_collaborators FOR SELECT TO authenticated
USING (invited_email = public.get_auth_email());
