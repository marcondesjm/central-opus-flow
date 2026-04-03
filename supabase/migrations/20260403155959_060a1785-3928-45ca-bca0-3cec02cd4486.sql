ALTER TABLE public.portfolio_pages 
ADD COLUMN IF NOT EXISTS pipeline_id uuid REFERENCES public.lead_pipelines(id) ON DELETE SET NULL;