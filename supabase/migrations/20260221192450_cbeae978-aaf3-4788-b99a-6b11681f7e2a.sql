
-- Allow admins to manage project collaborators
CREATE POLICY "Admins can manage project collaborators"
ON public.project_collaborators FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Allow admins to manage account collaborators
CREATE POLICY "Admins can manage account collaborators"
ON public.account_collaborators FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Allow admins to manage checklists
CREATE POLICY "Admins can manage checklists"
ON public.project_checklists FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
