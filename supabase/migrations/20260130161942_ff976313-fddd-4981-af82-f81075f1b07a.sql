-- Create project_history table to track all changes
CREATE TABLE public.project_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  user_name TEXT,
  user_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view history of their own projects
CREATE POLICY "Users can view history of their projects"
ON public.project_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_history.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Policy: Collaborators can view history
CREATE POLICY "Collaborators can view project history"
ON public.project_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_collaborators 
    WHERE project_collaborators.project_id = project_history.project_id 
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.accepted_at IS NOT NULL
  )
);

-- Policy: Users can insert history for their projects
CREATE POLICY "Users can insert history for their projects"
ON public.project_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_history.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Policy: Collaborators with editor/admin role can insert history
CREATE POLICY "Collaborators can insert project history"
ON public.project_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_collaborators 
    WHERE project_collaborators.project_id = project_history.project_id 
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.accepted_at IS NOT NULL
    AND project_collaborators.role IN ('editor', 'admin')
  )
);

-- Create index for faster queries
CREATE INDEX idx_project_history_project_id ON public.project_history(project_id);
CREATE INDEX idx_project_history_created_at ON public.project_history(created_at DESC);