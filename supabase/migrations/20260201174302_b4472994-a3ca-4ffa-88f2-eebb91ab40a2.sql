-- Add contributor name field to changelog entries
ALTER TABLE public.changelog_entries 
ADD COLUMN contributor_name TEXT,
ADD COLUMN contributor_email TEXT;