
CREATE TABLE public.content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'post',
  title TEXT,
  description TEXT,
  briefing TEXT,
  media_urls TEXT[] DEFAULT '{}',
  cover_url TEXT,
  video_link TEXT,
  platforms TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  due_date DATE,
  due_time TEXT DEFAULT '00:00',
  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT NOT NULL DEFAULT 'normal',
  client_id UUID REFERENCES public.financial_clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category TEXT,
  content_subtype TEXT,
  checklist JSONB DEFAULT '[]',
  notes TEXT,
  linked_task_id UUID REFERENCES public.kanban_deals(id) ON DELETE SET NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content_items"
  ON public.content_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own content_items"
  ON public.content_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content_items"
  ON public.content_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content_items"
  ON public.content_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
