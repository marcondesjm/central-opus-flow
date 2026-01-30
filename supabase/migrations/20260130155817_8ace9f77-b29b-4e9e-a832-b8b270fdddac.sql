-- Add deadline column to projects table
ALTER TABLE public.projects 
ADD COLUMN deadline timestamp with time zone DEFAULT NULL;

-- Add index for deadline queries
CREATE INDEX idx_projects_deadline ON public.projects(deadline) WHERE deadline IS NOT NULL;