import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface KanbanColumn {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_COLUMNS = [
  { name: 'Prospecção', color: '#3b82f6', position: 0 },
  { name: 'Fechamento', color: '#f59e0b', position: 1 },
  { name: 'Contrato', color: '#8b5cf6', position: 2 },
  { name: 'Em Andamento', color: '#06b6d4', position: 3 },
  { name: 'Entrega', color: '#10b981', position: 4 },
  { name: 'Concluído', color: '#16a34a', position: 5 },
];

export function useKanbanColumns() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['kanban-columns', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      // If no columns exist, create defaults
      if (data.length === 0 && user) {
        const { data: newCols, error: insertError } = await supabase
          .from('kanban_columns')
          .insert(DEFAULT_COLUMNS.map(c => ({ ...c, user_id: user.id })))
          .select();

        if (insertError) throw insertError;
        return (newCols as KanbanColumn[]).sort((a, b) => a.position - b.position);
      }

      return data as KanbanColumn[];
    },
    enabled: !!user,
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (col: { name: string; color: string; position: number }) => {
      const { data, error } = await supabase
        .from('kanban_columns')
        .insert({ ...col, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
      toast({ title: 'Coluna criada!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar coluna', variant: 'destructive' });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KanbanColumn> & { id: string }) => {
      const { error } = await supabase
        .from('kanban_columns')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('kanban_columns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-columns'] });
      toast({ title: 'Coluna removida!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover coluna', variant: 'destructive' });
    },
  });
}
