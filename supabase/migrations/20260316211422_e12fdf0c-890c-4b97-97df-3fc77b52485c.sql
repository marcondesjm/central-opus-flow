
DO $$
DECLARE
  tbl text;
  tbls text[] := ARRAY[
    'proposals','kanban_columns','kanban_payments','kanban_expenses',
    'kanban_task_checklist','kanban_scheduled_messages','lovable_accounts',
    'project_checklists','project_collaborators','account_collaborators',
    'collaboration_notifications','pix_keys','tags','project_tags',
    'activity_logs','assistant_faqs','project_files','project_history',
    'project_code_snippets'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = tbl AND schemaname = 'public'
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
END $$;
