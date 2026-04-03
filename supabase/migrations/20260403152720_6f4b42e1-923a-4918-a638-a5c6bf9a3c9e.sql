
CREATE TABLE public.content_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own approvals" ON public.content_approvals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own approvals" ON public.content_approvals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own approvals" ON public.content_approvals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own approvals" ON public.content_approvals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_content_approvals_updated_at
  BEFORE UPDATE ON public.content_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
