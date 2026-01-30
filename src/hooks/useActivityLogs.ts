import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export type ActionType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'archive' 
  | 'restore' 
  | 'favorite' 
  | 'unfavorite' 
  | 'login' 
  | 'logout'
  | 'view';

export function useActivityLogs(limit = 50) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['activity-logs', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user,
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({
      action,
      entityType,
      entityId,
      entityName,
      metadata = {},
    }: {
      action: ActionType;
      entityType: string;
      entityId?: string;
      entityName?: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName,
          metadata,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });
}

export function formatActivityAction(action: string, entityType: string, entityName?: string | null): string {
  const actions: Record<string, string> = {
    create: 'criou',
    update: 'atualizou',
    delete: 'excluiu',
    archive: 'arquivou',
    restore: 'restaurou',
    favorite: 'favoritou',
    unfavorite: 'desfavoritou',
    login: 'fez login',
    logout: 'fez logout',
    view: 'visualizou',
  };

  const entities: Record<string, string> = {
    project: 'projeto',
    account: 'conta',
    tag: 'tag',
    user: 'usuário',
  };

  const actionText = actions[action] || action;
  const entityText = entities[entityType] || entityType;
  
  if (entityName) {
    return `${actionText} ${entityText} "${entityName}"`;
  }
  return `${actionText} ${entityText}`;
}
