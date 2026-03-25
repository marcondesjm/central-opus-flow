
-- Allow users to SELECT columns from shared spaces
CREATE POLICY "Users can view shared space columns"
  ON public.kanban_columns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.kanban_space_shares
      WHERE kanban_space_shares.space_id = kanban_columns.space_id
        AND kanban_space_shares.shared_with = auth.uid()
    )
  );

-- Allow users to SELECT deals from shared spaces
CREATE POLICY "Users can view shared space deals"
  ON public.kanban_deals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.kanban_space_shares
      WHERE kanban_space_shares.space_id = kanban_deals.space_id
        AND kanban_space_shares.shared_with = auth.uid()
    )
  );
