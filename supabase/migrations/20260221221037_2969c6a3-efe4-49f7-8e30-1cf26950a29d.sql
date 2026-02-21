
-- Create kanban deals table
CREATE TABLE public.kanban_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  description TEXT,
  phase TEXT NOT NULL DEFAULT 'prospeccao',
  progress INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Enable RLS
ALTER TABLE public.kanban_deals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own deals" ON public.kanban_deals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals" ON public.kanban_deals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals" ON public.kanban_deals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals" ON public.kanban_deals
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all deals" ON public.kanban_deals
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Updated_at trigger
CREATE TRIGGER update_kanban_deals_updated_at
  BEFORE UPDATE ON public.kanban_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
