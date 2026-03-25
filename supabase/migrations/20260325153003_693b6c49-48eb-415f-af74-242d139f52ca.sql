
CREATE TABLE public.admin_temp_passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  temp_password text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.admin_temp_passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage temp passwords"
  ON public.admin_temp_passwords FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
