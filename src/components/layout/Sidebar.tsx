import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { useLatestVersion } from '@/hooks/useChangelog';
import { SidebarCustomizeModal, getSidebarVisibility, type SidebarVisibility } from '@/components/layout/SidebarCustomizeModal';
import { useScheduledMessagesCount } from '@/hooks/useScheduledMessagesCount';
import { NewSaleModal } from '@/components/billing/NewSaleModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Star, 
  Archive, 
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Tag, 
  LogOut,
  Loader2,
  Coins,
  Pencil,
  Crown,
  Sparkles,
  BookOpen,
  Share2,
  Kanban,
  Receipt,
  Globe,
  BarChart3,
  Building2,
  Bot,
  Minus,
  Clock,
  RefreshCw,
  CheckCircle2,
  CreditCard,
  FileText,
  Settings2,
  UsersRound,
  MessageCircle,
  FileCode2,
  FolderOpen,
  Calendar as CalendarIcon,
  MessageSquare,
  CheckSquare,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { useKanbanSpaces } from '@/hooks/useKanbanSpaces';
import { LovableAccount } from '@/hooks/useProjects';
import { useSubscription } from '@/hooks/useSubscription';
import { useBlogPosts } from '@/hooks/useBlog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { getHighestVersion, isVersionBehind } from '@/lib/versioning';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  selectedAccount: string | null;
  onAccountChange: (accountId: string | null) => void;
  accounts: LovableAccount[];
  isLoading?: boolean;
  onAddAccount?: () => void;
  onEditAccount?: (account: LovableAccount) => void;
}

const accountColorMap: Record<string, string> = {
  blue: 'bg-account-blue',
  emerald: 'bg-account-emerald',
  amber: 'bg-account-amber',
  rose: 'bg-account-rose',
  violet: 'bg-account-violet',
};

