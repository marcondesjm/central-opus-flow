
-- Fix project_checklists: change all policies from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Project owners can manage checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "Collaborators can view checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "Collaborators can update checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "Users with access can insert checklists" ON public.project_checklists;

CREATE POLICY "Project owners can manage checklists"
ON public.project_checklists FOR ALL
TO authenticated
USING (is_project_owner(auth.uid(), project_id))
WITH CHECK (is_project_owner(auth.uid(), project_id));

CREATE POLICY "Collaborators can view checklists"
ON public.project_checklists FOR SELECT
TO authenticated
USING (has_project_access(auth.uid(), project_id));

CREATE POLICY "Collaborators can update checklists"
ON public.project_checklists FOR UPDATE
TO authenticated
USING (has_project_access(auth.uid(), project_id))
WITH CHECK (has_project_access(auth.uid(), project_id));

CREATE POLICY "Users with access can insert checklists"
ON public.project_checklists FOR INSERT
TO authenticated
WITH CHECK (has_project_access(auth.uid(), project_id) AND auth.uid() = user_id);
