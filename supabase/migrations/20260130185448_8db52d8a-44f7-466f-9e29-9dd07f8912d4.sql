-- Add new fields to lovable_accounts for Supabase project details
ALTER TABLE public.lovable_accounts
ADD COLUMN IF NOT EXISTS admin_email text,
ADD COLUMN IF NOT EXISTS supabase_project_id text,
ADD COLUMN IF NOT EXISTS supabase_url text,
ADD COLUMN IF NOT EXISTS anon_key text,
ADD COLUMN IF NOT EXISTS service_role_key text,
ADD COLUMN IF NOT EXISTS notes text;