CREATE POLICY "Anon can create lead notifications"
ON public.collaboration_notifications
FOR INSERT
TO anon
WITH CHECK (type = 'new_lead');