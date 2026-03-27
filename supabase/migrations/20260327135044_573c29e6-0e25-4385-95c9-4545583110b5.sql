
-- Lead pipelines
CREATE TABLE public.lead_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pipelines" ON public.lead_pipelines
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.lead_pipelines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  cpf_cnpj TEXT,
  cep TEXT,
  address TEXT,
  address_number TEXT,
  address_complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  project_interest TEXT,
  estimated_value NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  phase TEXT NOT NULL DEFAULT 'novo_lead',
  position INTEGER NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'manual',
  webhook_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own leads" ON public.leads
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Lead webhooks
CREATE TABLE public.lead_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pipeline_id UUID REFERENCES public.lead_pipelines(id) ON DELETE SET NULL,
  auto_tags TEXT[] DEFAULT '{}',
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  leads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own webhooks" ON public.lead_webhooks
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Public policy for webhook token lookup (edge function uses service role, but just in case)
CREATE POLICY "Public can read webhook by token" ON public.lead_webhooks
  FOR SELECT TO anon USING (is_active = true);

-- Allow anon inserts for webhook-captured leads
CREATE POLICY "Anon can insert leads via webhook" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);
