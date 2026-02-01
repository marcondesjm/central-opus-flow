import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string | null;
  type: 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';
  created_at: string;
  created_by: string | null;
  is_public: boolean;
}

export function useChangelog() {
  return useQuery({
    queryKey: ['changelog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ChangelogEntry[];
    },
  });
}

export function useChangelogByVersion() {
  return useQuery({
    queryKey: ['changelog-by-version'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by version
      const grouped = (data as ChangelogEntry[]).reduce((acc, entry) => {
        if (!acc[entry.version]) {
          acc[entry.version] = [];
        }
        acc[entry.version].push(entry);
        return acc;
      }, {} as Record<string, ChangelogEntry[]>);

      // Convert to array sorted by version (most recent first)
      return Object.entries(grouped)
        .sort((a, b) => {
          const versionA = a[0].split('.').map(Number);
          const versionB = b[0].split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if ((versionB[i] || 0) !== (versionA[i] || 0)) {
              return (versionB[i] || 0) - (versionA[i] || 0);
            }
          }
          return 0;
        })
        .map(([version, entries]) => ({
          version,
          entries,
          date: entries[0]?.created_at,
        }));
    },
  });
}

export function useAddChangelogEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (entry: Omit<ChangelogEntry, 'id' | 'created_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('changelog_entries')
        .insert({
          ...entry,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['changelog-by-version'] });
      toast({
        title: 'Entrada adicionada',
        description: 'A entrada do changelog foi adicionada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useLatestVersion() {
  return useQuery({
    queryKey: ['latest-version'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('version, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
}
