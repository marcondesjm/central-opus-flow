
-- Add share_token column
ALTER TABLE public.content_approvals ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_content_approvals_share_token ON public.content_approvals(share_token);

-- Allow anonymous read by share_token
CREATE POLICY "Anyone can view approval by token"
ON public.content_approvals
FOR SELECT
USING (share_token IS NOT NULL AND share_token != '');

-- Allow anonymous update (approve/reject) by share_token
CREATE POLICY "Anyone can respond to approval by token"
ON public.content_approvals
FOR UPDATE
USING (share_token IS NOT NULL AND share_token != '')
WITH CHECK (share_token IS NOT NULL AND share_token != '');
