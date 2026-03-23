DROP POLICY IF EXISTS "Users can insert history for their projects" ON public.project_history;

CREATE POLICY "Users can insert history for accessible projects"
ON public.project_history
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.has_project_access(auth.uid(), project_id)
);