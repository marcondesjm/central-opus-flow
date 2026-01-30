import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export interface ChecklistItem {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useProjectChecklist(projectId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['project-checklist', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_checklists')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!projectId && !!user,
  });

  // Realtime subscription for live updates
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`checklist-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_checklists',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['project-checklist', projectId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  return query;
}

export function useAddChecklistItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ projectId, title }: { projectId: string; title: string }) => {
      // Get the max position
      const { data: existing } = await supabase
        .from('project_checklists')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('project_checklists')
        .insert({
          project_id: projectId,
          user_id: user!.id,
          title,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-checklist', variables.projectId] });
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, projectId, isCompleted }: { id: string; projectId: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('project_checklists')
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          completed_by: isCompleted ? user!.id : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-checklist', variables.projectId] });
    },
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, title }: { id: string; projectId: string; title: string }) => {
      const { data, error } = await supabase
        .from('project_checklists')
        .update({ title })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-checklist', variables.projectId] });
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('project_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-checklist', variables.projectId] });
    },
  });
}

export function useReorderChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, items }: { projectId: string; items: { id: string; position: number }[] }) => {
      const updates = items.map(item =>
        supabase
          .from('project_checklists')
          .update({ position: item.position })
          .eq('id', item.id)
      );

      await Promise.all(updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-checklist', variables.projectId] });
    },
  });
}
