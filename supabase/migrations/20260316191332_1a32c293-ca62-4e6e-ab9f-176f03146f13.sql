
-- Insert subscription for demo user (upsert)
INSERT INTO public.subscriptions (user_id, plan, max_accounts, max_projects, user_status, is_trial, payment_status, features, subscription_type)
VALUES (
  '9c629c0c-3716-43ca-a939-44f423d7c65d',
  'pro',
  999,
  999,
  'active',
  false,
  'paid',
  '{"advanced_search": true, "tags": true, "logs": true, "export": true, "team": true}'::jsonb,
  'monthly'
)
ON CONFLICT (user_id) DO UPDATE SET
  plan = 'pro',
  max_accounts = 999,
  max_projects = 999,
  user_status = 'active',
  is_trial = false,
  payment_status = 'paid',
  features = '{"advanced_search": true, "tags": true, "logs": true, "export": true, "team": true}'::jsonb;

-- Insert role for demo user (upsert)
INSERT INTO public.user_roles (user_id, role)
VALUES ('9c629c0c-3716-43ca-a939-44f423d7c65d', 'viewer')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profile with avatar
UPDATE public.profiles SET
  avatar_url = 'https://ui-avatars.com/api/?name=Usuario+Central&background=7c3aed&color=fff&size=200',
  full_name = 'Usuário Central',
  whatsapp = '48999999999',
  onboarding_completed = true,
  onboarding_step = 5,
  has_connected_account = true,
  has_created_project = true
WHERE user_id = '9c629c0c-3716-43ca-a939-44f423d7c65d';
