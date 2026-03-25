import { useState, useEffect, useRef } from 'react';
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

const AUTO_DISMISS_MS = 8000;
const MAX_VISIBLE = 2;

export function NotificationBanner({ notifications, onMarkAsRead }: NotificationBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('banner_dismissed_ids');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const initialIdsRef = useRef<Set<string>>(new Set(notifications.map(n => n.id)));

  // Persist dismissed IDs to sessionStorage so page navigation doesn't re-show them
  useEffect(() => {
    sessionStorage.setItem('banner_dismissed_ids', JSON.stringify([...dismissedIds]));
  }, [dismissedIds]);

  const visibleNotifications = notifications.filter(
    n => !n.read && !dismissedIds.has(n.id) && !initialIdsRef.current.has(n.id)
  );

  // Auto-dismiss each visible notification after a few seconds
  useEffect(() => {
    visibleNotifications.forEach(n => {
      if (!timerRefs.current.has(n.id)) {
        const timer = setTimeout(() => {
          handleDismiss(n.id);
          timerRefs.current.delete(n.id);
        }, AUTO_DISMISS_MS);
        timerRefs.current.set(n.id, timer);
      }
    });

    return () => {
      // cleanup on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNotifications.map(n => n.id).join(',')]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timerRefs.current.forEach(t => clearTimeout(t));
    };
  }, []);

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
    const timer = timerRefs.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerRefs.current.delete(id);
    }
  };

  if (visibleNotifications.length === 0) return null;

  // Only show up to MAX_VISIBLE, summarize the rest
  const shown = visibleNotifications.slice(0, MAX_VISIBLE);
  const hiddenCount = visibleNotifications.length - shown.length;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {shown.map((notification) => {
          const isScheduledMsg = notification.notificationType === 'scheduled_message';

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="pointer-events-auto"
            >
              <div className={`bg-card border border-border border-l-4 ${borderMap[notification.type]} rounded-xl p-3 shadow-lg`}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {isScheduledMsg ? <MessageCircle className="w-4 h-4 text-green-500" /> : iconMap[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {notification.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleDismiss(notification.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {/* Auto-dismiss progress bar */}
                <motion.div
                  className="h-0.5 bg-primary/30 rounded-full mt-2"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                />
              </div>
            </motion.div>
          );
        })}
        {hiddenCount > 0 && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-auto"
          >
            <div className="bg-card/90 border border-border rounded-lg px-3 py-2 shadow-md text-center">
              <p className="text-xs text-muted-foreground">
                +{hiddenCount} notificação{hiddenCount > 1 ? 'ões' : ''} — veja no sino 🔔
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
