-- Create profiles for all existing users that don't have one
INSERT INTO public.profiles (user_id, email, onboarding_completed, onboarding_step, has_connected_account, has_created_project)
SELECT 
  id as user_id,
  email,
  true as onboarding_completed, -- Existing users already saw the system, mark as completed
  14 as onboarding_step,
  true as has_connected_account,
  true as has_created_project
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, onboarding_completed, onboarding_step, has_connected_account, has_created_project)
  VALUES (
    NEW.id,
    NEW.email,
    false,
    0,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();