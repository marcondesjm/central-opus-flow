-- Fix the permissive INSERT policy for collaboration_notifications
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.collaboration_notifications;

-- Only authenticated users can create notifications
CREATE POLICY "Authenticated users can create notifications"
ON public.collaboration_notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);