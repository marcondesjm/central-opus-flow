
-- Add repository_url to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS repository_url text DEFAULT NULL;

-- Create project_files table for file uploads with versioning
CREATE TABLE public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text NOT NULL DEFAULT 'application/octet-stream',
  version integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_files
CREATE POLICY "Users can view files of their projects"
  ON public.project_files FOR SELECT
  USING (has_project_access(auth.uid(), project_id));

CREATE POLICY "Users can insert files to their projects"
  ON public.project_files FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_project_access(auth.uid(), project_id));

CREATE POLICY "Users can delete files of their own projects"
  ON public.project_files FOR DELETE
  USING (is_project_owner(auth.uid(), project_id));

CREATE POLICY "Admins can manage all project files"
  ON public.project_files FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create project-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project-files bucket
CREATE POLICY "Users can upload project files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view project files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');

CREATE POLICY "Users can delete their project files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- Create project_code_snippets table for inline code
CREATE TABLE public.project_code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Sem título',
  language text NOT NULL DEFAULT 'javascript',
  code text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.project_code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view snippets of their projects"
  ON public.project_code_snippets FOR SELECT
  USING (has_project_access(auth.uid(), project_id));

CREATE POLICY "Users can insert snippets to their projects"
  ON public.project_code_snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_project_access(auth.uid(), project_id));

CREATE POLICY "Users can update snippets of their projects"
  ON public.project_code_snippets FOR UPDATE
  USING (has_project_access(auth.uid(), project_id));

CREATE POLICY "Users can delete snippets of their own projects"
  ON public.project_code_snippets FOR DELETE
  USING (is_project_owner(auth.uid(), project_id));

CREATE POLICY "Admins can manage all snippets"
  ON public.project_code_snippets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
