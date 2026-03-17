
-- Create ideas table
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'geral',
  theme_color TEXT NOT NULL DEFAULT '#3b82f6',
  description TEXT,
  hypothesis TEXT,
  validation TEXT,
  decision TEXT,
  impact INTEGER NOT NULL DEFAULT 0,
  effort INTEGER NOT NULL DEFAULT 0,
  roadmap TEXT NOT NULL DEFAULT 'later',
  progress INTEGER NOT NULL DEFAULT 0,
  insights_count INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  space_id UUID REFERENCES public.kanban_spaces(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own ideas" ON public.ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own ideas" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ideas" ON public.ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ideas" ON public.ideas FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all ideas" ON public.ideas FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
