import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProjectVersion {
  id: string;
  project_id: string;
  user_id: string;
  version_number: number;
  preview_url: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useProjectVersions(projectId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-versions', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_versions')
        .select('*')
        .eq('project_id', projectId!)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return data as ProjectVersion[];
    },
    enabled: !!projectId && !!user,
  });
}

export function useAddVersion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ projectId, previewUrl, notes }: { projectId: string; previewUrl?: string; notes?: string }) => {
      // Get next version number
      const { data: existing } = await supabase
        .from('project_versions')
        .select('version_number')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = (existing?.[0]?.version_number || 0) + 1;

      const { data, error } = await supabase
        .from('project_versions')
        .insert({
          project_id: projectId,
          user_id: user!.id,
          version_number: nextVersion,
          preview_url: previewUrl || null,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-versions', variables.projectId] });
    },
  });
}
