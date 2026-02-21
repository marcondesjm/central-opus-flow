
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS subtitle text,
ADD COLUMN IF NOT EXISTS secondary_image text,
ADD COLUMN IF NOT EXISTS show_attachment boolean NOT NULL DEFAULT false;
