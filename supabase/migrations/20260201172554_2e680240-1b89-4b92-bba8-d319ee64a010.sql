-- Create changelog_entries table for tracking all system changes
CREATE TABLE public.changelog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'feature' CHECK (type IN ('feature', 'fix', 'improvement', 'security', 'breaking')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read public changelog entries
CREATE POLICY "Anyone can read public changelog entries"
ON public.changelog_entries
FOR SELECT
USING (is_public = true);

-- Admins can manage changelog entries
CREATE POLICY "Admins can manage changelog entries"
ON public.changelog_entries
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create index for faster queries
CREATE INDEX idx_changelog_entries_version ON public.changelog_entries(version);
CREATE INDEX idx_changelog_entries_created_at ON public.changelog_entries(created_at DESC);

-- Insert initial changelog entries
INSERT INTO public.changelog_entries (version, title, description, type) VALUES
  ('1.0.0', 'Lançamento Inicial', 'Primeira versão do sistema com gerenciamento de contas e projetos', 'feature'),
  ('1.1.0', 'Melhorias de UI', 'Correções de scroll no painel de Keys, animações flutuantes na página de login', 'improvement'),
  ('1.1.0', 'Emails em Português', 'Edge Function para envio de emails de autenticação em português via Resend', 'feature'),
  ('1.1.0', 'Sistema de Changelog', 'Sistema automático de registro de alterações do sistema', 'feature');