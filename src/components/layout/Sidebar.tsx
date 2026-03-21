import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { SidebarCustomizeModal, getSidebarVisibility, type SidebarVisibility } from '@/components/layout/SidebarCustomizeModal';
import { useScheduledMessagesCount } from '@/hooks/useScheduledMessagesCount';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Star, 
  Archive, 
  Plus,
  ChevronDown,
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

function BlogSidebarPreview() {
  const { data: posts } = useBlogPosts('pt');
  const latestPosts = posts?.slice(0, 3);
  if (!latestPosts || latestPosts.length === 0) return null;

  return (
    <div className="mt-1 space-y-1 px-1">
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
}

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
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [accountPage, setAccountPage] = useState(0);
  const ACCOUNTS_PER_PAGE = 3;
  const [spacesOpen, setSpacesOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
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
  const NavItem = ({ icon: Icon, label, onClick, active, badge, className: extraClass }: {
    icon: any; label: string; onClick: () => void; active?: boolean; badge?: number; className?: string;
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
              const serverVersion = systemVersion?.version || '1.0.0';
              const isOutdated = storedVersion !== serverVersion || lastSeenVersion !== serverVersion;
              if (isOutdated) {
                return (
                  <button
                    onClick={() => { localStorage.setItem(LOCAL_VERSION_KEY, serverVersion); localStorage.setItem(LAST_SEEN_KEY, serverVersion); window.location.reload(); }}
                    className="flex items-center gap-1 text-[10px] text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t('sidebar.updateTo', { version: serverVersion })}
                  </button>
                );
              }
              return (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  v{serverVersion}
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
            label={t('sidebar.allProjects')}
            onClick={() => { onViewChange('all'); onAccountChange(null); }}
            active={isViewActive('all')}
          />
          <Button
            size="sm"
            className="w-full justify-start gap-2 rounded-xl text-sm font-medium"
            onClick={() => navigate('/dashboard?newProject=true')}
          >
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>
          <NavItem icon={Kanban} label="Kanban" onClick={() => navigate('/kanban')} active={isRouteActive('/kanban')} badge={scheduledCount} />
          {sidebarVisibility.proposals && (
            <NavItem icon={FileText} label={t('sidebar.proposals')} onClick={() => navigate('/proposals')} active={isRouteActive('/proposals')} />
          )}
          <NavItem icon={Sparkles} label="Ideias" onClick={() => navigate('/ideas')} active={isRouteActive('/ideas')} />
          <NavItem icon={BarChart3} label="Relatórios" onClick={() => navigate('/reports')} active={isRouteActive('/reports')} />
        </div>

        {/* ── CONTAS ── */}
        <SectionLabel>{t('sidebar.accounts')}</SectionLabel>
        <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-sidebar-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isLoading && accounts.length > 0 && (
                <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  <Coins className="w-3 h-3" aria-hidden="true" />
                  {accounts.reduce((sum, acc) => sum + (acc.credits ?? 0), 0)}
                </span>
              )}
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', accountsOpen ? 'rotate-0' : '-rotate-90')} aria-hidden="true" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 mt-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-4" role="status">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">{t('sidebar.noAccounts')}</p>
            ) : (
              <ul role="list" className="space-y-0.5">
                {accounts.map((account) => {
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
            {sidebarVisibility.favorites && (
              <NavItem icon={Star} label={t('sidebar.favorites')} onClick={() => { onViewChange('favorites'); onAccountChange(null); }} active={isViewActive('favorites')} />
            )}
            {sidebarVisibility.archived && (
              <NavItem icon={Archive} label={t('sidebar.archived')} onClick={() => { onViewChange('archived'); onAccountChange(null); }} active={isViewActive('archived')} />
            )}
            {sidebarVisibility.tags && (
              <NavItem icon={Tag} label={t('sidebar.tags')} onClick={() => { onViewChange('tags'); onAccountChange(null); }} active={isViewActive('tags')} />
            )}
          </div>
        )}

        {/* ── ESPAÇOS KANBAN ── */}
        {sidebarVisibility.kanban && (
          <>
            <SectionLabel>Espaços</SectionLabel>
            <Collapsible open={spacesOpen} onOpenChange={setSpacesOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-sidebar-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Kanban Spaces</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="p-0.5 rounded hover:bg-sidebar-accent" onClick={(e) => { e.stopPropagation(); navigate('/kanban'); }}>
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', spacesOpen ? 'rotate-0' : '-rotate-90')} aria-hidden="true" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-1">
                <ul role="list" className="space-y-0.5">
                  <li>
                    <button onClick={() => navigate('/kanban')} className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200">
                      <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] bg-muted">📋</span>
                      <span className="flex-1 text-left truncate">Todos</span>
                    </button>
                  </li>
                  {spaces && spaces.length > 0 ? spaces.map((space) => (
                    <li key={space.id}>
                      <button onClick={() => navigate(`/kanban?space=${space.id}`)} className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 group">
                        <span className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0" style={{ backgroundColor: space.color + '20', color: space.color }}>🗂</span>
                        <span className="flex-1 text-left truncate">{space.name}</span>
                      </button>
                    </li>
                  )) : (
                    <li><p className="text-xs text-muted-foreground px-3 py-2">Nenhum espaço criado</p></li>
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* ── GESTÃO ── */}
        <SectionLabel>Gestão</SectionLabel>
        <div className="space-y-0.5">
          {sidebarVisibility.billing && (
            <Collapsible open={billingOpen} onOpenChange={setBillingOpen}>
              <CollapsibleTrigger className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isRouteActive('/billing') ? 'bg-primary/10 text-primary border-l-[3px] border-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
              )}>
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4" aria-hidden="true" />
                  {t('sidebar.billing')}
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', billingOpen ? 'rotate-0' : '-rotate-90')} aria-hidden="true" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-0.5">
                <div className="ml-4 space-y-0.5 border-l-2 border-sidebar-border pl-3">
                  {[
                    { id: 'overview', label: t('sidebar.billingOverview'), icon: BarChart3 },
                    { id: 'clients', label: t('sidebar.billingClients'), icon: Building2 },
                    { id: 'ai-costs', label: t('sidebar.billingAiCredits'), icon: Bot },
                    { id: 'expenses', label: t('sidebar.billingExpenses'), icon: Minus },
                    { id: 'history', label: t('sidebar.billingHistory'), icon: Clock },
                    { id: 'pix', label: t('sidebar.billingPix'), icon: CreditCard },
                  ].map(item => (
                    <button key={item.id} onClick={() => navigate(`/billing?tab=${item.id}`)} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-150">
                      <item.icon className="w-3.5 h-3.5" aria-hidden="true" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {sidebarVisibility.teams && (
            <NavItem icon={UsersRound} label="Equipes" onClick={() => navigate('/teams')} active={isRouteActive('/teams')} />
          )}
          {sidebarVisibility.collaborations && (
            <NavItem icon={Share2} label={t('sidebar.collaborations')} onClick={() => navigate('/collaborations')} active={isRouteActive('/collaborations')} />
          )}
          <NavItem icon={FolderOpen} label="Arquivos" onClick={() => navigate('/files')} active={isRouteActive('/files')} />
          <NavItem icon={MessageCircle} label="Mensagens" onClick={() => navigate('/kanban?panel=scheduled')} badge={scheduledCount} active={false} />
        </div>

        {/* ── RECURSOS ── */}
        <SectionLabel>Recursos</SectionLabel>
        <div className="space-y-0.5">
          <NavItem icon={BookOpen} label="Manual" onClick={() => navigate('/manual')} active={isRouteActive('/manual')} />
          <NavItem icon={FileCode2} label="Documentação" onClick={() => navigate('/documentation')} active={isRouteActive('/documentation')} />
          {sidebarVisibility.wordpress && (
            <NavItem icon={Globe} label={t('sidebar.wordpress')} onClick={() => onViewChange('wordpress')} active={activeView === 'wordpress' && !selectedAccount} />
          )}
          {sidebarVisibility.blog && (
            <div>
              <NavItem icon={BookOpen} label={t('common.blog')} onClick={() => navigate('/blog')} active={isRouteActive('/blog')} />
              <BlogSidebarPreview />
            </div>
          )}
        </div>

        {/* Customize */}
        <div className="pt-3 mt-2 border-t border-sidebar-border">
          <button onClick={() => setCustomizeOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200">
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            Personalizar menu
          </button>
        </div>
      </nav>

      <SidebarCustomizeModal open={customizeOpen} onOpenChange={setCustomizeOpen} onUpdate={setSidebarVisibility} />

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
                  ? (expiresAt || (sub?.created_at ? new Date(new Date(sub.created_at).getTime() + 15 * 24 * 60 * 60 * 1000) : null))
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
