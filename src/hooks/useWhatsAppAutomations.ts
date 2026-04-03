import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppAutomation {
  id: string;
  user_id: string;
  trigger_type: string;
  message_template: string;
  is_active: boolean;
  delay_minutes: number;
  target_phase: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const TRIGGER_OPTIONS = [
  { value: 'new_message', label: 'Nova mensagem recebida', icon: '💬', description: 'Quando um novo contato envia uma mensagem' },
  { value: 'new_lead', label: 'Novo lead criado', icon: '🎯', description: 'Quando um lead é capturado no CRM' },
  { value: 'phase_change', label: 'Mudança de etapa', icon: '📋', description: 'Quando um deal muda de fase no Kanban' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado', icon: '💰', description: 'Quando um pagamento é confirmado' },
  { value: 'deadline_approaching', label: 'Prazo se aproximando', icon: '⏰', description: 'Quando um projeto está perto do prazo' },
  { value: 'post_published', label: 'Post publicado', icon: '📱', description: 'Quando um conteúdo social é publicado' },
];

export const MESSAGE_VARIABLES = [
  { var: '{{nome}}', desc: 'Nome do contato/cliente' },
  { var: '{{empresa}}', desc: 'Nome da empresa' },
  { var: '{{projeto}}', desc: 'Nome do projeto' },
  { var: '{{etapa}}', desc: 'Etapa atual no Kanban' },
  { var: '{{valor}}', desc: 'Valor da transação' },
  { var: '{{data}}', desc: 'Data atual formatada' },
];

export function useWhatsAppAutomations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['whatsapp-automations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_automations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as WhatsAppAutomation[];
    },
    enabled: !!user,
  });
}

export function useCreateWhatsAppAutomation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      trigger_type: string;
      message_template: string;
      delay_minutes?: number;
      target_phase?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('whatsapp_automations')
        .insert([{ ...input, user_id: user!.id }] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-automations'] });
      toast({ title: 'Automação criada!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateWhatsAppAutomation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from('whatsapp_automations')
        .update(updates as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-automations'] });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteWhatsAppAutomation() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('whatsapp_automations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-automations'] });
      toast({ title: 'Automação excluída!' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
