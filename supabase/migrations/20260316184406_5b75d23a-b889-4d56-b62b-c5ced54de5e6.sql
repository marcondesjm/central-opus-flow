
-- Tabela para armazenar chaves PIX do usuário
CREATE TABLE public.pix_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key_type text NOT NULL DEFAULT 'phone' CHECK (key_type IN ('phone', 'email', 'cpf', 'cnpj', 'random')),
  key_value text NOT NULL,
  holder_name text NOT NULL,
  holder_city text NOT NULL DEFAULT 'BRASILIA',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.pix_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pix keys"
  ON public.pix_keys FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all pix keys"
  ON public.pix_keys FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_pix_keys_updated_at
  BEFORE UPDATE ON public.pix_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Garantir apenas 1 chave padrão por usuário
CREATE OR REPLACE FUNCTION ensure_single_default_pix_key()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.pix_keys SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_single_default_pix_key_trigger
  BEFORE INSERT OR UPDATE ON public.pix_keys
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_pix_key();

-- Changelog
SELECT register_changelog(
  'Sistema PIX para cobranças',
  'Cadastro de chaves PIX pessoais, geração de QR Code com valor personalizado para cobrança de clientes e cópia da chave PIX.',
  'feature',
  'minor'
);
