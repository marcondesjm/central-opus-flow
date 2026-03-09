CREATE POLICY "Admins can view all accounts"
ON public.lovable_accounts
FOR SELECT
TO authenticated
USING (is_admin());