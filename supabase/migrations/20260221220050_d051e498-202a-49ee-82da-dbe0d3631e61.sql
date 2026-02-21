
-- Table to store WordPress connection credentials
CREATE TABLE public.wordpress_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  site_url TEXT NOT NULL,
  username TEXT NOT NULL,
  app_password TEXT NOT NULL,
  site_name TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wordpress_connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own WP connections"
  ON public.wordpress_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own WP connections"
  ON public.wordpress_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WP connections"
  ON public.wordpress_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WP connections"
  ON public.wordpress_connections FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all WP connections"
  ON public.wordpress_connections FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_wordpress_connections_updated_at
  BEFORE UPDATE ON public.wordpress_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for WordPress backup uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('wordpress-backups', 'wordpress-backups', false);

-- Storage policies
CREATE POLICY "Users can upload WP backups"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wordpress-backups' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their WP backups"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wordpress-backups' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their WP backups"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wordpress-backups' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all WP backups"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wordpress-backups' AND is_admin());
