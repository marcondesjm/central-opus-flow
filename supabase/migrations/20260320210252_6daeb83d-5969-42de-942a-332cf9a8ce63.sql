
CREATE TABLE public.admin_scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  send_to text NOT NULL DEFAULT 'all',
  target_user_id uuid,
  scheduled_at timestamp with time zone NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled messages"
ON public.admin_scheduled_messages
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
