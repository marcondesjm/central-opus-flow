
-- Create comments table for kanban deals
CREATE TABLE public.kanban_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.kanban_deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kanban_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view comments on their deals"
  ON public.kanban_comments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.kanban_deals WHERE id = deal_id AND user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Users can create comments on their deals"
  ON public.kanban_comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.kanban_deals WHERE id = deal_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own comments"
  ON public.kanban_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_comments;
