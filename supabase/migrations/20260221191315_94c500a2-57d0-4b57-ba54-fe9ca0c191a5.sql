
-- Fix project_collaborators: change all policies from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Collaborators can view project collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Invited users can accept invitations" ON public.project_collaborators;
DROP POLICY IF EXISTS "Users can see their invitations" ON public.project_collaborators;

CREATE POLICY "Project owners can manage collaborators"
ON public.project_collaborators FOR ALL
TO authenticated
USING (is_project_owner(auth.uid(), project_id))
WITH CHECK (is_project_owner(auth.uid(), project_id));

CREATE POLICY "Collaborators can view project collaborators"
ON public.project_collaborators FOR SELECT
TO authenticated
USING (has_project_access(auth.uid(), project_id));

CREATE POLICY "Invited users can accept invitations"
ON public.project_collaborators FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()) OR (invited_email = get_auth_email()))
WITH CHECK ((user_id = auth.uid()) OR (invited_email = get_auth_email()));

CREATE POLICY "Users can see their invitations"
ON public.project_collaborators FOR SELECT
TO authenticated
USING (invited_email = get_auth_email());

-- Fix account_collaborators too
DROP POLICY IF EXISTS "Account owners can manage collaborators" ON public.account_collaborators;
DROP POLICY IF EXISTS "Collaborators can view account collaborators" ON public.account_collaborators;
DROP POLICY IF EXISTS "Invited users can accept account invitations" ON public.account_collaborators;
DROP POLICY IF EXISTS "Users can see their account invitations" ON public.account_collaborators;

CREATE POLICY "Account owners can manage collaborators"
ON public.account_collaborators FOR ALL
TO authenticated
USING (is_account_owner(auth.uid(), account_id))
WITH CHECK (is_account_owner(auth.uid(), account_id));

CREATE POLICY "Collaborators can view account collaborators"
ON public.account_collaborators FOR SELECT
TO authenticated
USING (has_account_access(auth.uid(), account_id));

CREATE POLICY "Invited users can accept account invitations"
ON public.account_collaborators FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()) OR (invited_email = get_auth_email()))
WITH CHECK ((user_id = auth.uid()) OR (invited_email = get_auth_email()));

CREATE POLICY "Users can see their account invitations"
ON public.account_collaborators FOR SELECT
TO authenticated
USING (invited_email = get_auth_email());
