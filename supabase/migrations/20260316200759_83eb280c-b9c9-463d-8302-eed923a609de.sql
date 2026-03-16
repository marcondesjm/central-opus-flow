
-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  client_logo_url TEXT,
  proposal_title TEXT NOT NULL DEFAULT 'Proposta Comercial',
  description TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_value NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  payment_conditions TEXT,
  deadline_days INTEGER DEFAULT 30,
  validity_days INTEGER DEFAULT 15,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  brand_color TEXT NOT NULL DEFAULT '#3b82f6',
  brand_secondary_color TEXT NOT NULL DEFAULT '#1e293b',
  company_name TEXT,
  company_logo_url TEXT,
  company_email TEXT,
  company_phone TEXT,
  company_address TEXT,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own proposals"
  ON public.proposals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all proposals"
  ON public.proposals FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public access via share token (for client viewing)
CREATE POLICY "Anyone can view shared proposals"
  ON public.proposals FOR SELECT
  TO anon, authenticated
  USING (share_token IS NOT NULL AND status != 'draft');

-- Storage bucket for proposal logos
INSERT INTO storage.buckets (id, name, public) VALUES ('proposal-assets', 'proposal-assets', true);

-- Storage policies
CREATE POLICY "Users can upload proposal assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proposal-assets');

CREATE POLICY "Users can update their proposal assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'proposal-assets');

CREATE POLICY "Anyone can view proposal assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'proposal-assets');

CREATE POLICY "Users can delete their proposal assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'proposal-assets');
