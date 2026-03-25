import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Unlock, Users } from 'lucide-react';
import { useSystemUsers, useSpaceShares, useShareSpace, useUnshareSpace, KanbanSpace } from '@/hooks/useKanbanSpaces';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ShareSpaceModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  space: KanbanSpace;
}

export function ShareSpaceModal({ open, onOpenChange, space }: ShareSpaceModalProps) {
  const { user } = useAuth();
  const { data: systemUsers, isLoading: usersLoading } = useSystemUsers();
  const { data: shares = [], isLoading: sharesLoading } = useSpaceShares(space.id);
  const shareSpace = useShareSpace();
  const unshareSpace = useUnshareSpace();

  const sharedUserIds = new Set(shares.map(s => s.shared_with));
  const otherUsers = systemUsers?.filter(u => u.user_id !== user?.id) || [];

  const handleToggle = (userId: string, isShared: boolean) => {
    if (isShared) {
      unshareSpace.mutate({ spaceId: space.id, userId });
    } else {
      shareSpace.mutate({ spaceId: space.id, userId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Compartilhar espaço
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: space.color }} />
            <span className="text-sm font-medium">{space.name}</span>
            {space.is_shared ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Ative o compartilhamento para que outros usuários vejam este espaço no Kanban deles.
          </p>

          {usersLoading || sharesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-10 ml-auto rounded-full" />
                </div>
              ))}
            </div>
          ) : otherUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum outro usuário encontrado.
            </p>
          ) : (
            <div className="space-y-1 max-h-[350px] overflow-y-auto">
              {otherUsers.map((u) => {
                const isShared = sharedUserIds.has(u.user_id);
                return (
                  <div
                    key={u.user_id}
                    className={cn(
                      'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                      isShared ? 'bg-emerald-500/5' : 'hover:bg-muted/50'
                    )}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.full_name || 'Sem nome'}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <Switch
                      checked={isShared}
                      onCheckedChange={() => handleToggle(u.user_id, isShared)}
                      disabled={shareSpace.isPending || unshareSpace.isPending}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
