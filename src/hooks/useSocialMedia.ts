import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

export interface SocialPost {
  id: string;
  user_id: string;
  social_account_id: string | null;
  title: string | null;
  content: string;
  media_urls: string[];
  platform: string;
  post_type: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  external_post_id: string | null;
  hashtags: string[];
  notes: string | null;
  client_approved: boolean;
  client_approved_at: string | null;
  created_at: string;
  updated_at: string;
  social_accounts?: SocialAccount;
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
export function useSocialPosts(filters?: { status?: string; accountId?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['social-posts', user?.id, filters],
    queryFn: async () => {
      let q = supabase.from('social_posts').select('*, social_accounts(*)').order('scheduled_at', { ascending: true, nullsFirst: false });
      if (filters?.status) q = q.eq('status', filters.status);
      if (filters?.accountId) q = q.eq('social_account_id', filters.accountId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as SocialPost[];
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
      media_urls?: string[]; status?: string; notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('social_posts')
        .insert([{ ...input, user_id: user!.id }] as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-posts'] }); toast({ title: 'Post criado!' }); },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });
}

export function useUpdateSocialPost() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['social-posts'] }); toast({ title: 'Post excluído!' }); },
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
