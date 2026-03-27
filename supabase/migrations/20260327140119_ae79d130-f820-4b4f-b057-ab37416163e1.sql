
-- Financial categories (user-defined)
CREATE TABLE public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  type TEXT NOT NULL DEFAULT 'receita' CHECK (type IN ('receita', 'despesa')),
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial_categories" ON public.financial_categories
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Financial clients
CREATE TABLE public.financial_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial_clients" ON public.financial_clients
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Financial suppliers
CREATE TABLE public.financial_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial_suppliers" ON public.financial_suppliers
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Financial services catalog
CREATE TABLE public.financial_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  default_price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial_services" ON public.financial_services
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Financial transactions (unified receivables & payables)
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'receita' CHECK (type IN ('receita', 'despesa')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'parcial', 'pago', 'vencido', 'cancelado')),
  payment_mode TEXT NOT NULL DEFAULT 'avista' CHECK (payment_mode IN ('avista', 'parcelado', 'recorrente')),
  installments INT DEFAULT 1,
  installment_number INT DEFAULT 1,
  parent_id UUID REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.financial_clients(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.financial_suppliers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  expense_type TEXT DEFAULT 'avulsa' CHECK (expense_type IN ('avulsa', 'recorrente')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial_transactions" ON public.financial_transactions
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Financial recurring (subscriptions/recurring expenses)
CREATE TABLE public.financial_recurring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'receita' CHECK (type IN ('receita', 'despesa')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  client_id UUID REFERENCES public.financial_clients(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.financial_suppliers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_recurring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial_recurring" ON public.financial_recurring
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
