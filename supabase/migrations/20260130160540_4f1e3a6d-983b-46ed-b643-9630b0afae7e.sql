-- Create enum for collaboration roles
CREATE TYPE public.collaboration_role AS ENUM ('viewer', 'editor', 'admin');

-- Table for project collaborators
CREATE TABLE public.project_collaborators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    invited_by UUID NOT NULL,
    role collaboration_role NOT NULL DEFAULT 'viewer',
    invited_email TEXT NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (project_id, user_id),
    UNIQUE (project_id, invited_email)
);

-- Table for account collaborators
CREATE TABLE public.account_collaborators (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.lovable_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    invited_by UUID NOT NULL,
    role collaboration_role NOT NULL DEFAULT 'viewer',
    invited_email TEXT NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (account_id, user_id),
    UNIQUE (account_id, invited_email)
);

-- Table for collaboration notifications
CREATE TABLE public.collaboration_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    actor_id UUID,
    actor_name TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check project access
CREATE OR REPLACE FUNCTION public.has_project_access(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.projects WHERE id = _project_id AND user_id = _user_id
    ) OR EXISTS (
        SELECT 1 FROM public.project_collaborators 
        WHERE project_id = _project_id AND user_id = _user_id AND accepted_at IS NOT NULL
    ) OR EXISTS (
        SELECT 1 FROM public.account_collaborators ac
        JOIN public.projects p ON p.account_id = ac.account_id
        WHERE p.id = _project_id AND ac.user_id = _user_id AND ac.accepted_at IS NOT NULL
    )
$$;

-- Create security definer function to check account access
CREATE OR REPLACE FUNCTION public.has_account_access(_user_id UUID, _account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.lovable_accounts WHERE id = _account_id AND user_id = _user_id
    ) OR EXISTS (
        SELECT 1 FROM public.account_collaborators 
        WHERE account_id = _account_id AND user_id = _user_id AND accepted_at IS NOT NULL
    )
$$;

-- Create function to check if user is project owner
CREATE OR REPLACE FUNCTION public.is_project_owner(_user_id UUID, _project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.projects WHERE id = _project_id AND user_id = _user_id
    )
$$;

-- Create function to check if user is account owner
CREATE OR REPLACE FUNCTION public.is_account_owner(_user_id UUID, _account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.lovable_accounts WHERE id = _account_id AND user_id = _user_id
    )
$$;

-- RLS policies for project_collaborators
CREATE POLICY "Project owners can manage collaborators"
ON public.project_collaborators FOR ALL
USING (public.is_project_owner(auth.uid(), project_id))
WITH CHECK (public.is_project_owner(auth.uid(), project_id));

CREATE POLICY "Collaborators can view project collaborators"
ON public.project_collaborators FOR SELECT
USING (public.has_project_access(auth.uid(), project_id));

CREATE POLICY "Invited users can accept invitations"
ON public.project_collaborators FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS policies for account_collaborators
CREATE POLICY "Account owners can manage collaborators"
ON public.account_collaborators FOR ALL
USING (public.is_account_owner(auth.uid(), account_id))
WITH CHECK (public.is_account_owner(auth.uid(), account_id));

CREATE POLICY "Collaborators can view account collaborators"
ON public.account_collaborators FOR SELECT
USING (public.has_account_access(auth.uid(), account_id));

CREATE POLICY "Invited users can accept account invitations"
ON public.account_collaborators FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- RLS policies for collaboration_notifications
CREATE POLICY "Users can view their own notifications"
ON public.collaboration_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.collaboration_notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create notifications"
ON public.collaboration_notifications FOR INSERT
WITH CHECK (true);

-- Update projects RLS to include collaborators
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view accessible projects"
ON public.projects FOR SELECT
USING (public.has_project_access(auth.uid(), id));

-- Enable realtime for projects table
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collaboration_notifications;

-- Triggers for updated_at
CREATE TRIGGER update_project_collaborators_updated_at
    BEFORE UPDATE ON public.project_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_collaborators_updated_at
    BEFORE UPDATE ON public.account_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_project_collaborators_project ON public.project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user ON public.project_collaborators(user_id);
CREATE INDEX idx_project_collaborators_email ON public.project_collaborators(invited_email);
CREATE INDEX idx_account_collaborators_account ON public.account_collaborators(account_id);
CREATE INDEX idx_account_collaborators_user ON public.account_collaborators(user_id);
CREATE INDEX idx_account_collaborators_email ON public.account_collaborators(invited_email);
CREATE INDEX idx_collaboration_notifications_user ON public.collaboration_notifications(user_id);
CREATE INDEX idx_collaboration_notifications_unread ON public.collaboration_notifications(user_id) WHERE read_at IS NULL;