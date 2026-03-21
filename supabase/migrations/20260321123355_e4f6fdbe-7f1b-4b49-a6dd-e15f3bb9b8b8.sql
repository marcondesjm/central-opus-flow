
-- Create license_keys table
CREATE TABLE public.license_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_code text NOT NULL UNIQUE,
  plan public.subscription_plan NOT NULL DEFAULT 'pro',
  duration_type text NOT NULL DEFAULT 'monthly' CHECK (duration_type IN ('monthly', 'annual')),
  duration_days integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'activated', 'revoked', 'expired')),
  activated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at timestamptz,
  activated_email text,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  batch_id text,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins full access to license_keys"
  ON public.license_keys FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can see their own activated keys
CREATE POLICY "Users can view own activated keys"
  ON public.license_keys FOR SELECT
  TO authenticated
  USING (activated_by = auth.uid());

-- Users can update available keys (for activation)
CREATE POLICY "Users can activate available keys"
  ON public.license_keys FOR UPDATE
  TO authenticated
  USING (status = 'available')
  WITH CHECK (activated_by = auth.uid());

-- Updated_at trigger
CREATE TRIGGER update_license_keys_updated_at
  BEFORE UPDATE ON public.license_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate a random license key
CREATE OR REPLACE FUNCTION public.generate_license_key_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
  segment integer;
BEGIN
  FOR segment IN 1..4 LOOP
    IF segment > 1 THEN
      result := result || '-';
    END IF;
    FOR i IN 1..5 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  RETURN result;
END;
$$;

-- Function to activate a license key and update subscription
CREATE OR REPLACE FUNCTION public.activate_license_key(_key_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _key record;
  _user_id uuid;
  _email text;
  _expires_at timestamptz;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;

  SELECT email INTO _email FROM auth.users WHERE id = _user_id;

  -- Find and lock the key
  SELECT * INTO _key FROM public.license_keys WHERE key_code = upper(trim(_key_code)) FOR UPDATE;

  IF _key IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Chave não encontrada');
  END IF;

  IF _key.status = 'activated' THEN
    RETURN json_build_object('success', false, 'error', 'Esta chave já foi ativada');
  END IF;

  IF _key.status = 'revoked' THEN
    RETURN json_build_object('success', false, 'error', 'Esta chave foi revogada');
  END IF;

  IF _key.status = 'expired' THEN
    RETURN json_build_object('success', false, 'error', 'Esta chave expirou');
  END IF;

  _expires_at := now() + (_key.duration_days || ' days')::interval;

  -- Activate the key
  UPDATE public.license_keys
  SET status = 'activated',
      activated_by = _user_id,
      activated_at = now(),
      activated_email = _email,
      expires_at = _expires_at
  WHERE id = _key.id;

  -- Update user subscription
  UPDATE public.subscriptions
  SET plan = _key.plan,
      is_trial = false,
      trial_ends_at = NULL,
      started_at = now(),
      expires_at = _expires_at,
      payment_status = 'confirmed',
      user_status = 'active',
      subscription_type = CASE WHEN _key.duration_type = 'annual' THEN 'annual' ELSE 'monthly' END,
      max_accounts = 999,
      max_projects = 999,
      features = '{"advanced_search": true, "tags": true, "logs": true, "export": true, "team": true}'::jsonb,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Log the activity
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, entity_name)
  VALUES (_user_id, 'activate', 'license_key', _key.id::text, _key.key_code);

  RETURN json_build_object(
    'success', true,
    'plan', _key.plan,
    'duration_type', _key.duration_type,
    'expires_at', _expires_at
  );
END;
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.license_keys;
