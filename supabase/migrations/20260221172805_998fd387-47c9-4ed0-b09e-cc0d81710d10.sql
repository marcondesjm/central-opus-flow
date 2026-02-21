
-- Create table for multiple subtitle/text sections per blog post
CREATE TABLE public.blog_post_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_post_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can read sections of published posts
CREATE POLICY "Anyone can read sections of published posts"
  ON public.blog_post_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.blog_posts WHERE id = post_id AND is_published = true
  ));

-- Admins can manage all sections
CREATE POLICY "Admins can manage blog post sections"
  ON public.blog_post_sections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
