
-- Quotes/Orçamentos table
CREATE TABLE public.financial_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.financial_clients(id) ON DELETE SET NULL,
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  title text NOT NULL,
  description text,
  validity_days integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'draft',
  -- Services stored as JSON array
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  -- Payment conditions
  is_recurring boolean NOT NULL DEFAULT false,
  recurring_months integer,
  payment_method text,
  payment_conditions text,
  project_start_type text DEFAULT 'days_after_approval',
  project_start_days integer DEFAULT 3,
  project_start_date date,
  delivery_days integer DEFAULT 30,
  proposal_validity_days integer DEFAULT 30,
  first_payment_type text DEFAULT 'days_after_signature',
  first_payment_days integer DEFAULT 30,
  first_payment_date date,
  -- Signature
  signed_at timestamptz,
  signature_data text,
  signer_name text,
  signer_ip text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own quotes" ON public.financial_quotes
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public view quotes by token" ON public.financial_quotes
  FOR SELECT TO anon
  USING (share_token IS NOT NULL);
