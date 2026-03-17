
-- Add start_date and end_date for timeline view
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS end_date date;
