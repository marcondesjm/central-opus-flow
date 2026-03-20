
-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-files', 
  'user-files', 
  true, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf', 'application/zip', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage RLS policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view user files"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'user-files');

-- Create user_files metadata table
CREATE TABLE public.user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT 'other',
  mime_type TEXT,
  module TEXT NOT NULL DEFAULT 'general', -- 'general', 'ideas', 'projects', 'proposals'
  module_item_id UUID, -- optional: link to specific idea/project/proposal
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own files"
ON public.user_files FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
