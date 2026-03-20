
-- Create triggers for auto-logging activity on key tables
CREATE TRIGGER trg_auto_log_projects
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_activity();

CREATE TRIGGER trg_auto_log_accounts
  AFTER INSERT OR UPDATE OR DELETE ON public.lovable_accounts
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_activity();

CREATE TRIGGER trg_auto_log_deals
  AFTER INSERT OR UPDATE OR DELETE ON public.kanban_deals
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_activity();

CREATE TRIGGER trg_auto_log_proposals
  AFTER INSERT OR UPDATE OR DELETE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_activity();

CREATE TRIGGER trg_auto_log_tags
  AFTER INSERT OR UPDATE OR DELETE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.auto_log_activity();
