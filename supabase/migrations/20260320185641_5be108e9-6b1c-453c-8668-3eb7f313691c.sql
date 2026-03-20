
-- Create a safe profiles view that excludes sensitive fields like whatsapp
CREATE OR REPLACE VIEW public.profiles_safe
WITH (security_invoker=on) AS
  SELECT 
    user_id,
    full_name,
    avatar_url,
    cargo,
    area_atuacao,
    created_at
  FROM public.profiles;

-- Add policy so all authenticated users can read limited profile info for collaboration features
CREATE POLICY "Authenticated users can view basic profile info"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- Note: existing policies already restrict to own profile + admin.
-- The new policy allows basic profile reads for collaboration (Teams page, modified-by, etc.)
-- But the view restricts which COLUMNS are exposed.
