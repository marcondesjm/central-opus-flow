
-- Fix project_collaborators policies (all restrictive -> permissive)
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Collaborators can view project collaborators" ON public.project_collaborators;
DROP POLICY IF EXISTS "Invited users can accept invitations" ON public.project_collaborators;

CREATE POLICY "Project owners can manage collaborators"
ON public.project_collaborators FOR ALL TO authenticated
USING (is_project_owner(auth.uid(), project_id))
WITH CHECK (is_project_owner(auth.uid(), project_id));

CREATE POLICY "Collaborators can view project collaborators"
ON public.project_collaborators FOR SELECT TO authenticated
USING (has_project_access(auth.uid(), project_id));

CREATE POLICY "Invited users can accept invitations"
ON public.project_collaborators FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (user_id = auth.uid() OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Also allow invited users to see their own invitations
CREATE POLICY "Users can see their invitations"
ON public.project_collaborators FOR SELECT TO authenticated
USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Fix account_collaborators policies
DROP POLICY IF EXISTS "Account owners can manage collaborators" ON public.account_collaborators;
DROP POLICY IF EXISTS "Collaborators can view account collaborators" ON public.account_collaborators;
DROP POLICY IF EXISTS "Invited users can accept account invitations" ON public.account_collaborators;

CREATE POLICY "Account owners can manage collaborators"
ON public.account_collaborators FOR ALL TO authenticated
USING (is_account_owner(auth.uid(), account_id))
WITH CHECK (is_account_owner(auth.uid(), account_id));

CREATE POLICY "Collaborators can view account collaborators"
ON public.account_collaborators FOR SELECT TO authenticated
USING (has_account_access(auth.uid(), account_id));

CREATE POLICY "Invited users can accept account invitations"
ON public.account_collaborators FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (user_id = auth.uid() OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can see their account invitations"
ON public.account_collaborators FOR SELECT TO authenticated
USING (invited_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Fix collaboration_notifications policies
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.collaboration_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.collaboration_notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.collaboration_notifications;

CREATE POLICY "Authenticated users can create notifications"
ON public.collaboration_notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
ON public.collaboration_notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications"
ON public.collaboration_notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);
