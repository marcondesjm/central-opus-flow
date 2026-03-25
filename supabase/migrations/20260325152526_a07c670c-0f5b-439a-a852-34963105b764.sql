
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read settings
CREATE POLICY "Anyone can read system settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default pricing settings
INSERT INTO public.system_settings (key, value) VALUES
  ('pricing', '{"monthly_price": 7.90, "annual_price": 73.90}'::jsonb),
  ('pix', '{"pix_key": "+5548996029392", "pix_name": "Marcondes Jorge Machado", "pix_city": "BRASILIA"}'::jsonb);
