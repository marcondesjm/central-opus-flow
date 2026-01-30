import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
}

export function useChecklistProgress(projectId: string) {
  return useQuery({
    queryKey: ['checklist-progress', projectId],
    queryFn: async (): Promise<ChecklistProgress> => {
      const { data, error } = await supabase
        .from('project_checklists')
        .select('is_completed')
        .eq('project_id', projectId);

      if (error) throw error;

      const total = data?.length || 0;
      const completed = data?.filter(item => item.is_completed).length || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { total, completed, percentage };
    },
    enabled: !!projectId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Hook para buscar progresso de múltiplos projetos de uma vez
export function useMultipleChecklistProgress(projectIds: string[]) {
  return useQuery({
    queryKey: ['checklist-progress-batch', projectIds],
    queryFn: async (): Promise<Record<string, ChecklistProgress>> => {
      if (projectIds.length === 0) return {};

      const { data, error } = await supabase
        .from('project_checklists')
        .select('project_id, is_completed')
        .in('project_id', projectIds);

      if (error) throw error;

      const progressMap: Record<string, ChecklistProgress> = {};

      // Initialize all projects with zero progress
      projectIds.forEach(id => {
        progressMap[id] = { total: 0, completed: 0, percentage: 0 };
      });

      // Calculate progress for each project
      data?.forEach(item => {
        if (!progressMap[item.project_id]) {
          progressMap[item.project_id] = { total: 0, completed: 0, percentage: 0 };
        }
        progressMap[item.project_id].total++;
        if (item.is_completed) {
          progressMap[item.project_id].completed++;
        }
      });

      // Calculate percentages
      Object.keys(progressMap).forEach(id => {
        const { total, completed } = progressMap[id];
        progressMap[id].percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      });

      return progressMap;
    },
    enabled: projectIds.length > 0,
    staleTime: 30000,
  });
}
