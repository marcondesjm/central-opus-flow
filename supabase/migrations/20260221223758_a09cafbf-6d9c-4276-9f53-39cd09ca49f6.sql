
-- Add new columns to kanban_deals for advanced task management
ALTER TABLE public.kanban_deals
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS due_date timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assignee_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS color text DEFAULT NULL;

-- Create kanban_columns table for customizable columns
CREATE TABLE public.kanban_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  position integer NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own columns"
ON public.kanban_columns FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all columns"
ON public.kanban_columns FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create kanban_task_checklist table
CREATE TABLE public.kanban_task_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.kanban_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kanban_task_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own task checklists"
ON public.kanban_task_checklist FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all task checklists"
ON public.kanban_task_checklist FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_kanban_columns_updated_at
BEFORE UPDATE ON public.kanban_columns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kanban_task_checklist_updated_at
BEFORE UPDATE ON public.kanban_task_checklist
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
