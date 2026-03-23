DROP POLICY IF EXISTS "Users can insert history for their projects" ON public.project_history;

CREATE POLICY "Users can insert history for their projects"
  ON public.project_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_history.project_id
        AND (projects.user_id = auth.uid() OR public.has_project_access(auth.uid(), projects.id))
    )
  );