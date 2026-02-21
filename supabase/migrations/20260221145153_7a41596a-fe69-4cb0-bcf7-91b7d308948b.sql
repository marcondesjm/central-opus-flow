
-- Update initialize_new_user to set user_status as pending_approval
CREATE OR REPLACE FUNCTION public.initialize_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create default subscription (free plan with 15-day trial) - pending admin approval
  INSERT INTO public.subscriptions (
    user_id, 
    plan, 
    max_accounts, 
    max_projects, 
    features,
    is_trial,
    trial_started_at,
    trial_ends_at,
    payment_status,
    user_status
  )
  VALUES (
    NEW.id, 
    'pro', 
    999, 
    999, 
    '{"advanced_search": true, "tags": true, "logs": true, "export": true, "team": false}'::jsonb,
    true,
    now(),
    now() + interval '15 days',
    'pending',
    'pending_approval'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create default role (viewer for normal users)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;
