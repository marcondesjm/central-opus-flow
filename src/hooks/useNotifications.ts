import { useState, useCallback, useEffect } from 'react';
import { Notification } from '@/components/notifications/NotificationCenter';

const STORAGE_KEY = 'projecthub-notifications';

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const WELCOME_SHOWN_KEY = 'projecthub-welcome-shown';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
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

  // Add welcome notification on first visit
  useEffect(() => {
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!welcomeShown && notifications.length === 0) {
      const welcomeNotification: Notification = {
        id: generateId(),
        title: 'Bem-vindo ao ProjectHub! 🎉',
        message: 'Gerencie todos os seus projetos Lovable em um só lugar. Comece adicionando sua primeira conta.',
        type: 'info',
        read: false,
        createdAt: new Date(),
      };
      setNotifications([welcomeNotification]);
      localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      read: false,
      createdAt: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50
    return newNotification;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

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
