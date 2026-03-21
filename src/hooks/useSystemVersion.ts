import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemVersion {
  version: string;
  releaseName: string;
  changelog: string[];
  updatedAt: Date;
}

export function useSystemVersion() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ['system-version'] });
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['changelog-by-version'] });
      queryClient.invalidateQueries({ queryKey: ['latest-version'] });
    };

    const channel = supabase
      .channel('system-version-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_config' },
        (payload) => {
          const key = payload.new && 'key' in payload.new ? String(payload.new.key) : payload.old && 'key' in payload.old ? String(payload.old.key) : '';
          if (['app_version', 'release_name', 'changelog'].includes(key)) refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'changelog_entries' },
        refresh
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') refresh();
      });

    const pollInterval = window.setInterval(refresh, 60000); // 60s instead of 15s

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['system-version'],
    queryFn: async (): Promise<SystemVersion> => {
      const { data, error } = await supabase
        .from('system_config')
        .select('key, value, updated_at')
        .in('key', ['app_version', 'release_name', 'changelog']);

      if (error) {
        if (error.message?.includes('AbortError') || error.code === '20') {
          // Silently ignore abort errors from rapid navigation/refetch
        } else {
          console.error('Error fetching system version:', error);
        }
        return {
          version: '1.0.0',
          releaseName: 'Initial Release',
          changelog: [],
          updatedAt: new Date(),
        };
      }

      const configMap = data.reduce((acc, item) => {
        acc[item.key] = { value: item.value, updated_at: item.updated_at };
        return acc;
      }, {} as Record<string, { value: string; updated_at: string }>);

      return {
        version: configMap['app_version']?.value || '1.0.0',
        releaseName: configMap['release_name']?.value || 'Release',
        changelog: configMap['changelog']?.value?.split('|') || [],
        updatedAt: new Date(configMap['app_version']?.updated_at || Date.now()),
      };
    },
    staleTime: 0,
    gcTime: 30 * 1000,
    refetchInterval: 60 * 1000, // 60s instead of 15s
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
}

export function getFormattedVersion(version: string): string {
  return `v${version}`;
}

export function getFormattedReleaseDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
