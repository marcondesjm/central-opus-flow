
CREATE OR REPLACE FUNCTION public.log_idea_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, entity_name)
    VALUES (NEW.user_id, 'create', 'idea', NEW.id, NEW.title);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.position IS DISTINCT FROM OLD.position AND
       NEW.title = OLD.title AND NEW.description IS NOT DISTINCT FROM OLD.description AND
       NEW.roadmap = OLD.roadmap AND NEW.impact = OLD.impact AND NEW.effort = OLD.effort AND
       NEW.progress = OLD.progress AND NEW.theme = OLD.theme THEN
      RETURN NEW;
    END IF;
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, entity_name)
    VALUES (NEW.user_id, 'update', 'idea', NEW.id, NEW.title);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, entity_name)
    VALUES (OLD.user_id, 'delete', 'idea', OLD.id, OLD.title);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_idea_change
  AFTER INSERT OR UPDATE OR DELETE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.log_idea_activity();
