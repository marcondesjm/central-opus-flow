
-- Add signature fields for both client and company
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS client_signature_url text,
  ADD COLUMN IF NOT EXISTS client_signature_type text DEFAULT 'draw',
  ADD COLUMN IF NOT EXISTS client_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS client_signed_ip text,
  ADD COLUMN IF NOT EXISTS client_signer_name text,
  ADD COLUMN IF NOT EXISTS client_signer_document text,
  ADD COLUMN IF NOT EXISTS company_signature_url text,
  ADD COLUMN IF NOT EXISTS company_signature_type text DEFAULT 'draw',
  ADD COLUMN IF NOT EXISTS company_signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS company_signed_ip text,
  ADD COLUMN IF NOT EXISTS company_signer_name text,
  ADD COLUMN IF NOT EXISTS company_signer_document text,
  ADD COLUMN IF NOT EXISTS certificate_file_url text,
  ADD COLUMN IF NOT EXISTS certificate_file_name text;
