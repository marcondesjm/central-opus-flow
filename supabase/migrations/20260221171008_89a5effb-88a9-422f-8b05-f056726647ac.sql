-- Allow admins to view all projects for monitoring
CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
USING (is_admin());