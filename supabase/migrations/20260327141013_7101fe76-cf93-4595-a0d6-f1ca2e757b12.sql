
-- Expand financial_clients with full address and metadata
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS address_complement TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS project_interest TEXT;
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS avatar_color TEXT DEFAULT '#22c55e';
ALTER TABLE public.financial_clients ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Client technical data (ficha técnica) - JSONB for flexibility
CREATE TABLE public.client_technical_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.financial_clients(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, section)
);
ALTER TABLE public.client_technical_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own client_technical_data" ON public.client_technical_data
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Public access for share_token registration
CREATE POLICY "Public can insert clients via share token" ON public.financial_clients
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public can read by share token" ON public.financial_clients
  FOR SELECT TO anon USING (share_token IS NOT NULL);
