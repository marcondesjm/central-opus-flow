CREATE OR REPLACE FUNCTION public.auto_log_activity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _action text;
  _entity_name text;
  _user_id uuid;
  _entity_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _action := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    _action := 'update';
  ELSIF TG_OP = 'DELETE' THEN
    _action := 'delete';
  END IF;

  IF TG_TABLE_NAME = 'projects' THEN
    _entity_type := 'project';
    IF TG_OP = 'DELETE' THEN
      _user_id := OLD.user_id;
      _entity_name := OLD.name;
    ELSE
      _user_id := NEW.user_id;
      _entity_name := NEW.name;
    END IF;
  ELSIF TG_TABLE_NAME = 'lovable_accounts' THEN
    _entity_type := 'account';
    IF TG_OP = 'DELETE' THEN
      _user_id := OLD.user_id;
      _entity_name := OLD.name;
    ELSE
      _user_id := NEW.user_id;
      _entity_name := NEW.name;
    END IF;
  ELSIF TG_TABLE_NAME = 'kanban_deals' THEN
    _entity_type := 'deal';
    IF TG_OP = 'DELETE' THEN
      _user_id := OLD.user_id;
      _entity_name := OLD.client_name || ' - ' || OLD.company_name;
    ELSE
      _user_id := NEW.user_id;
      _entity_name := NEW.client_name || ' - ' || NEW.company_name;
    END IF;
  ELSIF TG_TABLE_NAME = 'proposals' THEN
    _entity_type := 'proposal';
    IF TG_OP = 'DELETE' THEN
      _user_id := OLD.user_id;
      _entity_name := OLD.proposal_title;
    ELSE
      _user_id := NEW.user_id;
      _entity_name := NEW.proposal_title;
    END IF;
  ELSIF TG_TABLE_NAME = 'tags' THEN
    _entity_type := 'tag';
    IF TG_OP = 'DELETE' THEN
      _user_id := OLD.user_id;
      _entity_name := OLD.name;
    ELSE
      _user_id := NEW.user_id;
      _entity_name := NEW.name;
    END IF;
  ELSE
    _entity_type := TG_TABLE_NAME;
    IF TG_OP = 'DELETE' THEN
      _user_id := OLD.user_id;
      _entity_name := NULL;
    ELSE
      _user_id := NEW.user_id;
      _entity_name := NEW.name;
    END IF;
  END IF;

  -- For updates on kanban_deals, skip position-only updates
  IF TG_TABLE_NAME = 'kanban_deals' AND TG_OP = 'UPDATE' THEN
    IF OLD.phase = NEW.phase AND OLD.client_name = NEW.client_name AND OLD.company_name = NEW.company_name 
       AND OLD.priority = NEW.priority AND OLD.progress = NEW.progress 
       AND COALESCE(OLD.description, '') = COALESCE(NEW.description, '')
       AND COALESCE(OLD.assignee_name, '') = COALESCE(NEW.assignee_name, '')
       AND OLD.due_date IS NOT DISTINCT FROM NEW.due_date THEN
      RETURN NEW;
    END IF;
  END IF;

  -- For updates on projects, skip if only view_count or last_accessed_at changed
  IF TG_TABLE_NAME = 'projects' AND TG_OP = 'UPDATE' THEN
    IF OLD.name = NEW.name AND OLD.status = NEW.status AND OLD.progress = NEW.progress
       AND COALESCE(OLD.description, '') = COALESCE(NEW.description, '')
       AND COALESCE(OLD.url, '') = COALESCE(NEW.url, '') THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, entity_name)
  VALUES (
    _user_id,
    _action,
    _entity_type,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    _entity_name
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$;