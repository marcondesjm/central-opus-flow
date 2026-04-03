
ALTER TABLE public.content_approvals 
ADD COLUMN content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL;

CREATE INDEX idx_content_approvals_content_item_id ON public.content_approvals(content_item_id);
