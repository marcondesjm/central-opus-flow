-- Fix permissive RLS policy by restricting insert to service role only
DROP POLICY IF EXISTS "System can insert notifications" ON public.deadline_notifications_sent;

-- Create policy that allows the service role to insert (edge functions use service role)
-- and users can only insert their own records
CREATE POLICY "Users and system can insert notifications"
  ON public.deadline_notifications_sent
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');