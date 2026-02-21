-- Add client contact fields to kanban_deals
ALTER TABLE public.kanban_deals 
ADD COLUMN client_email text DEFAULT NULL,
ADD COLUMN client_whatsapp text DEFAULT NULL;