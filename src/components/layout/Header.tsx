import { useState, useEffect } from 'react';
import { Search, Grid3X3, List, Plus, Users, Loader2, LogOut, UserPen, Crown, Clock, Settings, Key, MessageCircle, Shield, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NotificationCenter, Notification } from '@/components/notifications/NotificationCenter';
import { CollaborationNotifications } from '@/components/collaboration/CollaborationNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useRoles';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
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
  onOpenSettings?: () => void;
  onOpenKeys?: () => void;
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
  onOpenSettings,
  onOpenKeys,
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<{ avatar_url: string | null; full_name: string | null; created_at: string | null } | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const { data: subscription } = useSubscription();
  const isAdmin = useIsAdmin();

  // Fetch profile and subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, created_at')
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
            const newData = payload.new as { avatar_url?: string | null; full_name?: string | null; created_at?: string | null };
            setProfile({
              avatar_url: newData.avatar_url ?? null,
              full_name: newData.full_name ?? null,
              created_at: newData.created_at ?? null,
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

        {/* Subscription Days Left */}
        {(() => {
          const sub = subscription as any;
          const plan = sub?.plan || 'free';
          const expiresAt = sub?.expires_at ? new Date(sub.expires_at) : null;
          const trialEndsAt = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : null;
          const freeExpiration = plan === 'free' && sub?.created_at
            ? new Date(new Date(sub.created_at).getTime() + 15 * 24 * 60 * 60 * 1000)
            : null;
          const effectiveDate = expiresAt || trialEndsAt || freeExpiration;
          if (!effectiveDate) return null;
          const daysLeft = Math.ceil((effectiveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isPaidPlan = (plan === 'pro' || plan === 'business') && 
            (sub?.payment_status === 'paid' || sub?.payment_status === 'verified');
          if (isPaidPlan && daysLeft > 30) return null;
          const isExpired = daysLeft <= 0;
          const isUrgent = daysLeft <= 7;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border",
                  isExpired 
                    ? "bg-destructive/10 text-destructive border-destructive/30" 
                    : isUrgent 
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-muted text-muted-foreground border-border"
                )}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isExpired ? 'Expirado' : `${daysLeft}d`}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpired 
                  ? 'Sua assinatura expirou. Renove para continuar.' 
                  : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`
                }</p>
              </TooltipContent>
            </Tooltip>
          );
        })()}

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
                {profile?.full_name && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  <Crown className="w-3 h-3 text-primary" />
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {subscription?.plan === 'free' ? 'Grátis' : 
                     subscription?.plan === 'pro' ? 'Pro' : 
                     subscription?.plan === 'business' ? 'Business' : 'Grátis'}
                    {subscription?.plan !== 'free' && (
                      <span className="ml-1 text-muted-foreground">
                        • {(subscription as any)?.subscription_type === 'annual' ? 'Anual' : 'Mensal'}
                      </span>
                    )}
                  </Badge>
                </div>
                {profile?.created_at && (
                  <div className="flex items-center gap-1 text-[10px] mt-1 text-muted-foreground">
                    <CalendarDays className="w-3 h-3" />
                    Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                )}
                {(() => {
                  const expDate = (subscription as any)?.expires_at || (subscription as any)?.trial_ends_at;
                  if (!expDate) return null;
                  const diff = Math.max(0, Math.ceil((new Date(expDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                  const isPaid = (subscription as any)?.payment_status === 'paid' || (subscription as any)?.payment_status === 'verified';
                  if (isPaid && diff > 30) return null;
                  return (
                    <div className={`text-[10px] mt-1 font-medium ${diff <= 3 ? 'text-destructive' : diff <= 7 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                      ⏳ {diff > 0 ? `${diff} dia${diff !== 1 ? 's' : ''} restante${diff !== 1 ? 's' : ''}` : 'Expirado'}
                    </div>
                  );
                })()}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={() => navigate('/dashboard?settings=profile')}>
                <UserPen className="w-4 h-4" />
                {t('header.editProfile', 'Editar Perfil')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={onOpenSettings}>
                <Settings className="w-4 h-4" />
                {t('sidebar.settings', 'Configurações')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={onOpenKeys}>
                <Key className="w-4 h-4" />
                {t('sidebar.apiKeys', 'API Keys')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="https://wa.me/5548996029392?text=Olá! Preciso de suporte com o ProjectHub."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2 text-emerald-600 focus:text-emerald-600 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <div className="flex flex-col">
                    <span>{t('sidebar.support', 'Suporte')}</span>
                    <span className="text-[10px] text-muted-foreground">{t('sidebar.supportHours', 'Seg-Sex 8h às 18h')}</span>
                  </div>
                </a>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-amber-600 focus:text-amber-600" onClick={() => navigate('/admin')}>
                    <Shield className="w-4 h-4" />
                    {t('sidebar.adminPanel', 'Painel Admin')}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <LanguageSwitcher />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
                {t('header.logout', 'Sair')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
