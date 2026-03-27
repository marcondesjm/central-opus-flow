
ALTER TABLE public.financial_services 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.financial_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_period text DEFAULT 'mensal',
ADD COLUMN IF NOT EXISTS show_public boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS show_leads_form boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
