
-- Table for sharing kanban spaces with other users
CREATE TABLE public.kanban_space_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.kanban_spaces(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (space_id, shared_with)
);

ALTER TABLE public.kanban_space_shares ENABLE ROW LEVEL SECURITY;

-- Owner of the space can manage shares
CREATE POLICY "Space owner can manage shares"
  ON public.kanban_space_shares FOR ALL
  TO authenticated
  USING (
    shared_by = auth.uid()
    OR shared_with = auth.uid()
    OR public.is_admin()
  )
  WITH CHECK (
    shared_by = auth.uid()
    OR public.is_admin()
  );

-- Add is_shared column to kanban_spaces for quick check
ALTER TABLE public.kanban_spaces ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
