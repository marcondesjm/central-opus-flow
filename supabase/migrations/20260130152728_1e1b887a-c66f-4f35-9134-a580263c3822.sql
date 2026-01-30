-- Add trial and payment fields to subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_started_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_receipt_url text,
ADD COLUMN IF NOT EXISTS payment_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS payment_verified_by uuid;

-- Create payment_receipts table for storing payment proofs
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  receipt_url text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 29.90,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  verified_at timestamp with time zone,
  verified_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_receipts
CREATE POLICY "Users can insert their own receipts"
ON public.payment_receipts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own receipts"
ON public.payment_receipts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all receipts"
ON public.payment_receipts
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can update all receipts"
ON public.payment_receipts
FOR UPDATE
USING (is_admin());

-- Update initialize_new_user function to set trial period
CREATE OR REPLACE FUNCTION public.initialize_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Create default subscription (free plan with 15-day trial)
  INSERT INTO public.subscriptions (
    user_id, 
    plan, 
    max_accounts, 
    max_projects, 
    features,
    is_trial,
    trial_started_at,
    trial_ends_at,
    payment_status
  )
  VALUES (
    NEW.id, 
    'pro', 
    999, 
    999, 
    '{"advanced_search": true, "tags": true, "logs": true, "export": true, "team": false}'::jsonb,
    true,
    now(),
    now() + interval '15 days',
    'pending'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default role (viewer for normal users)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Add trigger for updated_at on payment_receipts
CREATE TRIGGER update_payment_receipts_updated_at
BEFORE UPDATE ON public.payment_receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();