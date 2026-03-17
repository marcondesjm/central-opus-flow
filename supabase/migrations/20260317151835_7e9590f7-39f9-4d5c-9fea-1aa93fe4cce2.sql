
INSERT INTO storage.buckets (id, name, public) VALUES ('kanban-images', 'kanban-images', true);

CREATE POLICY "Authenticated users can upload kanban images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'kanban-images');

CREATE POLICY "Anyone can view kanban images"
ON storage.objects FOR SELECT
USING (bucket_id = 'kanban-images');

CREATE POLICY "Users can delete their own kanban images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'kanban-images' AND auth.uid()::text = (storage.foldername(name))[1]);
