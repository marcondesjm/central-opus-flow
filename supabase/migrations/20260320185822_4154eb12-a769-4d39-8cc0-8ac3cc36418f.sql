
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view comments on their deals" ON public.kanban_comments;
DROP POLICY IF EXISTS "Users can create comments on their deals" ON public.kanban_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.kanban_comments;

-- Recreate with admin support
CREATE POLICY "Users can view comments on their deals"
  ON public.kanban_comments FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.kanban_deals WHERE id = deal_id AND user_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Users can create comments"
  ON public.kanban_comments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (SELECT 1 FROM public.kanban_deals WHERE id = deal_id AND user_id = auth.uid())
      OR is_admin()
    )
  );

CREATE POLICY "Users can delete their own comments"
  ON public.kanban_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR is_admin());
