-- Add DELETE policies for admins on all user-related tables

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (is_admin());

-- Admins can delete subscriptions
CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions FOR DELETE
TO authenticated
USING (is_admin());

-- Admins can delete accounts
CREATE POLICY "Admins can delete accounts"
ON public.lovable_accounts FOR DELETE
TO authenticated
USING (is_admin());

-- Admins can delete projects
CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (is_admin());

-- Admins can delete user_roles (already covered by the "Admins can manage roles" ALL policy, but adding explicit DELETE for clarity)
-- The ALL policy should cover this, but let's verify it's working