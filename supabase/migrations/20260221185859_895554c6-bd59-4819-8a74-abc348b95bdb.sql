
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Project owners can manage checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "Collaborators can view checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "Collaborators can update checklists" ON public.project_checklists;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Project owners can manage checklists"
ON public.project_checklists
FOR ALL
TO authenticated
USING (is_project_owner(auth.uid(), project_id))
WITH CHECK (is_project_owner(auth.uid(), project_id));

CREATE POLICY "Collaborators can view checklists"
ON public.project_checklists
FOR SELECT
TO authenticated
USING (has_project_access(auth.uid(), project_id));

CREATE POLICY "Collaborators can update checklists"
ON public.project_checklists
FOR UPDATE
TO authenticated
USING (has_project_access(auth.uid(), project_id))
WITH CHECK (has_project_access(auth.uid(), project_id));
