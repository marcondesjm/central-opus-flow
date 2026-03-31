
-- Replace admin email functions to read from system_config instead of hardcoded email
-- This prevents the admin email from appearing in migration files

-- First, ensure there's a system_config entry for admin email
INSERT INTO public.system_config (key, value) 
VALUES ('admin_email', (
  SELECT email FROM auth.users u 
  JOIN public.user_roles ur ON ur.user_id = u.id 
  WHERE ur.role = 'admin' 
  LIMIT 1
))
ON CONFLICT (key) DO NOTHING;

-- Replace assign_admin function to use system_config
CREATE OR REPLACE FUNCTION public.assign_admin_for_specific_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin_email text;
BEGIN
  SELECT value INTO _admin_email FROM public.system_config WHERE key = 'admin_email';
  
  IF _admin_email IS NOT NULL AND NEW.email = _admin_email THEN
    DELETE FROM public.user_roles WHERE user_id = NEW.id AND role = 'viewer';
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Replace enforce_admin_email_restriction to use system_config
CREATE OR REPLACE FUNCTION public.enforce_admin_email_restriction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
  _admin_email text;
BEGIN
  IF NEW.role = 'admin' THEN
    SELECT email INTO _email FROM auth.users WHERE id = NEW.user_id;
    SELECT value INTO _admin_email FROM public.system_config WHERE key = 'admin_email';
    
    IF _admin_email IS NULL OR _email IS NULL OR _email != _admin_email THEN
      RAISE EXCEPTION 'Apenas o email autorizado pode receber o papel de administrador.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Replace prevent_admin_role_deletion to use system_config
CREATE OR REPLACE FUNCTION public.prevent_admin_role_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _email text;
  _admin_email text;
BEGIN
  IF OLD.role = 'admin' THEN
    SELECT email INTO _email FROM auth.users WHERE id = OLD.user_id;
    SELECT value INTO _admin_email FROM public.system_config WHERE key = 'admin_email';
    
    IF _admin_email IS NOT NULL AND _email = _admin_email THEN
      RAISE EXCEPTION 'Não é permitido remover o papel de administrador do email principal.';
    END IF;
  END IF;
  RETURN OLD;
END;
$function$;
