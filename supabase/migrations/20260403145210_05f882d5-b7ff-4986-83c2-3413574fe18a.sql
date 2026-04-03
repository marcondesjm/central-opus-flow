
-- Create storage bucket for social media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Social media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-media');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload social media files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own files
CREATE POLICY "Users can update their own social media files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own files
CREATE POLICY "Users can delete their own social media files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'social-media' AND auth.uid()::text = (storage.foldername(name))[1]);
