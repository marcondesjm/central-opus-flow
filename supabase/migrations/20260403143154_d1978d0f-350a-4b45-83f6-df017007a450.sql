
-- Social Accounts
CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL DEFAULT 'instagram',
  account_name TEXT NOT NULL,
  account_username TEXT,
  account_avatar_url TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own social accounts" ON public.social_accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Social Posts
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  media_urls TEXT[] DEFAULT '{}',
  platform TEXT NOT NULL DEFAULT 'instagram',
  post_type TEXT NOT NULL DEFAULT 'feed',
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  external_post_id TEXT,
  hashtags TEXT[] DEFAULT '{}',
  notes TEXT,
  client_approved BOOLEAN NOT NULL DEFAULT false,
  client_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own social posts" ON public.social_posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Social Metrics
CREATE TABLE public.social_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  engagement_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own social metrics" ON public.social_metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
