
-- Allow anonymous users to update proposals they can view (for signing)
CREATE POLICY "Anon can sign shared proposals"
ON public.proposals
FOR UPDATE
TO anon
USING (share_token IS NOT NULL AND status <> 'draft')
WITH CHECK (share_token IS NOT NULL AND status <> 'draft');
