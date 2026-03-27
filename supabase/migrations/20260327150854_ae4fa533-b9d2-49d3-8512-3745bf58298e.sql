
-- Bio Links table
CREATE TABLE public.bio_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'Seu Nome',
  bio TEXT DEFAULT 'Criador de conteúdo e designer',
  avatar_url TEXT,
  slug TEXT NOT NULL,
  bg_style TEXT NOT NULL DEFAULT 'gradient_blue',
  bg_color_1 TEXT DEFAULT '#1a1a2e',
  bg_color_2 TEXT DEFAULT '#16213e',
  button_style TEXT NOT NULL DEFAULT 'rounded',
  button_color TEXT DEFAULT '#3b82f6',
  button_text_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#ffffff',
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(slug),
  UNIQUE(user_id)
);

ALTER TABLE public.bio_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bio links"
  ON public.bio_links FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view published bio links"
  ON public.bio_links FOR SELECT
  TO anon
  USING (is_published = true);

-- Bio link analytics
CREATE TABLE public.bio_link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bio_link_id UUID REFERENCES public.bio_links(id) ON DELETE CASCADE NOT NULL,
  link_index INTEGER NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE public.bio_link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view bio link clicks"
  ON public.bio_link_clicks FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bio_links WHERE id = bio_link_id AND user_id = auth.uid()));

CREATE POLICY "Anyone can insert bio link clicks"
  ON public.bio_link_clicks FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Auth can insert bio link clicks"
  ON public.bio_link_clicks FOR INSERT
  TO authenticated
  WITH CHECK (true);
