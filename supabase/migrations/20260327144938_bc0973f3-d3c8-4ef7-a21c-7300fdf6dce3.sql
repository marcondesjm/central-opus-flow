
-- Portfolio pages
CREATE TABLE public.portfolio_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Meu Portfólio',
  slug TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#ec4899',
  secondary_color TEXT DEFAULT '#8b5cf6',
  bg_color TEXT DEFAULT '#0a0a0a',
  text_color TEXT DEFAULT '#ffffff',
  font_heading TEXT DEFAULT 'Inter',
  font_body TEXT DEFAULT 'Inter',
  lead_capture_type TEXT DEFAULT 'standard',
  lead_capture_url TEXT,
  lead_capture_fields JSONB DEFAULT '[]'::jsonb,
  whatsapp_number TEXT,
  instagram_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(slug)
);

-- Portfolio sections/blocks
CREATE TABLE public.portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.portfolio_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  content JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Portfolio leads captured
CREATE TABLE public.portfolio_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.portfolio_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  service_interest TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.portfolio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_leads ENABLE ROW LEVEL SECURITY;

-- portfolio_pages policies
CREATE POLICY "Users manage own pages" ON public.portfolio_pages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Public can view published pages" ON public.portfolio_pages FOR SELECT TO anon USING (is_published = true);

-- portfolio_sections policies
CREATE POLICY "Users manage own sections" ON public.portfolio_sections FOR ALL TO authenticated USING (page_id IN (SELECT id FROM public.portfolio_pages WHERE user_id = auth.uid())) WITH CHECK (page_id IN (SELECT id FROM public.portfolio_pages WHERE user_id = auth.uid()));
CREATE POLICY "Public can view published sections" ON public.portfolio_sections FOR SELECT TO anon USING (page_id IN (SELECT id FROM public.portfolio_pages WHERE is_published = true));

-- portfolio_leads policies
CREATE POLICY "Anyone can submit leads" ON public.portfolio_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users view own leads" ON public.portfolio_leads FOR SELECT TO authenticated USING (page_id IN (SELECT id FROM public.portfolio_pages WHERE user_id = auth.uid()));

-- Storage bucket for portfolio assets
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

CREATE POLICY "Users upload portfolio files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users manage portfolio files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete portfolio files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public read portfolio files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
