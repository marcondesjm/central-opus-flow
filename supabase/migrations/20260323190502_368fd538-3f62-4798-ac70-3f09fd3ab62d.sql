
-- Project versions table
CREATE TABLE public.project_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  preview_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project feedback table
CREATE TABLE public.project_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_id UUID REFERENCES public.project_versions(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_type TEXT NOT NULL DEFAULT 'client',
  comment TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add share_token and max_revisions to projects
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS share_token TEXT DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS max_revisions INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Enable RLS
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_feedback ENABLE ROW LEVEL SECURITY;

-- RLS for project_versions
CREATE POLICY "Users can manage their own versions" ON public.project_versions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all versions" ON public.project_versions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public read for shared projects (via share_token checked in app)
CREATE POLICY "Anyone can view versions of shared projects" ON public.project_versions
  FOR SELECT TO anon
  USING (true);

-- RLS for project_feedback
CREATE POLICY "Users can manage feedback on their projects" ON public.project_feedback
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_feedback.project_id AND projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_feedback.project_id AND projects.user_id = auth.uid()));

CREATE POLICY "Anyone can add feedback" ON public.project_feedback
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view feedback" ON public.project_feedback
  FOR SELECT TO anon
  USING (true);

-- Allow anon to read projects by share_token
CREATE POLICY "Anon can view shared projects" ON public.projects
  FOR SELECT TO anon
  USING (share_token IS NOT NULL);

-- Allow anon to update project status (approve/reject)
CREATE POLICY "Anon can update shared project status" ON public.projects
  FOR UPDATE TO anon
  USING (share_token IS NOT NULL)
  WITH CHECK (share_token IS NOT NULL);

-- Enable realtime for versions and feedback
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_feedback;
