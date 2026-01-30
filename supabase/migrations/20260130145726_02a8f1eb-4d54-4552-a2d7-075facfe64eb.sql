-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_connected_account boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS has_created_project boolean NOT NULL DEFAULT false;