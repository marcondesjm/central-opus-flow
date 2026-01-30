import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserPresence } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';

interface OnlineUsersProps {
  users: UserPresence[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function OnlineUsers({ users, maxDisplay = 5, size = 'md' }: OnlineUsersProps) {
  if (users.length === 0) return null;

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const ringSize = {
    sm: 'ring-1',
    md: 'ring-2',
    lg: 'ring-2'
  };

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {displayUsers.map((user) => (
          <Tooltip key={user.user_id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className={cn(
                  sizeClasses[size],
                  ringSize[size],
                  'ring-background cursor-pointer transition-transform hover:scale-110 hover:z-10'
                )}>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className={cn(
                  'absolute bottom-0 right-0 rounded-full bg-green-500 ring-background',
                  size === 'sm' ? 'w-2 h-2 ring-1' : 'w-2.5 h-2.5 ring-2'
                )} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{user.user_name}</p>
              <p className="text-xs text-muted-foreground">Online agora</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                sizeClasses[size],
                ringSize[size],
                'ring-background rounded-full bg-muted flex items-center justify-center cursor-pointer'
              )}>
                <span className="font-medium text-muted-foreground">
                  +{remainingCount}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} mais online</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
