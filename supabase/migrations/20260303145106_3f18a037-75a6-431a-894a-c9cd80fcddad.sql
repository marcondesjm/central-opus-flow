-- Table to track IP addresses used during signup
CREATE TABLE public.signup_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one IP can only sign up once
CREATE UNIQUE INDEX idx_signup_ips_unique ON public.signup_ips (ip_address);

-- Index for quick lookups
CREATE INDEX idx_signup_ips_user ON public.signup_ips (user_id);

-- Enable RLS
ALTER TABLE public.signup_ips ENABLE ROW LEVEL SECURITY;

-- Only admins can read this table
CREATE POLICY "Admins can view all signup IPs"
  ON public.signup_ips FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No direct inserts from clients (only via edge function with service role)
CREATE POLICY "No direct insert"
  ON public.signup_ips FOR INSERT
  TO authenticated
  WITH CHECK (false);
