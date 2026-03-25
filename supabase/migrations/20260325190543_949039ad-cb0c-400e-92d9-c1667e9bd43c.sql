
DO $$
DECLARE
  _uid uuid := 'dd2f5686-0a8a-4c27-a274-3d6562dc3b54';
BEGIN
  DELETE FROM public.kanban_scheduled_messages WHERE user_id = _uid;
  DELETE FROM public.kanban_task_checklist WHERE user_id = _uid;
  DELETE FROM public.kanban_comments WHERE user_id = _uid;
  DELETE FROM public.kanban_payments WHERE user_id = _uid;
  DELETE FROM public.kanban_expenses WHERE user_id = _uid;
  DELETE FROM public.kanban_deals WHERE user_id = _uid;
  DELETE FROM public.kanban_columns WHERE user_id = _uid;
  DELETE FROM public.kanban_space_shares WHERE shared_by = _uid OR shared_with = _uid;
  DELETE FROM public.kanban_spaces WHERE user_id = _uid;
  DELETE FROM public.ideas WHERE user_id = _uid;
  DELETE FROM public.project_checklists WHERE user_id = _uid;
  DELETE FROM public.project_code_snippets WHERE user_id = _uid;
  DELETE FROM public.project_files WHERE user_id = _uid;
  DELETE FROM public.project_feedback WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = _uid);
  DELETE FROM public.project_versions WHERE user_id = _uid;
  DELETE FROM public.project_collaborators WHERE user_id = _uid OR invited_by = _uid;
  DELETE FROM public.project_tags WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = _uid);
  DELETE FROM public.project_stats WHERE user_id = _uid;
  DELETE FROM public.deadline_notifications_sent WHERE user_id = _uid;
  DELETE FROM public.deadline_notification_settings WHERE user_id = _uid;
  DELETE FROM public.projects WHERE user_id = _uid;
  DELETE FROM public.account_collaborators WHERE user_id = _uid OR invited_by = _uid;
  DELETE FROM public.lovable_accounts WHERE user_id = _uid;
  DELETE FROM public.activity_logs WHERE user_id = _uid;
  DELETE FROM public.collaboration_notifications WHERE user_id = _uid;
  DELETE FROM public.pix_keys WHERE user_id = _uid;
  DELETE FROM public.payment_receipts WHERE user_id = _uid;
  DELETE FROM public.billing WHERE user_id = _uid;
  DELETE FROM public.coupon_redemptions WHERE user_id = _uid;
  DELETE FROM public.subscriptions WHERE user_id = _uid;
  DELETE FROM public.user_roles WHERE user_id = _uid;
  DELETE FROM public.profiles WHERE user_id = _uid;
  DELETE FROM public.signup_ips WHERE user_id = _uid;
  DELETE FROM auth.users WHERE id = _uid;
END $$;
