-- Add credits column to lovable_accounts
ALTER TABLE public.lovable_accounts 
ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;

-- Add credits_updated_at to track when credits were last modified
ALTER TABLE public.lovable_accounts 
ADD COLUMN credits_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();