CREATE UNIQUE INDEX kanban_columns_unique_name_per_user_space 
ON public.kanban_columns (user_id, COALESCE(space_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));