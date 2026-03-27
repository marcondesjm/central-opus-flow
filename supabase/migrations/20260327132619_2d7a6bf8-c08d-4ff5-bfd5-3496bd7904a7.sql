
-- Briefings table
CREATE TABLE public.briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  briefing_type TEXT NOT NULL DEFAULT 'logo',
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  responses JSONB DEFAULT '[]'::jsonb,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Briefing question templates
CREATE TABLE public.briefing_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  briefing_type TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for briefings
CREATE POLICY "Users can view own briefings" ON public.briefings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own briefings" ON public.briefings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own briefings" ON public.briefings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own briefings" ON public.briefings FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Public can view briefing by token" ON public.briefings FOR SELECT TO anon USING (share_token IS NOT NULL);
CREATE POLICY "Public can update briefing responses" ON public.briefings FOR UPDATE TO anon USING (share_token IS NOT NULL) WITH CHECK (share_token IS NOT NULL);

-- RLS policies for briefing_templates
CREATE POLICY "Users can manage own templates" ON public.briefing_templates FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
