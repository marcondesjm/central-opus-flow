
-- 1. Criar tabela project_stats para estatísticas de projetos
CREATE TABLE IF NOT EXISTS public.project_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  avg_session_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- 2. Criar tabela api_tokens para tokens de API
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Criar tabela billing para dados financeiros
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  invoice_url TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela audit_logs para logs internos do sistema
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.project_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para project_stats (usuários podem ver/gerenciar suas próprias estatísticas)
CREATE POLICY "stats_select_own" ON public.project_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "stats_insert_own" ON public.project_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "stats_update_own" ON public.project_stats
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas para api_tokens (BLOQUEIO TOTAL - apenas service_role)
CREATE POLICY "tokens_no_frontend_access" ON public.api_tokens
  FOR ALL USING (false);

-- Políticas para billing (BLOQUEIO TOTAL - dados sensíveis)
CREATE POLICY "billing_no_frontend_access" ON public.billing
  FOR ALL USING (false);

-- Políticas para audit_logs (BLOQUEIO TOTAL - logs internos)
CREATE POLICY "logs_no_frontend_access" ON public.audit_logs
  FOR ALL USING (false);

-- Admins podem ver audit_logs
CREATE POLICY "admins_can_view_audit_logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_project_stats_updated_at
  BEFORE UPDATE ON public.project_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_tokens_updated_at
  BEFORE UPDATE ON public.api_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_updated_at
  BEFORE UPDATE ON public.billing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função segura para contar projetos (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_project_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM projects
  WHERE user_id = auth.uid();
$$;

-- Função segura para obter estatísticas agregadas
CREATE OR REPLACE FUNCTION public.get_user_stats_summary()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_projects', (SELECT COUNT(*) FROM projects WHERE user_id = auth.uid()),
    'total_accounts', (SELECT COUNT(*) FROM lovable_accounts WHERE user_id = auth.uid()),
    'total_views', (SELECT COALESCE(SUM(views_count), 0) FROM project_stats WHERE user_id = auth.uid())
  );
$$;

-- Revogar acesso anônimo às tabelas sensíveis
REVOKE ALL ON public.api_tokens FROM anon;
REVOKE ALL ON public.billing FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;
