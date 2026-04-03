import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';

export interface QuickTask {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  template_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  status: TaskStatus;
}

export const taskTemplates: TaskTemplate[] = [
  { id: 'review', name: 'Revisão', title: 'Revisar tarefa', description: 'Validar entrega', status: 'review' },
  { id: 'task', name: 'Tarefa padrão', title: 'Nova tarefa', description: 'Descrever tarefa', status: 'todo' },
];

export function useQuickTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quick-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quick_tasks')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as unknown as QuickTask[];
    },
    enabled: !!user,
  });
}

export function useCreateQuickTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { title: string; description?: string; status?: TaskStatus; template_id?: string }) => {
      const { data: existing } = await supabase
        .from('quick_tasks')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      const nextPos = existing && existing.length > 0 ? (existing[0] as any).position + 1 : 0;

      const { data, error } = await supabase
        .from('quick_tasks')
        .insert({
          user_id: user!.id,
          title: input.title,
          description: input.description || '',
          status: input.status || 'todo',
          template_id: input.template_id || null,
          position: nextPos,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quick-tasks'] }),
  });
}

export function useMoveQuickTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const { error } = await supabase
        .from('quick_tasks')
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quick-tasks'] }),
  });
}

export function useUpdateQuickTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; description?: string; status?: TaskStatus }) => {
      const { error } = await supabase
        .from('quick_tasks')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quick-tasks'] }),
  });
}

export function useDeleteQuickTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quick_tasks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quick-tasks'] }),
  });
}

export function groupTasksByStatus(tasks: QuickTask[]) {
  return {
    todo: tasks.filter(t => t.status === 'todo'),
    doing: tasks.filter(t => t.status === 'doing'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done'),
  };
}
