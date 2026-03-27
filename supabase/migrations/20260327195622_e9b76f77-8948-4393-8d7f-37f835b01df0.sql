CREATE POLICY "Public can view public services"
ON public.financial_services
FOR SELECT
TO anon, authenticated
USING (show_public = true AND status = 'active');