
CREATE TABLE public.whatsapp_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  target_phase TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations"
ON public.whatsapp_automations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own automations"
ON public.whatsapp_automations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automations"
ON public.whatsapp_automations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own automations"
ON public.whatsapp_automations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_whatsapp_automations_updated_at
BEFORE UPDATE ON public.whatsapp_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
