import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Star, 
  Archive, 
  Plus,
  ChevronDown,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';

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
            <img
              src={post.cover_image}
              alt=""
              className="w-9 h-9 rounded-md object-cover flex-shrink-0 mt-0.5"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-sidebar-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {post.title}
            </p>
          </div>
        </Link>
      ))}
    </div>
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
  const [billingOpen, setBillingOpen] = useState(false);
  const [profile, setProfile] = useState<{ avatar_url: string | null; full_name: string | null } | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const { signOut, user } = useAuth();
  
  const navigate = useNavigate();
  const { data: subscription } = useSubscription();
  const { t } = useTranslation();
  const { data: systemVersion } = useSystemVersion();

  // Fetch profile data and subscribe to realtime updates
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
    const channelName = `sidebar-profile-${user.id}`;
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

  const planConfig = {
    free: { label: 'Free', icon: Sparkles, color: 'bg-muted text-muted-foreground' },
    pro: { label: 'Pro', icon: Crown, color: 'bg-primary/20 text-primary' },
    business: { label: 'Business', icon: Crown, color: 'bg-amber-500/20 text-amber-600' },
  };

  const currentPlan = subscription?.plan || 'free';
  const planInfo = planConfig[currentPlan as keyof typeof planConfig];

  const topNavItems = [
    { id: 'all', label: t('sidebar.allProjects'), icon: LayoutDashboard },
  ];

  const bottomNavItems = [
    { id: 'favorites', label: t('sidebar.favorites'), icon: Star },
    { id: 'archived', label: t('sidebar.archived'), icon: Archive },
    { id: 'tags', label: t('sidebar.tags'), icon: Tag },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside 
      className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col"
      role="navigation"
      aria-label="Menu principal"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center" aria-hidden="true">
            <FolderKanban className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground text-sm">Central Opus Flow</h1>
            <p className="text-xs text-muted-foreground">v{systemVersion?.version || '1.3.1'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin" aria-label="Navegação principal">
        {/* Todos os Projetos - primeiro item */}
        <ul role="list" className="space-y-1">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && !selectedAccount;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id);
                    onAccountChange(null);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Accounts Section - logo após Todos os Projetos */}
        <div className="pt-2">
          <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen}>
            <CollapsibleTrigger 
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded-md"
              aria-expanded={accountsOpen}
              aria-controls="accounts-list"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('sidebar.accounts')}</span>
              </div>
              <div className="flex items-center gap-2">
                {!isLoading && accounts.length > 0 && (
                  <span 
                    className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium normal-case"
                    aria-label={`Total de ${accounts.reduce((sum, acc) => sum + (acc.credits ?? 0), 0)} créditos`}
                  >
                    <Coins className="w-3 h-3" aria-hidden="true" />
                    {accounts.reduce((sum, acc) => sum + (acc.credits ?? 0), 0)}
                  </span>
                )}
                <ChevronDown 
                  className={cn(
                    'w-3.5 h-3.5 transition-transform duration-200',
                    accountsOpen ? 'rotate-0' : '-rotate-90'
                  )} 
                  aria-hidden="true"
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent id="accounts-list" className="space-y-1 mt-1">
              {isLoading ? (
                 <div className="flex items-center justify-center py-4" role="status" aria-label={t('sidebar.loadingAccounts')}>
                   <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">Carregando contas...</span>
                </div>
              ) : accounts.length === 0 ? (
                 <p className="text-xs text-muted-foreground px-3 py-2">{t('sidebar.noAccounts')}</p>
              ) : (
                <ul role="list" className="space-y-1">
                  {accounts.map((account) => {
                    const isActive = selectedAccount === account.id;
                    
                    return (
                      <li
                        key={account.id}
                        className={cn(
                          'group w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-all duration-200',
                          isActive
                            ? 'bg-primary/15 text-sidebar-foreground ring-1 ring-primary/30'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        <button
                          onClick={() => {
                            onAccountChange(account.id);
                            onViewChange('all');
                          }}
                          aria-current={isActive ? 'true' : undefined}
                          aria-label={`Selecionar conta ${account.name}, ${account.credits ?? 0} créditos`}
                          className="flex-1 flex items-center gap-2.5 text-left min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-md"
                        >
                          <span 
                            className={cn(
                              'w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-background shadow-sm',
                              accountColorMap[account.color] || 'bg-muted'
                            )} 
                            aria-hidden="true"
                          />
                          <span className="flex-1 truncate font-medium">{account.name}</span>
                        </button>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span 
                            className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"
                            aria-label={`${account.credits ?? 0} créditos`}
                          >
                            <Coins className="w-3 h-3" aria-hidden="true" />
                            <span aria-hidden="true">{account.credits ?? 0}</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAccount?.(account);
                            }}
                            aria-label={`Editar conta ${account.name}`}
                            className={cn(
                              'p-1.5 rounded-md transition-all duration-200',
                              'text-muted-foreground hover:text-foreground',
                              'hover:bg-primary/20 active:scale-95',
                              'opacity-60 group-hover:opacity-100 focus:opacity-100',
                              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                            )}
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground mt-2 focus-visible:ring-2 focus-visible:ring-primary"
                onClick={onAddAccount}
                aria-label="Adicionar nova conta"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t('sidebar.addAccount')}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Demais itens de navegação */}
        <ul role="list" className="space-y-1 pt-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && !selectedAccount;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id);
                    onAccountChange(null);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Kanban button */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/kanban')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            aria-label="Abrir Kanban de Clientes"
          >
            <Kanban className="w-4 h-4" aria-hidden="true" />
            Kanban
          </button>
        </div>

        {/* Faturamento with submenu */}
        <div className="pt-1">
          <button
            onClick={() => setBillingOpen(!billingOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            aria-label="Abrir Faturamento"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-4 h-4" aria-hidden="true" />
              Faturamento
            </div>
            {billingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {billingOpen && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-sidebar-border pl-3">
              {[
                { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                { id: 'clients', label: 'Por Cliente', icon: Building2 },
                { id: 'ai-costs', label: 'IA & Créditos', icon: Bot },
                { id: 'expenses', label: 'Despesas', icon: Minus },
                { id: 'history', label: 'Histórico', icon: Clock },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/billing?tab=${item.id}`)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-150"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Collaborations button */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/collaborations')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            aria-label={t('sidebar.collaborations')}
          >
            <Share2 className="w-4 h-4" aria-hidden="true" />
            {t('sidebar.collaborations')}
          </button>
        </div>

        {/* WordPress button */}
        <div className="pt-1">
          <button
            onClick={() => onViewChange('wordpress')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
              activeView === 'wordpress' && !selectedAccount
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
            aria-label="Abrir WordPress"
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            WordPress
          </button>
        </div>

        {/* Blog button */}
        <div className="pt-2">
          <button
            onClick={() => navigate('/blog')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            aria-label="Abrir Blog"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            {t('common.blog')}
          </button>

          {/* Blog Posts Preview */}
          <BlogSidebarPreview />
        </div>
      </nav>

      {/* Footer */}
      <footer className="p-4 border-t border-sidebar-border space-y-1" role="contentinfo">
        {user && (
          <div className="px-3 py-2 mb-2 space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 ring-2 ring-primary/20">
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
              <div className="flex-1 min-w-0">
                {profile?.full_name && (
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.full_name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground truncate" aria-label={`Usuário logado: ${user.email}`}>
                  {user.email}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={cn("text-xs gap-1 w-fit", planInfo.color)}
            >
              <planInfo.icon className="w-3 h-3" />
              {t('sidebar.plan')} {planInfo.label}
            </Badge>
          </div>
        )}

        <button 
          onClick={handleSignOut}
          aria-label="Sair da conta"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          {t('sidebar.signOut')}
        </button>
      </footer>
    </aside>
  );
}
