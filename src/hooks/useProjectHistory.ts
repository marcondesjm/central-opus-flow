import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProjectHistoryEntry {
  id: string;
  project_id: string;
  user_id: string;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  user_name: string | null;
  user_avatar: string | null;
  created_at: string;
}

function mergeHistoryEntries(
  current: ProjectHistoryEntry[],
  incoming: ProjectHistoryEntry[]
): ProjectHistoryEntry[] {
  const map = new Map<string, ProjectHistoryEntry>();

  [...incoming, ...current].forEach((entry) => {
    map.set(entry.id, entry);
  });

  return Array.from(map.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50);
}

export function useProjectHistory(projectId?: string) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ProjectHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!projectId || !user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('project_history')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching project history:', error);
    } else {
      setHistory(data as ProjectHistoryEntry[]);
    }
    setLoading(false);
  }, [projectId, user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!projectId || !user) return;

    const channel = supabase
      .channel(`project-history-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_history',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            setHistory((prev) => mergeHistoryEntries(prev, [payload.new as ProjectHistoryEntry]));
            return;
          }

          fetchHistory();
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          fetchHistory();
        }
      });

    const pollInterval = window.setInterval(() => {
      fetchHistory();
    }, 15000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [projectId, user, fetchHistory]);

  const logChange = useCallback(async (
    projectId: string,
    action: string,
    fieldName?: string,
    oldValue?: string | null,
    newValue?: string | null
  ) => {
    if (!user) return;

    // Get user profile for name and avatar
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    const { error } = await supabase
      .from('project_history')
      .insert({
        project_id: projectId,
        user_id: user.id,
        action,
        field_name: fieldName || null,
        old_value: oldValue || null,
        new_value: newValue || null,
        user_name: profile?.full_name || user.email || 'Usuário',
        user_avatar: profile?.avatar_url || null
      });

    if (error) {
      console.error('Error logging project change:', error);
    }
  }, [user]);

  return {
    history,
    loading,
    fetchHistory,
    logChange
  };
}

