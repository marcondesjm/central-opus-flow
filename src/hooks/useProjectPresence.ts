import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ProjectUserPresence {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  online_at: string;
  project_id: string;
}

export function useProjectPresence(projectIds: string[]) {
  const { user } = useAuth();
  const [presenceByProject, setPresenceByProject] = useState<Record<string, ProjectUserPresence[]>>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    if (!user) return;
    
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setUserName(data?.full_name || user.email || 'Usuário');
        setAvatarUrl(data?.avatar_url || null);
      });
  }, [user]);

  const roomId = useMemo(() => {
    if (projectIds.length === 0) return null;
    // Create a stable room ID based on first few project IDs
    return `projects:${projectIds.slice(0, 10).sort().join('-').substring(0, 50)}`;
  }, [projectIds]);

  useEffect(() => {
    if (!user || !roomId) return;

    const presenceChannel = supabase.channel(`dashboard-presence:${roomId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const byProject: Record<string, ProjectUserPresence[]> = {};
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence: ProjectUserPresence) => {
            if (presence.user_id !== user.id && presence.project_id) {
              if (!byProject[presence.project_id]) {
                byProject[presence.project_id] = [];
              }
              // Avoid duplicates
              if (!byProject[presence.project_id].some(p => p.user_id === presence.user_id)) {
                byProject[presence.project_id].push(presence);
              }
            }
          });
        });
        
        setPresenceByProject(byProject);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence without specific project
          await presenceChannel.track({
            user_id: user.id,
            user_name: userName || user.email || 'Usuário',
            avatar_url: avatarUrl,
            online_at: new Date().toISOString(),
            project_id: null
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user, roomId, userName, avatarUrl]);

  const trackProjectView = useCallback(async (projectId: string) => {
    if (!channel || !user) return;

    await channel.track({
      user_id: user.id,
      user_name: userName || user.email || 'Usuário',
      avatar_url: avatarUrl,
      online_at: new Date().toISOString(),
      project_id: projectId
    });
  }, [channel, user, userName, avatarUrl]);

  const getProjectOnlineUsers = useCallback((projectId: string): ProjectUserPresence[] => {
    return presenceByProject[projectId] || [];
  }, [presenceByProject]);

  return {
    presenceByProject,
    trackProjectView,
    getProjectOnlineUsers,
    isConnected: !!channel
  };
}
