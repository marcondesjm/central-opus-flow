
CREATE TABLE public.quick_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'review', 'done')),
  template_id TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quick_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quick_tasks" ON public.quick_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own quick_tasks" ON public.quick_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quick_tasks" ON public.quick_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quick_tasks" ON public.quick_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_quick_tasks_updated_at
  BEFORE UPDATE ON public.quick_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
