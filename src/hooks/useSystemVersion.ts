import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemVersion {
  version: string;
  releaseName: string;
  changelog: string[];
  updatedAt: Date;
}

export function useSystemVersion() {
  return useQuery({
    queryKey: ['system-version'],
    queryFn: async (): Promise<SystemVersion> => {
      const { data, error } = await supabase
        .from('system_config')
        .select('key, value, updated_at')
        .in('key', ['app_version', 'release_name', 'changelog']);

      if (error) {
        console.error('Error fetching system version:', error);
        // Fallback to default values
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
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
