
-- Add last_modified_by column to ideas
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS last_modified_by uuid;

-- Create trigger to auto-set last_modified_by on insert/update
CREATE OR REPLACE FUNCTION public.set_idea_last_modified_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.last_modified_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_idea_last_modified_by ON public.ideas;
CREATE TRIGGER trg_set_idea_last_modified_by
  BEFORE INSERT OR UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_idea_last_modified_by();
