
-- Add payment_method and category to kanban_payments
ALTER TABLE public.kanban_payments 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pix',
ADD COLUMN IF NOT EXISTS category text DEFAULT 'projeto';

-- Create expenses table for tracking costs
CREATE TABLE IF NOT EXISTS public.kanban_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  deal_id uuid REFERENCES public.kanban_deals(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  description text,
  category text NOT NULL DEFAULT 'geral',
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expenses"
ON public.kanban_expenses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all expenses"
ON public.kanban_expenses FOR ALL
USING (is_admin())
WITH CHECK (is_admin());
