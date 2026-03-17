import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  theme: string;
  theme_color: string;
  description: string | null;
  hypothesis: string | null;
  validation: string | null;
  decision: string | null;
  impact: number;
  effort: number;
  roadmap: string;
  progress: number;
  insights_count: number;
  position: number;
  space_id: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export const ROADMAP_OPTIONS = [
  { id: 'now', label: 'Agora', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50' },
  { id: 'next', label: 'Próximo', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { id: 'later', label: 'Mais tarde', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
  { id: 'wont', label: 'Não vai ser feito', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
] as const;

export const THEME_PRESETS = [
  { id: 'aumentar-receita', label: 'Aumentar a receita', color: '#22c55e', icon: '📈' },
  { id: 'conquistar-clientes', label: 'Conquistar clientes', color: '#ef4444', icon: '🎯' },
  { id: 'atrair-usuarios', label: 'Atrair os usuários', color: '#ec4899', icon: '❤️' },
  { id: 'expandir-horizontes', label: 'Expandir horizontes', color: '#8b5cf6', icon: '🚀' },
  { id: 'melhorar-produto', label: 'Melhorar o produto', color: '#3b82f6', icon: '⚙️' },
  { id: 'geral', label: 'Geral', color: '#6b7280', icon: '💡' },
] as const;

export function useIdeas() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ideas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Idea[];
    },
    enabled: !!user,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (idea: Partial<Omit<Idea, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { title: string }) => {
      const { data, error } = await supabase
        .from('ideas')
        .insert({ ...idea, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast({ title: 'Ideia criada com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar ideia', variant: 'destructive' });
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Idea> & { id: string }) => {
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar ideia', variant: 'destructive' });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast({ title: 'Ideia removida com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover ideia', variant: 'destructive' });
    },
  });
}
