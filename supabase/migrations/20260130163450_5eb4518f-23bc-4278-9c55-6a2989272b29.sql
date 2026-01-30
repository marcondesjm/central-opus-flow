-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;

-- Create a more flexible INSERT policy that allows:
-- 1. Project owner creates project (user_id = auth.uid())
-- 2. User has access to the account (owner or collaborator)
CREATE POLICY "Users can create projects in accessible accounts" 
ON public.projects 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND has_account_access(auth.uid(), account_id)
);

-- Also update UPDATE policy to allow collaborators with editor/admin role
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;

CREATE POLICY "Users can update accessible projects" 
ON public.projects 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR has_project_access(auth.uid(), id)
)
WITH CHECK (
  auth.uid() = user_id 
  OR has_project_access(auth.uid(), id)
);