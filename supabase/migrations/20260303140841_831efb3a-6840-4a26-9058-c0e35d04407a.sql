
-- Tabela de cupons
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  plan subscription_plan NOT NULL DEFAULT 'business',
  duration_days integer NOT NULL DEFAULT 30,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_by uuid DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de resgates de cupons
CREATE TABLE public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  redeemed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Coupons policies
CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Anyone can read active coupons by code"
  ON public.coupons FOR SELECT
  USING (is_active = true);

-- Coupon redemptions policies
CREATE POLICY "Admins can view all redemptions"
  ON public.coupon_redemptions FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can insert their own redemptions"
  ON public.coupon_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own redemptions"
  ON public.coupon_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for updated_at on coupons
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
