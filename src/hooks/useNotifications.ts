import { useState, useCallback, useEffect } from 'react';
import { Notification } from '@/components/notifications/NotificationCenter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'centralopusflow-notifications';

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const WELCOME_SHOWN_KEY = 'centralopusflow-welcome-shown';

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
          const mapped: Notification = {
            id: `collab-${n.id}`,
            title: n.title,
            message: n.message,
            type: 'info',
            read: false,
            createdAt: new Date(n.created_at),
            entityType: n.entity_type,
            entityId: n.entity_id,
            notificationType: n.type,
          };
          setCollabNotifications(prev => [mapped, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Add welcome notification on first visit
  useEffect(() => {
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!welcomeShown && localNotifications.length === 0) {
      const welcomeNotification: Notification = {
        id: generateId(),
        title: 'Bem-vindo ao Central Opus Flow! 🎉',
        message: 'Gerencie todos os seus projetos Lovable em um só lugar. Comece adicionando sua primeira conta.',
        type: 'info',
        read: false,
        createdAt: new Date(),
      };
      setLocalNotifications([welcomeNotification]);
      localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
  }, []);

  // Persist local notifications to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localNotifications));
  }, [localNotifications]);

  // Merge both sources, sorted by date
  const notifications = [...localNotifications, ...collabNotifications]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 50);

  const addNotification = useCallback((
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
