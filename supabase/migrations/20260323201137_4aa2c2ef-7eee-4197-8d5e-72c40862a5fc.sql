
CREATE POLICY "Anon can upload to public-feedback folder"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = 'public-feedback');
