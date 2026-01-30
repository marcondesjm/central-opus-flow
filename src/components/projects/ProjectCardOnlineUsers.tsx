import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ProjectUserPresence } from '@/hooks/useProjectPresence';

interface ProjectCardOnlineUsersProps {
  users: ProjectUserPresence[];
  maxDisplay?: number;
}

export function ProjectCardOnlineUsers({ users, maxDisplay = 3 }: ProjectCardOnlineUsersProps) {
  if (users.length === 0) return null;

  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  return (
    <div className="flex items-center -space-x-1.5">
      {displayUsers.map((user) => (
        <Tooltip key={user.user_id}>
          <TooltipTrigger asChild>
            <div className="relative">
              <Avatar className="w-6 h-6 ring-2 ring-card cursor-pointer transition-transform hover:scale-110 hover:z-10">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 ring-1 ring-card" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-medium">{user.user_name}</p>
            <p className="text-muted-foreground">Visualizando agora</p>
          </TooltipContent>
        </Tooltip>
      ))}

      {remainingCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "w-6 h-6 ring-2 ring-card rounded-full bg-muted flex items-center justify-center cursor-pointer text-xs font-medium text-muted-foreground"
            )}>
              +{remainingCount}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>{remainingCount} mais online</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
