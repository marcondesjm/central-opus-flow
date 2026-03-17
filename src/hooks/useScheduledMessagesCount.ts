import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useScheduledMessagesCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      const { count: total } = await supabase
        .from('kanban_scheduled_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('sent', false);
      setCount(total || 0);
    };

    fetchCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`scheduled-msgs-count-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kanban_scheduled_messages',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return count;
}
