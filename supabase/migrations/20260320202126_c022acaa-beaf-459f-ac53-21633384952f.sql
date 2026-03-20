
CREATE OR REPLACE FUNCTION public.update_session_activity(_user_id uuid, _minutes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    last_active_at = now(),
    total_session_minutes = COALESCE(total_session_minutes, 0) + _minutes
  WHERE user_id = _user_id;
END;
$$;
