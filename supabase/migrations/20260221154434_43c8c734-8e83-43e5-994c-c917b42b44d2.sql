-- Add attachment fields to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;