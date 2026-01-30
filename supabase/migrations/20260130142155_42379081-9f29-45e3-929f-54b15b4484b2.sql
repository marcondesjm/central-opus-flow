-- Create storage bucket for project covers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-covers', 'project-covers', true);

-- Allow authenticated users to upload their own covers
CREATE POLICY "Users can upload project covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-covers' 
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to covers
CREATE POLICY "Project covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-covers');

-- Allow users to update their own covers
CREATE POLICY "Users can update their own covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-covers' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own covers
CREATE POLICY "Users can delete their own covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-covers' AND auth.uid() IS NOT NULL);