-- Criar função para atribuir admin automaticamente para email específico
CREATE OR REPLACE FUNCTION public.assign_admin_for_specific_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o email for o do administrador, atribuir role admin
  IF NEW.email = 'marcondesgestaotrafego@gmail.com' THEN
    -- Remover role padrão (viewer)
    DELETE FROM public.user_roles WHERE user_id = NEW.id AND role = 'viewer';
    
    -- Inserir role admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa após o trigger de inicialização
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_for_specific_email();