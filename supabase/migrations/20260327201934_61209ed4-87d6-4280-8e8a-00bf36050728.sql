ALTER TABLE public.portfolio_pages 
  ADD COLUMN IF NOT EXISTS brand_name text DEFAULT null,
  ADD COLUMN IF NOT EXISTS hide_badge boolean DEFAULT false;