
-- Tabela de pagamentos vinculados a deals do Kanban
CREATE TABLE public.kanban_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.kanban_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_kanban_payments_updated_at
  BEFORE UPDATE ON public.kanban_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.kanban_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own payments"
  ON public.kanban_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.kanban_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
  ON public.kanban_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments"
  ON public.kanban_payments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
  ON public.kanban_payments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
