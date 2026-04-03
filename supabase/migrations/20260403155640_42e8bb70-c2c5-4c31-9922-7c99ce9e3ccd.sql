ALTER TABLE public.content_approvals 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.financial_clients(id) ON DELETE SET NULL;