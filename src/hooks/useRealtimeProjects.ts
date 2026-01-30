import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Project change:', payload);
          
          // Invalidate projects query to refetch
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          
          if (payload.eventType === 'UPDATE') {
            const project = payload.new as any;
            // Only show toast if the change was made by another user
            // We can check this by comparing timestamps or adding a user_id to the payload
            toast.info('Projeto atualizado', {
              description: `"${project.name}" foi modificado`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}
