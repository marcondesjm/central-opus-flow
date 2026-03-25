
-- Allow users to view spaces shared with them
CREATE POLICY "Users can view shared spaces"
  ON public.kanban_spaces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.kanban_space_shares
      WHERE kanban_space_shares.space_id = kanban_spaces.id
        AND kanban_space_shares.shared_with = auth.uid()
    )
  );
