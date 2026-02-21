import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Check, 
  CheckCheck,
  FolderKanban,
  Users,
  UserPlus,
  Pencil,
  Loader2
} from 'lucide-react';
import { useCollaboration, CollaborationNotification } from '@/hooks/useCollaboration';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const notificationIcons: Record<string, React.ReactNode> = {
  project_invitation: <UserPlus className="w-4 h-4 text-primary" />,
  account_invitation: <Users className="w-4 h-4 text-primary" />,
  project_update: <Pencil className="w-4 h-4 text-blue-500" />,
  project_shared: <FolderKanban className="w-4 h-4 text-green-500" />
};

export function CollaborationNotifications() {
  const [open, setOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acceptProjectInvitation,
    acceptAccountInvitation,
  } = useCollaboration();

  const handleNotificationClick = (notification: CollaborationNotification) => {
    if (!notification.read_at) {
      markNotificationAsRead(notification.id);
    }
  };

  const isInvite = (n: CollaborationNotification) =>
    n.type === 'project_invitation' || n.type === 'account_invitation';

  const handleAcceptInvite = async (e: React.MouseEvent, notification: CollaborationNotification) => {
    e.stopPropagation();
    if (!user?.email) return;

    setAcceptingId(notification.id);
    try {
      if (notification.type === 'project_invitation') {
        const { data } = await supabase
          .from('project_collaborators')
          .select('id')
          .eq('project_id', notification.entity_id)
          .eq('invited_email', user.email)
          .is('accepted_at', null)
          .maybeSingle();

        if (data) {
          const result = await acceptProjectInvitation(data.id);
          if (result.success) {
            markNotificationAsRead(notification.id);
            setOpen(false);
            window.location.reload();
          }
        }
      } else if (notification.type === 'account_invitation') {
        const { data } = await supabase
          .from('account_collaborators')
          .select('id')
          .eq('account_id', notification.entity_id)
          .eq('invited_email', user.email)
          .is('accepted_at', null)
          .maybeSingle();

        if (data) {
          const result = await acceptAccountInvitation(data.id);
          if (result.success) {
            markNotificationAsRead(notification.id);
            setOpen(false);
            window.location.reload();
          }
        }
      }
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadNotificationsCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => markAllNotificationsAsRead()}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    className={cn(
                      'w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors',
                      !notification.read_at && 'bg-primary/5'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {notificationIcons[notification.type] || <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm',
                            !notification.read_at && 'font-medium'
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read_at && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true,
                            locale: ptBR 
                          })}
                        </p>
                        {/* Accept Invite Button */}
                        {isInvite(notification) && !notification.read_at && (
                          <Button
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            disabled={acceptingId === notification.id}
                            onClick={(e) => handleAcceptInvite(e, notification)}
                          >
                            {acceptingId === notification.id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <UserPlus className="w-3 h-3 mr-1" />
                            )}
                            Aceitar Convite
                          </Button>
                        )}
                      </div>
                    </div>
                  </button>
                  {index < notifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
