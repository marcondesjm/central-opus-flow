import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Componente invisível que mantém a versão do sistema sempre atualizada.
 * - Escuta mudanças em tempo real nas tabelas system_config e changelog_entries
 * - Faz polling a cada 30 segundos
 * - Re-sincroniza ao voltar para a aba ou reconectar
 */
export function VersionChecker() {
  const queryClient = useQueryClient();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const versionKeys = [
      'system-version',
      'latest-version',
      'changelog',
      'changelog-by-version',
    ];

    const refreshVersion = () => {
      if (!mountedRef.current) return;
      versionKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      // Force refetch active queries immediately
      queryClient.refetchQueries({ queryKey: ['latest-version'], type: 'active' });
      queryClient.refetchQueries({ queryKey: ['system-version'], type: 'active' });
    };

    // 1) Realtime channel for both tables
    const channel = supabase
      .channel('version-checker-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_config' },
        (payload) => {
          const key =
            payload.new && 'key' in payload.new
              ? String(payload.new.key)
              : '';
          if (['app_version', 'release_name', 'changelog'].includes(key)) {
            refreshVersion();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'changelog_entries' },
        () => refreshVersion()
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          refreshVersion();
        }
      });

    // 2) Polling every 30s as safety net
    const pollInterval = window.setInterval(refreshVersion, 30_000);

    // 3) Re-sync on tab focus and reconnect
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', refreshVersion);

    return () => {
      mountedRef.current = false;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', refreshVersion);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}
