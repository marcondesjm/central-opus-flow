-- Create checklist items table
CREATE TABLE public.project_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_checklists ENABLE ROW LEVEL SECURITY;

-- Policies for project owners
CREATE POLICY "Project owners can manage checklists"
ON public.project_checklists
FOR ALL
USING (is_project_owner(auth.uid(), project_id))
WITH CHECK (is_project_owner(auth.uid(), project_id));

-- Policies for collaborators to view
CREATE POLICY "Collaborators can view checklists"
ON public.project_checklists
FOR SELECT
USING (has_project_access(auth.uid(), project_id));

-- Policies for collaborators to update (mark as complete)
CREATE POLICY "Collaborators can update checklists"
ON public.project_checklists
FOR UPDATE
USING (has_project_access(auth.uid(), project_id))
WITH CHECK (has_project_access(auth.uid(), project_id));

-- Add trigger for updated_at
CREATE TRIGGER update_project_checklists_updated_at
BEFORE UPDATE ON public.project_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_checklists;

-- Create index for faster queries
CREATE INDEX idx_project_checklists_project_id ON public.project_checklists(project_id);
CREATE INDEX idx_project_checklists_position ON public.project_checklists(project_id, position);