import { useState, useCallback, useEffect } from 'react';
import { Notification } from '@/components/notifications/NotificationCenter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'centralopusflow-notifications';

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const WELCOME_SHOWN_KEY = 'centralopusflow-welcome-shown';
const LAST_NOTIFIED_VERSION_KEY = 'centralopusflow-last-notified-version';

export function useNotifications() {
  const { user } = useAuth();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }));
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
    return [];
  });

  const [collabNotifications, setCollabNotifications] = useState<Notification[]>([]);

  // Fetch collaboration notifications from database
  useEffect(() => {
    if (!user) return;

    const fetchCollabNotifications = async () => {
      const { data, error } = await supabase
        .from('collaboration_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const mapped: Notification[] = data.map((n) => ({
          id: `collab-${n.id}`,
          title: n.title,
          message: n.message,
          type: 'info' as const,
          read: !!n.read_at,
          createdAt: new Date(n.created_at),
          entityType: n.entity_type,
          entityId: n.entity_id,
          notificationType: n.type,
        }));
        setCollabNotifications(mapped);
      }
    };

    fetchCollabNotifications();

    // Realtime subscription for new collaboration notifications
    const channel = supabase
      .channel('notif-center-collab')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const n = payload.new as any;
          const isScheduledMessage = n.type === 'scheduled_message';
          const mapped: Notification = {
            id: `collab-${n.id}`,
            title: n.title,
            message: n.message,
            type: isScheduledMessage ? 'warning' : 'info',
            read: false,
            createdAt: new Date(n.created_at),
            entityType: n.entity_type,
            entityId: n.entity_id,
            notificationType: n.type,
          };
          setCollabNotifications(prev => [mapped, ...prev]);

          // Play sound alert for scheduled messages
          if (isScheduledMessage) {
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const playTone = (freq: number, start: number, dur: number) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime + start);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + dur);
                osc.start(audioCtx.currentTime + start);
                osc.stop(audioCtx.currentTime + start + dur);
              };
              playTone(587, 0, 0.15);
              playTone(784, 0.15, 0.15);
              playTone(880, 0.3, 0.3);
            } catch (e) {
              console.warn('Audio alert failed:', e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Ref for addNotification to avoid circular dependency
  const addNotificationRef = useCallback((
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      read: false,
      createdAt: new Date(),
    };
    setLocalNotifications(prev => [newNotification, ...prev].slice(0, 50));
    return newNotification;
  }, []);

  // Listen for new project feedback
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notif-feedback-watch')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_feedback',
        },
        async (payload) => {
          const fb = payload.new as any;
          // Check if the project belongs to the current user
          const { data: project } = await supabase
            .from('projects')
            .select('id, name, user_id')
            .eq('id', fb.project_id)
            .single();

          if (project && project.user_id === user.id) {
            const typeLabel = fb.author_type === 'client' ? 'Cliente' : 'Equipe';
            addNotificationRef({
              title: `💬 Novo feedback em "${project.name}"`,
              message: `${fb.author_name} (${typeLabel}): ${fb.comment?.substring(0, 100)}${fb.comment?.length > 100 ? '...' : ''}`,
              type: 'info',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addNotificationRef]);

  // Add welcome notification on first visit
  useEffect(() => {
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!welcomeShown && localNotifications.length === 0) {
      const welcomeNotification: Notification = {
        id: generateId(),
        title: 'Bem-vindo ao Central Opus Flow! 🎉',
        message: 'Gerencie todos os seus projetos em um só lugar. Comece adicionando sua primeira conta.',
        type: 'info',
        read: false,
        createdAt: new Date(),
      };
      setLocalNotifications([welcomeNotification]);
      localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
  }, []);

  // Listen for version changes via realtime and add notification
  useEffect(() => {
    if (!user) return;

    // Check current version on mount
    const checkVersion = async () => {
      const { data } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'app_version')
        .maybeSingle();
      if (!data?.value) return;

      const lastNotified = localStorage.getItem(LAST_NOTIFIED_VERSION_KEY);
      if (!lastNotified) {
        localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, data.value);
        return;
      }
      if (lastNotified !== data.value) {
        localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, data.value);
        addVersionNotification(data.value);
      }
    };

    checkVersion();

    // Listen for realtime changes to system_config
    const channel = supabase
      .channel('notif-version-watch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_config' },
        (payload) => {
          const row = payload.new as any;
          if (row?.key === 'app_version') {
            const lastNotified = localStorage.getItem(LAST_NOTIFIED_VERSION_KEY);
            if (lastNotified && lastNotified !== row.value) {
              localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, row.value);
              addVersionNotification(row.value);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addVersionNotification = (version: string) => {
    const notification: Notification = {
      id: generateId(),
      title: `Atualização v${version} disponível 🚀`,
      message: 'Uma nova versão do sistema está disponível. Atualize para ter acesso às últimas melhorias.',
      type: 'info',
      read: false,
      createdAt: new Date(),
    };
    setLocalNotifications(prev => [notification, ...prev].slice(0, 50));
  };

  // Persist local notifications to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotifications));
  }, [localNotifications]);

  // Merge both sources, sorted by date
  const notifications = [...localNotifications, ...collabNotifications]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50);

  const addNotification = addNotificationRef;

  const markAsRead = useCallback((id: string) => {
    if (id.startsWith('collab-')) {
      const realId = id.replace('collab-', '');
      supabase
        .from('collaboration_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', realId)
        .then();
      setCollabNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } else {
      setLocalNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (user) {
      supabase
        .from('collaboration_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)
        .then();
      setCollabNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }, [user]);

  const deleteNotification = useCallback((id: string) => {
    if (id.startsWith('collab-')) {
      const realId = id.replace('collab-', '');
      supabase
        .from('collaboration_notifications')
        .delete()
        .eq('id', realId)
        .then();
      setCollabNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      setLocalNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, []);

  const clearAll = useCallback(() => {
    setLocalNotifications([]);
    if (user) {
      supabase
        .from('collaboration_notifications')
        .delete()
        .eq('user_id', user.id)
        .then();
      setCollabNotifications([]);
    }
  }, [user]);

  // Helper functions for common notification types
  const notifySuccess = useCallback((title: string, message: string) => {
    return addNotification({ title, message, type: 'success' });
  }, [addNotification]);

  const notifyError = useCallback((title: string, message: string) => {
    return addNotification({ title, message, type: 'error' });
  }, [addNotification]);

  const notifyWarning = useCallback((title: string, message: string) => {
    return addNotification({ title, message, type: 'warning' });
  }, [addNotification]);

  const notifyInfo = useCallback((title: string, message: string) => {
    return addNotification({ title, message, type: 'info' });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}
