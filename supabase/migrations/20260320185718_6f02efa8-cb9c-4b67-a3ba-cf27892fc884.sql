
-- Add an UPDATE policy on lovable_accounts to prevent updating sensitive key columns directly
-- Users should only store keys in localStorage (as per existing pattern)
-- Create a function to sanitize account updates, stripping key fields
CREATE OR REPLACE FUNCTION public.sanitize_account_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Always null out sensitive fields on update to prevent accidental storage
  NEW.anon_key := NULL;
  NEW.service_role_key := NULL;
  RETURN NEW;
END;
$$;

-- Create trigger to sanitize on update
DROP TRIGGER IF EXISTS trg_sanitize_account_update ON public.lovable_accounts;
CREATE TRIGGER trg_sanitize_account_update
  BEFORE UPDATE ON public.lovable_accounts
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_account_update();

-- Also sanitize on insert
DROP TRIGGER IF EXISTS trg_sanitize_account_insert ON public.lovable_accounts;
CREATE TRIGGER trg_sanitize_account_insert
  BEFORE INSERT ON public.lovable_accounts
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_account_update();
