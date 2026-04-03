import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: string;
  account_name: string;
  account_username: string | null;
  account_avatar_url: string | null;
  is_connected: boolean;
  meta_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface SocialPost {
  id: string;
  user_id: string;
  social_account_id: string | null;
  title: string | null;
  content: string;
  media_urls: string[];
  platform: string;
  post_type: string;
  content_type: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  external_post_id: string | null;
  hashtags: string[];
  notes: string | null;
  client_approved: boolean;
  client_approved_at: string | null;
  client_id: string | null;
  approval_status: string;
  approval_notes: string | null;
  checklist: ChecklistItem[];
  subtasks: SubTask[];
  color: string | null;
  created_at: string;
  updated_at: string;
  social_accounts?: SocialAccount;
  financial_clients?: { id: string; name: string } | null;
}

export interface SocialMetric {
  id: string;
  user_id: string;
  social_account_id: string | null;
  post_id: string | null;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  saves: number;
  clicks: number;
  engagement_rate: number;
  followers_count: number;
  period_start: string | null;
  period_end: string | null;
  collected_at: string;
  created_at: string;
}

// Content type → suggested platforms
export const CONTENT_TYPE_OPTIONS = [
  { value: 'post', label: 'Post', platforms: ['instagram', 'facebook', 'linkedin', 'twitter'] },
  { value: 'video', label: 'Vídeo', platforms: ['youtube', 'tiktok', 'instagram', 'facebook'] },
  { value: 'arte', label: 'Arte / Layout', platforms: ['instagram', 'facebook', 'linkedin'] },
  { value: 'stories', label: 'Stories', platforms: ['instagram', 'facebook'] },
  { value: 'reels', label: 'Reels / Shorts', platforms: ['instagram', 'tiktok', 'youtube'] },
  { value: 'entrega', label: 'Entrega de Serviço', platforms: [] },
  { value: 'blog', label: 'Blog / Artigo', platforms: ['linkedin', 'twitter'] },
];

// ─── Accounts ───
export function useSocialAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['social-accounts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as SocialAccount[];
    },
    enabled: !!user,
  });
}

export function useCreateSocialAccount() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { platform: string; account_name: string; account_username?: string }) => {
      const { data, error } = await supabase
        .from('social_accounts')
        .insert([{ ...input, user_id: user!.id }] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts'] }); toast({ title: 'Conta adicionada!' }); },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteSocialAccount() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_accounts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-accounts'] }); toast({ title: 'Conta removida!' }); },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ─── Posts ───
export function useSocialPosts(filters?: { status?: string; accountId?: string; clientId?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['social-posts', user?.id, filters],
    queryFn: async () => {
      let q = supabase.from('social_posts').select('*, social_accounts(*), financial_clients(id, name)').order('scheduled_at', { ascending: true, nullsFirst: false });
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.accountId) q = q.eq('social_account_id', filters.accountId);
      if (filters?.clientId) q = q.eq('client_id', filters.clientId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        checklist: Array.isArray(d.checklist) ? d.checklist : [],
        subtasks: Array.isArray(d.subtasks) ? d.subtasks : [],
      })) as SocialPost[];
    },
    enabled: !!user,
  });
}

export function useCreateSocialPost() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      title?: string; content: string; platform: string; post_type?: string;
      social_account_id?: string; scheduled_at?: string; hashtags?: string[];
      media_urls?: string[]; status?: string; notes?: string; content_type?: string;
      client_id?: string; color?: string; checklist?: ChecklistItem[]; subtasks?: SubTask[];
    }) => {
      const { data, error } = await supabase
        .from('social_posts')
        .insert([{
          ...input,
          user_id: user!.id,
          checklist: (input.checklist || []) as unknown as Json,
          subtasks: (input.subtasks || []) as unknown as Json,
        }] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-posts'] }); toast({ title: 'Conteúdo criado!' }); },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateSocialPost() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      if (updates.checklist) updates.checklist = updates.checklist as unknown as Json;
      if (updates.subtasks) updates.subtasks = updates.subtasks as unknown as Json;
      const { error } = await supabase.from('social_posts').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-posts'] }); },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useDeleteSocialPost() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-posts'] }); toast({ title: 'Conteúdo excluído!' }); },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

// ─── Metrics ───
export function useSocialMetrics(filters?: { accountId?: string; postId?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['social-metrics', user?.id, filters],
    queryFn: async () => {
      let q = supabase.from('social_metrics').select('*').order('collected_at', { ascending: false });
      if (filters?.accountId) q = q.eq('social_account_id', filters.accountId);
      if (filters?.postId) q = q.eq('post_id', filters.postId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as SocialMetric[];
    },
    enabled: !!user,
  });
}

export function useCreateSocialMetric() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: Partial<SocialMetric> & { post_id?: string; social_account_id?: string }) => {
      const { data, error } = await supabase
        .from('social_metrics')
        .insert([{ ...input, user_id: user!.id }] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-metrics'] }); toast({ title: 'Métricas salvas!' }); },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}
