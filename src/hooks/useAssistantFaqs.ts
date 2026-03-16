import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AssistantFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useAssistantFaqs() {
  return useQuery({
    queryKey: ['assistant-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assistant_faqs')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data as AssistantFaq[];
    },
  });
}

export function useAddFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (faq: Pick<AssistantFaq, 'question' | 'answer' | 'category' | 'position'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('assistant_faqs')
        .insert({ ...faq, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-faqs'] });
      toast({ title: 'Pergunta adicionada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AssistantFaq> & { id: string }) => {
      const { data, error } = await supabase
        .from('assistant_faqs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-faqs'] });
      toast({ title: 'Pergunta atualizada!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assistant_faqs')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-faqs'] });
      toast({ title: 'Pergunta removida!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });
}
