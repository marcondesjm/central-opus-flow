
-- Lead notes/annotations
CREATE TABLE public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lead notes" ON public.lead_notes
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Add archived flag and pipeline_stages to leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Add custom stages JSON to pipelines
ALTER TABLE public.lead_pipelines ADD COLUMN IF NOT EXISTS stages JSONB NOT NULL DEFAULT '[
  {"name": "Novo Lead", "color": "blue"},
  {"name": "Primeiro Contato", "color": "yellow"},
  {"name": "Proposta Enviada", "color": "purple"},
  {"name": "Negociação", "color": "orange"},
  {"name": "Fechado", "color": "green"}
]'::jsonb;
