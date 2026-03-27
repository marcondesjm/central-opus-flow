import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface FullClient {
  id: string;
  user_id: string;
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
  tags: string[] | null;
  project_interest: string | null;
  avatar_color: string | null;
  share_token: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientTechnicalData {
  id: string;
  user_id: string;
  client_id: string;
  section: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const TECH_SECTIONS = [
  { key: 'branding', label: 'Branding', description: 'Logo, cores, slogan e tom de voz', icon: '🎨' },
  { key: 'persona', label: 'Persona', description: 'Público-alvo, dores e desejos', icon: '👤' },
  { key: 'editorial', label: 'Linha Editorial', description: 'Pilares, frequência e formatos', icon: '📋' },
  { key: 'typography', label: 'Tipografia', description: 'Fontes primárias e secundárias', icon: '🔤' },
  { key: 'social', label: 'Redes Sociais', description: 'Links de Instagram, YouTube, etc.', icon: '🔗' },
  { key: 'access', label: 'Acessos', description: 'Logins e senhas das plataformas', icon: '🔒' },
  { key: 'competitors', label: 'Concorrentes', description: 'Análise da concorrência', icon: '👥' },
  { key: 'briefing', label: 'Briefing & Notas', description: 'Briefing geral e anotações', icon: '📝' },
  { key: 'attachments', label: 'Anexos', description: 'Arquivos e documentos do cliente', icon: '📎' },
] as const;

export const AVATAR_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

// ─── Clients CRUD ──────────────────────────
export function useClients() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['full-clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('financial_clients').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as FullClient[];
    },
    enabled: !!user,
  });
}

export function useCreateFullClient() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (client: Partial<FullClient> & { name: string }) => {
      const { data, error } = await supabase.from('financial_clients')
        .insert({ ...client, user_id: user!.id } as any).select().single();
      if (error) throw error;
      return data as FullClient;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['full-clients'] }); qc.invalidateQueries({ queryKey: ['financial-clients'] }); toast({ title: 'Cliente cadastrado!' }); },
    onError: () => { toast({ title: 'Erro ao cadastrar cliente', variant: 'destructive' }); },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FullClient> & { id: string }) => {
      const { error } = await supabase.from('financial_clients').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['full-clients'] }); qc.invalidateQueries({ queryKey: ['financial-clients'] }); },
    onError: () => { toast({ title: 'Erro ao atualizar cliente', variant: 'destructive' }); },
  });
}

export function useDeleteFullClient() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('financial_clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['full-clients'] }); qc.invalidateQueries({ queryKey: ['financial-clients'] }); toast({ title: 'Cliente removido!' }); },
  });
}

// ─── Technical Data ──────────────────────────
export function useClientTechnicalData(clientId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['client-tech', clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from('client_technical_data').select('*').eq('client_id', clientId!);
      if (error) throw error;
      return data as ClientTechnicalData[];
    },
    enabled: !!user && !!clientId,
  });
}

export function useUpsertTechnicalData() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ client_id, section, data }: { client_id: string; section: string; data: Record<string, any> }) => {
      const { error } = await supabase.from('client_technical_data')
        .upsert({ client_id, section, data: data as any, user_id: user!.id, updated_at: new Date().toISOString() } as any, { onConflict: 'client_id,section' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['client-tech', vars.client_id] }); toast({ title: 'Dados salvos!' }); },
    onError: () => { toast({ title: 'Erro ao salvar', variant: 'destructive' }); },
  });
}

// ─── Public registration ──────────────────────────
export function usePublicClientRegistration() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (client: Partial<FullClient> & { name: string; user_id: string }) => {
      const { data, error } = await supabase.from('financial_clients')
        .insert(client as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast({ title: 'Cadastro enviado com sucesso!' }); },
    onError: () => { toast({ title: 'Erro ao enviar cadastro', variant: 'destructive' }); },
  });
}

// Get owner info by share token
export async function getOwnerByShareToken(token: string) {
  const { data } = await supabase.from('financial_clients').select('user_id').eq('share_token', token).limit(1).single();
  if (data?.user_id) {
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', data.user_id).single();
    return { user_id: data.user_id, name: profile?.full_name || 'Profissional' };
  }
  // Fallback: look up profile by some other means
  return null;
}
