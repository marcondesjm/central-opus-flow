-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create projects in accessible accounts" ON public.projects;

-- Create a simpler INSERT policy that checks ownership correctly
CREATE POLICY "Users can create projects in their accounts"
ON public.projects
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND is_account_owner(auth.uid(), account_id)
);

-- Also update the SELECT policy to be more inclusive for owners
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;

CREATE POLICY "Users can view accessible projects"
ON public.projects
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_project_access(auth.uid(), id)
);