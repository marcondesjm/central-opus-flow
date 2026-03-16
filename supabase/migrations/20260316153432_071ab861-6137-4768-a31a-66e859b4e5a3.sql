
CREATE TABLE public.kanban_scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.kanban_deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  scheduled_date date NOT NULL,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scheduled messages"
  ON public.kanban_scheduled_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scheduled messages"
  ON public.kanban_scheduled_messages FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
