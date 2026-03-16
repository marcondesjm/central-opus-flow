
ALTER TABLE public.kanban_scheduled_messages 
ADD COLUMN scheduled_time time DEFAULT '09:00:00';
