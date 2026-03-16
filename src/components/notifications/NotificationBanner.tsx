import { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, AlertCircle, Info, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from './NotificationCenter';

interface NotificationBannerProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const iconMap = {
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
};

const borderMap = {
  info: 'border-l-blue-500',
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  error: 'border-l-red-500',
};

export function NotificationBanner({ notifications, onMarkAsRead }: NotificationBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // Track which notifications existed on mount so we only show NEW ones
  useEffect(() => {
    setSeenIds(new Set(notifications.map(n => n.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  const visibleNotifications = notifications.filter(
    n => !n.read && !dismissedIds.has(n.id) && !seenIds.has(n.id)
  );

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
    onMarkAsRead(id);
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {visibleNotifications.map((notification) => {
          const isScheduledMsg = notification.notificationType === 'scheduled_message';

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto"
            >
              <div className={`bg-card border border-border border-l-4 ${borderMap[notification.type]} rounded-xl p-4 shadow-lg ${isScheduledMsg ? 'ring-2 ring-amber-500/50 animate-pulse' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {isScheduledMsg ? <MessageCircle className="w-5 h-5 text-green-500" /> : iconMap[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                    {isScheduledMsg && (
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-1">
                        📲 Abra o menu Agendadas no Kanban para enviar
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
