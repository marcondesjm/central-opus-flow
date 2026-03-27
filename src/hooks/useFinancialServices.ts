import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ServicePayload {
  name: string;
  description?: string | null;
  default_price: number;
  category_id?: string | null;
  is_recurring?: boolean;
  recurring_period?: string | null;
  show_public?: boolean;
  show_leads_form?: boolean;
}

export function useCreateServiceFull() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (s: ServicePayload) => {
      const { data, error } = await supabase.from('financial_services')
        .insert({
          name: s.name,
          description: s.description || null,
          default_price: s.default_price,
          category_id: s.category_id || null,
          is_recurring: s.is_recurring ?? false,
          recurring_period: s.recurring_period || 'mensal',
          show_public: s.show_public ?? true,
          show_leads_form: s.show_leads_form ?? true,
          user_id: user!.id,
        } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-services'] }); toast({ title: 'Serviço criado!' }); },
    onError: (e: any) => { toast({ title: 'Erro ao criar serviço', description: e?.message, variant: 'destructive' }); },
  });
}

export function useUpdateServiceFull() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ServicePayload & { id: string }) => {
      const { error } = await supabase.from('financial_services')
        .update({
          name: updates.name,
          description: updates.description || null,
          default_price: updates.default_price,
          category_id: updates.category_id || null,
          is_recurring: updates.is_recurring ?? false,
          recurring_period: updates.recurring_period || 'mensal',
          show_public: updates.show_public ?? true,
          show_leads_form: updates.show_leads_form ?? true,
        } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-services'] }); toast({ title: 'Serviço atualizado!' }); },
    onError: (e: any) => { toast({ title: 'Erro ao atualizar', description: e?.message, variant: 'destructive' }); },
  });
}

export function useDeleteServiceFull() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial-services'] }); toast({ title: 'Serviço removido!' }); },
    onError: () => { toast({ title: 'Erro ao remover', variant: 'destructive' }); },
  });
}
