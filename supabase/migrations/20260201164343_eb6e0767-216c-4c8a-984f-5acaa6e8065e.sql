-- Add cargo and area fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cargo text,
ADD COLUMN IF NOT EXISTS area_atuacao text;