const BlogSidebarPreview = React.forwardRef<HTMLDivElement>(function BlogSidebarPreview(_props, ref) {
  const { data: posts } = useBlogPosts('pt');
  const latestPosts = posts?.slice(0, 3);
  if (!latestPosts || latestPosts.length === 0) return null;

  return (
    <div ref={ref} className="mt-1 space-y-1 px-1">
      {latestPosts.map(post => (
        <Link
          key={post.id}
          to={`/blog/${post.slug}`}
          className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group"
        >
          {post.cover_image ? (
            <img src={post.cover_image} alt="" className="w-9 h-9 rounded-md object-cover flex-shrink-0 mt-0.5" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-sidebar-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{post.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest select-none">
      {children}
    </p>
  );
}

export function Sidebar({ 
  activeView, 
  onViewChange, 
  selectedAccount,
  onAccountChange,
  accounts,
  isLoading,
  onAddAccount,
  onEditAccount,
}: SidebarProps) {
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [accountPage, setAccountPage] = useState(0);
  const ACCOUNTS_PER_PAGE = 3;
  const [spacesOpen, setSpacesOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarVisibility, setSidebarVisibility] = useState<SidebarVisibility>(getSidebarVisibility);
  const [profile, setProfile] = useState<{ avatar_url: string | null; full_name: string | null } | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: subscription } = useSubscription();
  const { t } = useTranslation();
  const { data: spaces } = useKanbanSpaces();
  const scheduledCount = useScheduledMessagesCount();
  const { data: systemVersion } = useSystemVersion();
  const { data: latestVersion } = useLatestVersion();
  const targetVersion = getHighestVersion(latestVersion?.version, systemVersion?.version) || '1.0.0';

  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('avatar_url, full_name').eq('user_id', user.id).single();
      if (data) setProfile(data);
    };
    fetchProfile();
    const channelName = `sidebar-profile-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          const newData = payload.new as { avatar_url?: string | null; full_name?: string | null };
          setProfile({ avatar_url: newData.avatar_url ?? null, full_name: newData.full_name ?? null });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const planConfig = {
    free: { label: 'Free', icon: Sparkles, color: 'bg-muted text-muted-foreground' },
    pro: { label: 'Pro', icon: Crown, color: 'bg-primary/20 text-primary' },
    business: { label: 'Business', icon: Crown, color: 'bg-amber-500/20 text-amber-600' },
  };
  const currentPlan = subscription?.plan || 'free';
  const planInfo = planConfig[currentPlan as keyof typeof planConfig];

  const isRouteActive = (path: string) => location.pathname === path;
  const isViewActive = (viewId: string) => activeView === viewId && !selectedAccount && location.pathname === '/dashboard';

  const handleSignOut = async () => { await signOut(); };

  // Nav item renderer with active state
  const NavItem = ({ icon: Icon, label, onClick, active, badge, isNew, isBeta, className: extraClass }: {
    icon: any; label: string; onClick: () => void; active?: boolean; badge?: number; isNew?: boolean; isBeta?: boolean; className?: string;
  }) => (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar',
        'active:scale-[0.97]',
        active
          ? 'bg-primary/10 text-primary border-l-[3px] border-primary'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
        extraClass
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left truncate">{label}</span>
      {isNew && (
        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-primary text-primary-foreground animate-pulse">
          New
        </span>
      )}
      {isBeta && (
        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-500 text-white animate-pulse">
          Beta
        </span>
      )}
      {badge && badge > 0 ? (
        <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 min-w-[20px] flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </Badge>
      ) : null}
    </button>
  );

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col" role="navigation" aria-label="Menu principal">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center" aria-hidden="true">
            <FolderKanban className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-sm">Central Opus Flow</h1>
            {(() => {
              const LOCAL_VERSION_KEY = 'centralopusflow-app-version';
              const LAST_SEEN_KEY = 'centralopusflow-last-seen-version';
              const storedVersion = localStorage.getItem(LOCAL_VERSION_KEY);
              const lastSeenVersion = localStorage.getItem(LAST_SEEN_KEY);
              const installedVersion = storedVersion || targetVersion;
              const isOutdated = isVersionBehind(installedVersion, targetVersion) || isVersionBehind(lastSeenVersion, targetVersion);
              if (isOutdated) {
                return (
                  <button
                    onClick={() => { localStorage.setItem(LOCAL_VERSION_KEY, targetVersion); localStorage.setItem(LAST_SEEN_KEY, targetVersion); localStorage.setItem('centralopusflow-installed-at', new Date().toISOString()); window.location.reload(); }}
                    className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t('sidebar.updateTo', { version: targetVersion })}
                  </button>
                );
              }
              return (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  v{installedVersion}
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                </p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-2 overflow-y-auto scrollbar-thin" aria-label="Navegação principal">

        {/* ── PRINCIPAL ── */}
        <SectionLabel>Principal</SectionLabel>
        <div className="space-y-0.5">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={() => { onViewChange('all'); onAccountChange(null); navigate('/dashboard'); }}
            active={isViewActive('all') || isRouteActive('/dashboard')}
          />
          <NavItem
            icon={Globe}
            label="Meus Projetos"
            onClick={() => navigate('/portfolio-manager')}
            active={isRouteActive('/portfolio-manager')}
          />
          <NavItem
            icon={Users}
            label="Clientes"
            onClick={() => navigate('/clients')}
            active={isRouteActive('/clients')}
          />
          <NavItem
            icon={Kanban}
            label="Pipelines"
            onClick={() => navigate('/leads')}
            active={isRouteActive('/leads')}
          />
        </div>

        {/* ── CONTAS ── */}
        <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-1">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>Contas</span>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', accountsOpen ? 'rotate-0' : '-rotate-90')} aria-hidden="true" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 mt-1 ml-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4" role="status">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">{t('sidebar.noAccounts')}</p>
            ) : (
              <>
                <ul role="list" className="space-y-0.5">
                  {accounts.slice(accountPage * ACCOUNTS_PER_PAGE, (accountPage + 1) * ACCOUNTS_PER_PAGE).map((account) => {
                    const isActive = selectedAccount === account.id;
                    return (
                      <li key={account.id} className={cn('group w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-200', isActive ? 'bg-primary/15 text-sidebar-foreground ring-1 ring-primary/30' : 'text-sidebar-foreground hover:bg-sidebar-accent')}>
                        <button onClick={() => { onAccountChange(account.id); onViewChange('all'); }} className="flex-1 flex items-center gap-2.5 text-left min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                          <span className={cn('w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-background shadow-sm', accountColorMap[account.color] || 'bg-muted')} aria-hidden="true" />
                          <span className="flex-1 truncate font-medium">{account.name}</span>
                        </button>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                            <Coins className="w-3 h-3" aria-hidden="true" />
                            {account.credits ?? 0}
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); onEditAccount?.(account); }} aria-label={`Editar conta ${account.name}`} className={cn('p-1 rounded-md transition-all', 'text-muted-foreground hover:text-foreground hover:bg-primary/20', 'opacity-60 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary')}>
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {accounts.length > ACCOUNTS_PER_PAGE && (
                  <div className="flex items-center justify-between px-2 pt-1">
                    <button onClick={() => setAccountPage(p => Math.max(0, p - 1))} disabled={accountPage === 0} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Contas anteriores">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {accountPage * ACCOUNTS_PER_PAGE + 1}–{Math.min((accountPage + 1) * ACCOUNTS_PER_PAGE, accounts.length)} de {accounts.length}
                    </span>
                    <button onClick={() => setAccountPage(p => Math.min(Math.ceil(accounts.length / ACCOUNTS_PER_PAGE) - 1, p + 1))} disabled={(accountPage + 1) * ACCOUNTS_PER_PAGE >= accounts.length} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Próximas contas">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground mt-1" onClick={onAddAccount}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t('sidebar.addAccount')}
            </Button>
          </CollapsibleContent>
        </Collapsible>

        {/* Dashboard sub-filters */}
        {location.pathname === '/dashboard' && (
          <div className="space-y-0.5 mt-1">
            {sidebarVisibility.archived && (
              <NavItem icon={Archive} label={t('sidebar.archived')} onClick={() => { onViewChange('archived'); onAccountChange(null); }} active={isViewActive('archived')} />
            )}
            {sidebarVisibility.tags && (
              <NavItem icon={Tag} label={t('sidebar.tags')} onClick={() => { onViewChange('tags'); onAccountChange(null); }} active={isViewActive('tags')} />
            )}
          </div>
        )}

        {/* ── Separator ── */}
        <div className="my-3 mx-2 border-t border-sidebar-border" />

        {/* ── AÇÃO RÁPIDA ── */}
        <Button
          size="sm"
          variant="default"
          className="w-full justify-start gap-2 rounded-xl text-sm font-medium bg-primary mb-3"
          onClick={() => setNewSaleOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nova Venda
        </Button>

        {/* ── FERRAMENTAS ── */}
        <SectionLabel>Ferramentas</SectionLabel>
        <div className="space-y-0.5">
          <Collapsible defaultOpen={isRouteActive('/kanban') || isRouteActive('/whatsapp-automations')}>
            <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4" aria-hidden="true" />
                <span>Tarefas</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=closed]:-rotate-90" aria-hidden="true" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-0.5 ml-1">
              <NavItem icon={Kanban} label="Quadro" onClick={() => navigate('/kanban')} active={isRouteActive('/kanban')} badge={scheduledCount} />
              <NavItem icon={FileCheck} label="Conteúdos" onClick={() => navigate('/whatsapp-automations')} active={isRouteActive('/whatsapp-automations')} isBeta />
            </CollapsibleContent>
          </Collapsible>
          <NavItem icon={FileText} label={t('sidebar.proposals')} onClick={() => navigate('/proposals')} active={isRouteActive('/proposals')} />
          <NavItem icon={FileCode2} label="Briefings" onClick={() => navigate('/briefings')} active={isRouteActive('/briefings')} />
          {sidebarVisibility.billing && (
            <NavItem icon={Receipt} label={t('sidebar.billing')} onClick={() => navigate('/billing')} active={isRouteActive('/billing')} />
          )}
          <NavItem icon={CalendarIcon} label="Agenda" onClick={() => navigate('/agenda')} active={isRouteActive('/agenda')} />
          <NavItem icon={Share2} label="Social Media" onClick={() => navigate('/social')} active={isRouteActive('/social')} isNew isBeta />
          <NavItem icon={MessageSquare} label="Automações WhatsApp" onClick={() => navigate('/whatsapp-automations')} active={isRouteActive('/whatsapp-automations')} isNew isBeta />
          <NavItem icon={BarChart3} label={t('sidebar.reports')} onClick={() => navigate('/reports')} active={isRouteActive('/reports')} />
        </div>

        <div className="my-3 mx-2 border-t border-sidebar-border" />

        {/* ── MAIS ── */}
        <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <div className="flex items-center gap-3">
              <Settings2 className="w-4 h-4" aria-hidden="true" />
              <span>{t('sidebar.more')}</span>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', moreOpen ? 'rotate-0' : '-rotate-90')} aria-hidden="true" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 mt-0.5 ml-1">
            <NavItem icon={Sparkles} label={t('sidebar.ideas')} onClick={() => navigate('/ideas')} active={isRouteActive('/ideas')} />
            <NavItem icon={FolderOpen} label={t('sidebar.files')} onClick={() => navigate('/files')} active={isRouteActive('/files')} />
            <NavItem icon={Clock} label="Agendamento" onClick={() => navigate('/scheduling')} active={isRouteActive('/scheduling')} />
            {sidebarVisibility.teams && (
              <NavItem icon={UsersRound} label={t('sidebar.teams')} onClick={() => navigate('/teams')} active={isRouteActive('/teams')} />
            )}
            {sidebarVisibility.collaborations && (
              <NavItem icon={Share2} label={t('sidebar.collaborations')} onClick={() => navigate('/collaborations')} active={isRouteActive('/collaborations')} />
            )}
            <NavItem icon={BookOpen} label="Manual" onClick={() => navigate('/manual')} active={isRouteActive('/manual')} />
            {sidebarVisibility.wordpress && (
              <NavItem icon={Globe} label={t('sidebar.wordpress')} onClick={() => onViewChange('wordpress')} active={activeView === 'wordpress' && !selectedAccount} />
            )}
            {sidebarVisibility.blog && (
              <div>
                <NavItem icon={BookOpen} label={t('common.blog')} onClick={() => navigate('/blog')} active={isRouteActive('/blog')} />
                <BlogSidebarPreview />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Customize & Settings */}
        <div className="pt-3 mt-2 border-t border-sidebar-border space-y-0.5">
          <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200">
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            Configurações
          </button>
          <button onClick={() => setCustomizeOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200">
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Personalizar menu
          </button>
        </div>
      </nav>

      <SidebarCustomizeModal open={customizeOpen} onOpenChange={setCustomizeOpen} onUpdate={setSidebarVisibility} />
      <NewSaleModal open={newSaleOpen} onOpenChange={setNewSaleOpen} onOpenQuoteWizard={() => navigate('/billing?tab=servicos&action=quote')} />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Footer */}
      <footer className="p-3 border-t border-sidebar-border space-y-1" role="contentinfo">
        {user && (
          <div className="px-2 py-2 space-y-1.5">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile?.full_name || user.email || 'Avatar'} onLoadingStatusChange={(status) => setAvatarLoading(status === 'loading')} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {avatarLoading && profile?.avatar_url ? <Loader2 className="w-4 h-4 animate-spin" /> : (profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {profile?.full_name && <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.full_name}</p>}
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn("text-[10px] gap-1 w-fit", planInfo.color)}>
                <planInfo.icon className="w-3 h-3" />
                {planInfo.label}
              </Badge>
              {(() => {
                const sub = subscription as any;
                const expiresAt = sub?.expires_at ? new Date(sub.expires_at) : null;
                const trialEndsAt = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : null;
                const freeExpiration = currentPlan === 'free'
                  ? (expiresAt || (sub?.created_at ? new Date(new Date(sub.created_at).getTime() + 7 * 24 * 60 * 60 * 1000) : null))
                  : null;
                const effectiveDate = currentPlan === 'free' ? freeExpiration : (expiresAt || trialEndsAt);
                if (!effectiveDate) return null;
                const daysLeft = Math.ceil((effectiveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isPaidPlan = (currentPlan === 'pro' || currentPlan === 'business') && (sub?.payment_status === 'paid' || sub?.payment_status === 'verified');
                if (isPaidPlan && daysLeft > 30) return null;
                return (
                  <span className={cn("text-[10px]", daysLeft <= 3 ? 'text-destructive font-semibold' : daysLeft <= 7 ? 'text-amber-600' : 'text-muted-foreground')}>
                    {daysLeft <= 0 ? t('sidebar.expired') : t('sidebar.expiresIn', { days: daysLeft })}
                  </span>
                );
              })()}
            </div>
          </div>
        )}
        <button onClick={handleSignOut} aria-label="Sair da conta" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
          <LogOut className="w-4 h-4" aria-hidden="true" />
          {t('sidebar.signOut')}
        </button>
      </footer>
    </aside>
  );
}
