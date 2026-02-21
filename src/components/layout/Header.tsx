import { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Plus, Users, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationCenter, Notification } from '@/components/notifications/NotificationCenter';
import { CollaborationNotifications } from '@/components/collaboration/CollaborationNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onNewProject?: () => void;
  mobileMenuTrigger?: ReactNode;
  onOpenSearch?: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearNotifications?: () => void;
  onAcceptInvite?: (notification: Notification) => Promise<void>;
}

export function Header({ 
  searchQuery, 
  onSearchChange, 
  viewMode, 
  onViewModeChange, 
  onNewProject, 
  mobileMenuTrigger, 
  onOpenSearch,
  notifications = [],
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onDeleteNotification = () => {},
  onClearNotifications = () => {},
  onAcceptInvite,
}: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<{ avatar_url: string | null; full_name: string | null } | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

  // Fetch profile and subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();

    // Subscribe to realtime updates with unique channel name
    const channelName = `header-profile-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as { avatar_url?: string | null; full_name?: string | null };
            setProfile({
              avatar_url: newData.avatar_url ?? null,
              full_name: newData.full_name ?? null,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm gap-2 sm:gap-4">
      {/* Mobile Menu */}
      {mobileMenuTrigger}

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="relative cursor-pointer"
              onClick={onOpenSearch}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSearch?.();
                }}
                className="pl-10 bg-background border-border focus-visible:ring-primary/20 text-sm cursor-pointer"
                aria-label={t('header.searchAriaLabel')}
                readOnly={!!onOpenSearch}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t('header.globalSearch')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* View Toggle */}
        <div className="hidden sm:flex items-center bg-muted rounded-lg p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onViewModeChange('grid')}
                aria-label={t('header.gridView')}
                aria-pressed={viewMode === 'grid'}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  viewMode === 'grid'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('header.gridView')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onViewModeChange('list')}
                aria-label={t('header.listView')}
                aria-pressed={viewMode === 'list'}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  viewMode === 'list'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('header.listView')}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Collaborations Page Link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/collaborations')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Users className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
              <p>{t('header.manageCollaborations')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Collaboration Notifications */}
        <CollaborationNotifications />

        {/* System Notifications */}
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onDelete={onDeleteNotification}
          onClearAll={onClearNotifications}
          onAcceptInvite={onAcceptInvite}
        />

        {/* New Project */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="gap-2 shadow-sm text-sm" onClick={onNewProject} size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('header.newProject')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('header.newProjectTooltip')}</p>
          </TooltipContent>
        </Tooltip>

        {/* User Avatar */}
        {user && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="w-8 h-8 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all">
                {profile?.avatar_url && (
                  <AvatarImage 
                    src={profile.avatar_url} 
                    alt={profile?.full_name || user.email || 'Avatar'}
                    onLoadingStatusChange={(status) => setAvatarLoading(status === 'loading')}
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {avatarLoading && profile?.avatar_url ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{profile?.full_name || user.email}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
