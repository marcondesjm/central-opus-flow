
-- Allow anon to upload signature files to proposal-assets
CREATE POLICY "Anon can upload signatures"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'proposal-assets' AND (name LIKE 'signatures/%'));
