import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  user_id: string;
  pipeline_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  cpf_cnpj: string | null;
  cep: string | null;
  address: string | null;
  address_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  project_interest: string | null;
  estimated_value: number;
  tags: string[];
  notes: string | null;
  phase: string;
  position: number;
  source: string;
  webhook_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadPipeline {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface LeadWebhook {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  pipeline_id: string | null;
  auto_tags: string[];
  token: string;
  is_active: boolean;
  leads_count: number;
  created_at: string;
}

export const LEAD_PHASES = [
  { value: 'novo_lead', label: 'Novo Lead', color: '#3b82f6' },
  { value: 'primeiro_contato', label: 'Primeiro Contato', color: '#f59e0b' },
  { value: 'proposta_enviada', label: 'Proposta Enviada', color: '#a855f7' },
  { value: 'negociacao', label: 'Negociação', color: '#6b7280' },
  { value: 'fechado', label: 'Fechado', color: '#22c55e' },
];

export function useLeadPipelines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lead-pipelines', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_pipelines')
        .select('*')
        .eq('user_id', user!.id)
        .order('position');
      if (error) throw error;
      return (data || []) as unknown as LeadPipeline[];
    },
    enabled: !!user,
  });

  const createPipeline = useMutation({
    mutationFn: async (name: string) => {
      const maxPos = (query.data || []).reduce((m, p) => Math.max(m, p.position), -1);
      const { error } = await supabase
        .from('lead_pipelines')
        .insert({ user_id: user!.id, name, position: maxPos + 1 } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-pipelines'] });
      toast.success('Pipeline criado!');
    },
    onError: () => toast.error('Erro ao criar pipeline'),
  });

  const deletePipeline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lead_pipelines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-pipelines'] });
      toast.success('Pipeline removido');
    },
    onError: () => toast.error('Erro ao remover pipeline'),
  });

  return { pipelines: query.data ?? [], isLoading: query.isLoading, createPipeline, deletePipeline };
}

export function useLeads(pipelineId?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leads', user?.id, pipelineId],
    queryFn: async () => {
      let q = supabase
        .from('leads')
        .select('*')
        .eq('user_id', user!.id)
        .order('position');
      if (pipelineId) q = q.eq('pipeline_id', pipelineId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as Lead[];
    },
    enabled: !!user,
  });

  const createLead = useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const { error } = await supabase
        .from('leads')
        .insert({ ...lead, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead criado!');
    },
    onError: () => toast.error('Erro ao criar lead'),
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => toast.error('Erro ao atualizar lead'),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead removido');
    },
    onError: () => toast.error('Erro ao remover lead'),
  });

  return { leads: query.data ?? [], isLoading: query.isLoading, createLead, updateLead, deleteLead };
}

export function useLeadWebhooks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['lead-webhooks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_webhooks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as LeadWebhook[];
    },
    enabled: !!user,
  });

  const createWebhook = useMutation({
    mutationFn: async (webhook: { name: string; description?: string; pipeline_id?: string; auto_tags?: string[] }) => {
      const { error } = await supabase
        .from('lead_webhooks')
        .insert({ ...webhook, user_id: user!.id } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-webhooks'] });
      toast.success('Webhook criado!');
    },
    onError: () => toast.error('Erro ao criar webhook'),
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lead_webhooks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-webhooks'] });
      toast.success('Webhook removido');
    },
    onError: () => toast.error('Erro ao remover webhook'),
  });

  return { webhooks: query.data ?? [], isLoading: query.isLoading, createWebhook, deleteWebhook };
}
