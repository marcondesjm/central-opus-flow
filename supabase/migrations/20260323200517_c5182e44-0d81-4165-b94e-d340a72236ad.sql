
-- Allow anon users to update project_versions for shared projects
CREATE POLICY "Anon can update versions of shared projects"
ON public.project_versions
FOR UPDATE
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_versions.project_id
    AND p.share_token IS NOT NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_versions.project_id
    AND p.share_token IS NOT NULL
  )
);

-- Allow anon users to insert feedback on shared projects
CREATE POLICY "Anon can insert feedback on shared projects"
ON public.project_feedback
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_feedback.project_id
    AND p.share_token IS NOT NULL
  )
);

-- Allow anon users to view feedback on shared projects
CREATE POLICY "Anon can view feedback on shared projects"
ON public.project_feedback
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_feedback.project_id
    AND p.share_token IS NOT NULL
  )
);
