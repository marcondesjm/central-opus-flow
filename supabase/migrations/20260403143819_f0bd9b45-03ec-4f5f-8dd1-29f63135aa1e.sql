
-- Add content management fields to social_posts
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'post',
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.financial_clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approval_notes TEXT,
  ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;
