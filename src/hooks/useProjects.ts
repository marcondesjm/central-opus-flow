import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays } from 'date-fns';

export interface LovableAccount {
  id: string;
  user_id: string;
  email: string;
  name: string;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
  credits: number;
  credits_updated_at: string;
  created_at: string;
  updated_at: string;
  admin_email: string | null;
  supabase_project_id: string | null;
  supabase_url: string | null;
  anon_key: string | null;
  service_role_key: string | null;
  notes: string | null;
}

// Safe version without sensitive keys (for reads)
export interface LovableAccountSafe {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  color: string | null;
  credits: number | null;
  credits_updated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  admin_email: string | null;
  supabase_project_id: string | null;
  supabase_url: string | null;
  anon_key_masked: string | null;
  service_role_key_masked: string | null;
  has_anon_key: boolean | null;
  has_service_role_key: boolean | null;
  notes: string | null;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  description: string | null;
  url: string | null;
  screenshot: string | null;
  status: 'published' | 'draft' | 'archived';
  type: 'website' | 'landing' | 'app' | 'funnel' | 'other';
  is_favorite: boolean;
  notes: string | null;
  view_count: number;
  progress: number;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  repository_url?: string | null;
  tags?: Tag[];
}

// Accounts
export function useAccounts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['accounts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lovable_accounts_safe')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      const isDemo = user?.email === 'usercentral@gmail.com';
      return (data || [])
        .filter(acc => {
          // Hide demo account from non-demo users
          if (!isDemo && acc.user_id !== user?.id) return false;
          return true;
        })
        .map(acc => ({
          ...acc,
          anon_key: acc.anon_key_masked || null,
          service_role_key: acc.service_role_key_masked || null,
        })) as unknown as LovableAccount[];
    },
    enabled: !!user,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (account: Omit<LovableAccount, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'credits_updated_at'>) => {
      const { data, error } = await supabase
        .from('lovable_accounts')
        .insert({ ...account, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LovableAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from('lovable_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lovable_accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Tags
export function useTags() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!user,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (tag: Omit<Tag, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('tags')
        .insert({ ...tag, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

// Projects
export function useProjects() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tags (
            tag_id,
            tags (*)
          )
        `)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include tags array
      return data.map(project => ({
        ...project,
        tags: project.project_tags?.map((pt: any) => pt.tags) || [],
      })) as Project[];
    },
    enabled: !!user,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'view_count' | 'tags'> & { tagIds?: string[] }) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      const { tagIds, ...projectData } = project;

      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('plan, expires_at, trial_ends_at, payment_status, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscriptionError) {
        throw new Error('Não foi possível validar sua assinatura. Tente novamente.');
      }

      const expirationDate = subscription?.expires_at ? new Date(subscription.expires_at) : null;
      const trialEndDate = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
      const baselineCreatedAt = subscription?.created_at || user.created_at || new Date().toISOString();
      const freeExpiration = (subscription?.plan ?? 'free') === 'free'
        ? addDays(new Date(baselineCreatedAt), 7)
        : null;
      const effectiveExpiration = expirationDate || trialEndDate || freeExpiration;
      const isPaidPlan = (subscription?.plan === 'pro' || subscription?.plan === 'business') && 
        (subscription?.payment_status === 'paid' || subscription?.payment_status === 'verified');

      if (effectiveExpiration && effectiveExpiration <= new Date() && !isPaidPlan) {
        throw new Error('Sua assinatura está expirada. Renove para criar novos projetos.');
      }
      
      console.log('Creating project:', { ...projectData, user_id: user.id });
      
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...projectData, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }
      
      console.log('Project created:', data);
      
      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        const { error: tagError } = await supabase
          .from('project_tags')
          .insert(tagIds.map(tagId => ({
            project_id: data.id,
            tag_id: tagId,
          })));
        
        if (tagError) {
          console.error('Error adding tags:', tagError);
          throw tagError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, tagIds, previousData, ...updates }: Partial<Project> & { id: string; tagIds?: string[]; previousData?: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update tags if provided
      if (tagIds !== undefined) {
        // Remove existing tags
        await supabase
          .from('project_tags')
          .delete()
          .eq('project_id', id);
        
        // Add new tags
        if (tagIds.length > 0) {
          const { error: tagError } = await supabase
            .from('project_tags')
            .insert(tagIds.map(tagId => ({
              project_id: id,
              tag_id: tagId,
            })));
          
          if (tagError) throw tagError;
        }
      }

      // Log history if we have previous data to compare
      if (previousData && user) {
        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        const fieldsToTrack = ['name', 'status', 'type', 'url', 'description', 'notes', 'deadline', 'progress'] as const;
        const historyEntries = [];

        for (const field of fieldsToTrack) {
          const oldVal = previousData[field as keyof Project];
          const newVal = updates[field as keyof Project];
          
          if (newVal !== undefined && oldVal !== newVal) {
            historyEntries.push({
              project_id: id,
              user_id: user.id,
              action: 'updated',
              field_name: field,
              old_value: oldVal?.toString() || null,
              new_value: newVal?.toString() || null,
              user_name: profile?.full_name || user.email || 'Usuário',
              user_avatar: profile?.avatar_url || null,
            });
          }
        }

        // Insert all history entries
        if (historyEntries.length > 0) {
          await supabase.from('project_history').insert(historyEntries);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Block deletion in demo account - changes are temporary only
      if (user?.email === 'usercentral@gmail.com') {
        throw new Error('Na conta de demonstração, os projetos não podem ser excluídos.');
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('projects')
        .update({ is_favorite: isFavorite })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
