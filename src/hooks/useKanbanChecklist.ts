import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface KanbanChecklistItem {
  id: string;
  deal_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useTaskChecklist(dealId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-checklist', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_task_checklist')
        .select('*')
        .eq('deal_id', dealId!)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as KanbanChecklistItem[];
    },
    enabled: !!user && !!dealId,
  });
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (item: { deal_id: string; title: string; position: number }) => {
      const { data, error } = await supabase
        .from('kanban_task_checklist')
        .insert({ ...item, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-checklist', vars.deal_id] });
    },
  });
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, deal_id, ...updates }: { id: string; deal_id: string; is_completed?: boolean; title?: string }) => {
      const { error } = await supabase
        .from('kanban_task_checklist')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      return deal_id;
    },
    onSuccess: (dealId) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-checklist', dealId] });
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, deal_id }: { id: string; deal_id: string }) => {
      const { error } = await supabase
        .from('kanban_task_checklist')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return deal_id;
    },
    onSuccess: (dealId) => {
      queryClient.invalidateQueries({ queryKey: ['kanban-checklist', dealId] });
    },
  });
}
