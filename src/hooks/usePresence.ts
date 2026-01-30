import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  online_at: string;
  viewing_project?: string;
  viewing_account?: string;
}

export interface PresenceState {
  [key: string]: UserPresence[];
}

export function usePresence(roomId?: string) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
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

  const trackPresence = useCallback(async (viewingProject?: string, viewingAccount?: string) => {
    if (!channel || !user) return;

    const userStatus: UserPresence = {
      user_id: user.id,
      user_name: userName,
      avatar_url: avatarUrl,
      online_at: new Date().toISOString(),
      viewing_project: viewingProject,
      viewing_account: viewingAccount
    };

    await channel.track(userStatus);
  }, [channel, user, userName, avatarUrl]);

  useEffect(() => {
    if (!user || !roomId) return;

    const presenceChannel = supabase.channel(`presence:${roomId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState() as PresenceState;
        const users: UserPresence[] = [];
        
        Object.values(state).forEach(presences => {
          presences.forEach(presence => {
            if (presence.user_id !== user.id) {
              users.push(presence);
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            user_name: userName || user.email || 'Usuário',
            avatar_url: avatarUrl,
            online_at: new Date().toISOString()
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user, roomId, userName, avatarUrl]);

  return {
    onlineUsers,
    trackPresence,
    isConnected: !!channel
  };
}
