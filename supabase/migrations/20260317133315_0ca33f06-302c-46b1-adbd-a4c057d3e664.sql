
-- Create kanban_spaces table
CREATE TABLE public.kanban_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add space_id to kanban_deals (nullable for backward compat)
ALTER TABLE public.kanban_deals ADD COLUMN space_id UUID REFERENCES public.kanban_spaces(id) ON DELETE SET NULL;

-- Add space_id to kanban_columns (nullable for backward compat)
ALTER TABLE public.kanban_columns ADD COLUMN space_id UUID REFERENCES public.kanban_spaces(id) ON DELETE SET NULL;

-- Add assignee_id to kanban_deals
ALTER TABLE public.kanban_deals ADD COLUMN assignee_id UUID;

-- Enable RLS
ALTER TABLE public.kanban_spaces ENABLE ROW LEVEL SECURITY;

-- RLS policies for kanban_spaces
CREATE POLICY "Users can manage their own spaces" ON public.kanban_spaces FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all spaces" ON public.kanban_spaces FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Index for performance
CREATE INDEX idx_kanban_deals_space_id ON public.kanban_deals(space_id);
CREATE INDEX idx_kanban_deals_assignee_id ON public.kanban_deals(assignee_id);
CREATE INDEX idx_kanban_columns_space_id ON public.kanban_columns(space_id);
