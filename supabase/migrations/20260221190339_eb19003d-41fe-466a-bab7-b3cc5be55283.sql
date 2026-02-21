
-- Add INSERT policy for users with project access (collaborators)
CREATE POLICY "Users with access can insert checklists"
ON public.project_checklists
FOR INSERT
TO authenticated
WITH CHECK (has_project_access(auth.uid(), project_id) AND auth.uid() = user_id);
