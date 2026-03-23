ALTER TABLE public.projects
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
ADD CONSTRAINT projects_status_check
CHECK (
  status = ANY (
    ARRAY[
      'published'::text,
      'draft'::text,
      'archived'::text,
      'review'::text,
      'approved'::text,
      'changes'::text
    ]
  )
);