import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type UserStatus = 'active' | 'frozen' | 'deleted';

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  onboarding_completed: boolean;
  plan: 'free' | 'pro' | 'business';
  max_accounts: number;
  max_projects: number;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  is_trial: boolean | null;
  trial_ends_at: string | null;
  user_status: UserStatus | null;
  role: 'admin' | 'viewer' | 'collaborator';
  accounts_count: number;
  projects_count: number;
}

export type SortField = 'created_at' | 'email' | 'full_name' | 'plan' | 'accounts_count' | 'projects_count';
export type SortOrder = 'asc' | 'desc';

export function useAdminUsers() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-users', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as AdminUser[];
    },
    enabled: !!user,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: UserStatus }) => {
      const { error } = await supabase
        .from('subscriptions')
        .update({ user_status: status })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar status do usuário', {
        description: error.message,
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // First, delete all user's projects
      await supabase
        .from('projects')
        .delete()
        .eq('user_id', userId);
      
      // Delete all user's accounts
      await supabase
        .from('lovable_accounts')
        .delete()
        .eq('user_id', userId);
      
      // Delete subscription
      await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);
      
      // Delete user roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      // Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir usuário', {
        description: error.message,
      });
    },
  });
}

export function useAdminStats() {
  const { data: users = [] } = useAdminUsers();
  
  const stats = {
    totalUsers: users.length,
    freeUsers: users.filter(u => u.plan === 'free').length,
    proUsers: users.filter(u => u.plan === 'pro').length,
    businessUsers: users.filter(u => u.plan === 'business').length,
    admins: users.filter(u => u.role === 'admin').length,
    activeUsers: users.filter(u => u.user_status === 'active' || u.user_status === null).length,
    frozenUsers: users.filter(u => u.user_status === 'frozen').length,
    trialUsers: users.filter(u => u.is_trial).length,
    totalAccounts: users.reduce((sum, u) => sum + (u.accounts_count || 0), 0),
    totalProjects: users.reduce((sum, u) => sum + (u.projects_count || 0), 0),
  };

  return stats;
}

// Helper to calculate trial days remaining
export function getTrialDaysRemaining(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const now = new Date();
  const endDate = new Date(trialEndsAt);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}
