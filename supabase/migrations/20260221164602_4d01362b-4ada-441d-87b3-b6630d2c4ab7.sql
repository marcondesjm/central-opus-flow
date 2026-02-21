
-- Create a validation trigger that prevents anyone other than marcondesgestaotrafego@gmail.com from being admin
CREATE OR REPLACE FUNCTION public.enforce_admin_email_restriction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  -- Only check if the role being set is 'admin'
  IF NEW.role = 'admin' THEN
    -- Get the email of the user
    SELECT email INTO _email FROM auth.users WHERE id = NEW.user_id;
    
    -- Only allow admin for the specific email
    IF _email IS NULL OR _email != 'marcondesgestaotrafego@gmail.com' THEN
      RAISE EXCEPTION 'Apenas o email autorizado pode receber o papel de administrador.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop if exists, then create trigger
DROP TRIGGER IF EXISTS enforce_admin_restriction ON public.user_roles;
CREATE TRIGGER enforce_admin_restriction
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_admin_email_restriction();

-- Also prevent deletion of the admin role for the authorized email
CREATE OR REPLACE FUNCTION public.prevent_admin_role_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  IF OLD.role = 'admin' THEN
    SELECT email INTO _email FROM auth.users WHERE id = OLD.user_id;
    IF _email = 'marcondesgestaotrafego@gmail.com' THEN
      RAISE EXCEPTION 'Não é permitido remover o papel de administrador do email principal.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS prevent_admin_deletion ON public.user_roles;
CREATE TRIGGER prevent_admin_deletion
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_role_deletion();
