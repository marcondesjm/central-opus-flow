
-- Add last_modified_by column to kanban_deals
ALTER TABLE public.kanban_deals ADD COLUMN IF NOT EXISTS last_modified_by uuid;

-- Create trigger to auto-set last_modified_by on update
CREATE OR REPLACE FUNCTION public.set_deal_last_modified_by()
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

DROP TRIGGER IF EXISTS trg_set_deal_last_modified_by ON public.kanban_deals;
CREATE TRIGGER trg_set_deal_last_modified_by
  BEFORE INSERT OR UPDATE ON public.kanban_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_deal_last_modified_by();
