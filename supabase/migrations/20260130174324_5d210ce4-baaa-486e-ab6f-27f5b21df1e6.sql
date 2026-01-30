-- Create table for pre-configured deadline notification messages
CREATE TABLE public.deadline_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  days_before INTEGER NOT NULL DEFAULT 2,
  message_template TEXT NOT NULL DEFAULT 'O projeto "{{project_name}}" tem prazo em {{days}} dias ({{deadline_date}}). Por favor, verifique o status.',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notify_owner BOOLEAN NOT NULL DEFAULT true,
  notify_collaborators BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.deadline_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own settings"
  ON public.deadline_notification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON public.deadline_notification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.deadline_notification_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Table to track sent deadline notifications (avoid duplicates)
CREATE TABLE public.deadline_notifications_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  deadline_date DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id, deadline_date)
);

-- Enable RLS
ALTER TABLE public.deadline_notifications_sent ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sent notifications"
  ON public.deadline_notifications_sent
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.deadline_notifications_sent
  FOR INSERT
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_deadline_notification_settings_updated_at
  BEFORE UPDATE ON public.deadline_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();