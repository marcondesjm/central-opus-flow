import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectFeedback {
  id: string;
  project_id: string;
  version_id: string | null;
  author_name: string;
  author_type: string;
  comment: string;
  is_resolved: boolean;
  created_at: string;
}

export function useProjectFeedback(projectId: string | null) {
  return useQuery({
    queryKey: ['project-feedback', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_feedback')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectFeedback[];
    },
    enabled: !!projectId,
  });
}

export function useAddFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, versionId, authorName, authorType, comment }: {
      projectId: string;
      versionId?: string;
      authorName: string;
      authorType?: string;
      comment: string;
    }) => {
      const { data, error } = await supabase
        .from('project_feedback')
        .insert({
          project_id: projectId,
          version_id: versionId || null,
          author_name: authorName,
          author_type: authorType || 'client',
          comment,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-feedback', variables.projectId] });
    },
  });
}

export function useResolveFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_feedback')
        .update({ is_resolved: true } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-feedback', variables.projectId] });
    },
  });
}
