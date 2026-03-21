import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente invisível que mantém os logs de atividade sempre atualizados.
 * - Realtime via Supabase (INSERT na tabela activity_logs)
 * - Polling a cada 20s como safety net
 * - Re-sync ao voltar para a aba ou reconectar
 */
export function ActivitySync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!user) return;
    mountedRef.current = true;

    const refresh = () => {
      if (!mountedRef.current) return;
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      queryClient.refetchQueries({ queryKey: ['activity-logs'], type: 'active' });
    };

    // 1) Realtime — listen for new activity logs
    const channel = supabase
      .channel(`activity-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => refresh()
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          refresh();
        }
      });

    // 2) Polling every 20s
    const pollInterval = window.setInterval(refresh, 20_000);

    // 3) Re-sync on tab focus and reconnect
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', refresh);

    return () => {
      mountedRef.current = false;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', refresh);
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return null;
}
