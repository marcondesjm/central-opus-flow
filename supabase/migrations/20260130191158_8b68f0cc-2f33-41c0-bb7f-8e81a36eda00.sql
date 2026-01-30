-- Tabela para armazenar versão e configurações do sistema
CREATE TABLE public.system_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política de leitura para todos os usuários autenticados
CREATE POLICY "Anyone can read system config"
ON public.system_config
FOR SELECT
TO authenticated
USING (true);

-- Política de leitura pública (para versão visível na landing)
CREATE POLICY "Public can read system config"
ON public.system_config
FOR SELECT
TO anon
USING (true);

-- Apenas admins podem atualizar
CREATE POLICY "Only admins can update system config"
ON public.system_config
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert system config"
ON public.system_config
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_system_config_updated_at
BEFORE UPDATE ON public.system_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir versão inicial
INSERT INTO public.system_config (key, value, description)
VALUES 
    ('app_version', '1.2.0', 'Versão atual do sistema'),
    ('release_name', 'Multi-Account Management', 'Nome da release atual'),
    ('changelog', 'Adicionado campos de configuração Supabase nas contas|Melhorias no accordion do modal de cadastro|Botão de ações mais visível nos cards de projeto|Sistema de versão sincronizado com banco de dados', 'Changelog da versão atual (separado por |)');

-- Função para atualizar a versão do sistema
CREATE OR REPLACE FUNCTION public.update_system_version(
    new_version TEXT,
    new_release_name TEXT DEFAULT NULL,
    new_changelog TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Atualizar versão
    UPDATE public.system_config 
    SET value = new_version, updated_at = now()
    WHERE key = 'app_version';
    
    -- Atualizar nome da release se fornecido
    IF new_release_name IS NOT NULL THEN
        UPDATE public.system_config 
        SET value = new_release_name, updated_at = now()
        WHERE key = 'release_name';
    END IF;
    
    -- Atualizar changelog se fornecido
    IF new_changelog IS NOT NULL THEN
        UPDATE public.system_config 
        SET value = new_changelog, updated_at = now()
        WHERE key = 'changelog';
    END IF;
END;
$$;