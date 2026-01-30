import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Star, 
  Archive, 
  Settings, 
  Plus,
  ChevronDown,
  Users,
  Tag,
  LogOut,
  Loader2,
  Coins,
  Pencil,
  Shield,
  MessageCircle,
  Clock,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useRoles';
import { LovableAccount } from '@/hooks/useProjects';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  selectedAccount: string | null;
  onAccountChange: (accountId: string | null) => void;
  accounts: LovableAccount[];
  isLoading?: boolean;
  onAddAccount?: () => void;
  onEditAccount?: (account: LovableAccount) => void;
  onOpenSettings?: () => void;
  onOpenKeys?: () => void;
}

const accountColorMap: Record<string, string> = {
  blue: 'bg-account-blue',
  emerald: 'bg-account-emerald',
  amber: 'bg-account-amber',
  rose: 'bg-account-rose',
  violet: 'bg-account-violet',
};

export function Sidebar({ 
  activeView, 
  onViewChange, 
  selectedAccount, 
  onAccountChange,
  accounts,
  isLoading,
  onAddAccount,
  onEditAccount,
  onOpenSettings,
  onOpenKeys
}: SidebarProps) {
  const [accountsOpen, setAccountsOpen] = useState(true);
  const { signOut, user } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();

  const navItems = [
    { id: 'all', label: 'Todos os Projetos', icon: LayoutDashboard },
    { id: 'favorites', label: 'Favoritos', icon: Star },
    { id: 'archived', label: 'Arquivados', icon: Archive },
    { id: 'tags', label: 'Tags', icon: Tag },
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
            <h1 className="font-semibold text-sidebar-foreground">ProjectHub</h1>
            <p className="text-xs text-muted-foreground">Gerenciador Lovable</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin" aria-label="Navegação principal">
        <ul role="list" className="space-y-1">
          {navItems.map((item) => {
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

        {/* Accounts Section */}
        <div className="pt-4">
          <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen}>
            <CollapsibleTrigger 
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-sidebar-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded-md"
              aria-expanded={accountsOpen}
              aria-controls="accounts-list"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Contas</span>
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
                <div className="flex items-center justify-center py-4" role="status" aria-label="Carregando contas">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">Carregando contas...</span>
                </div>
              ) : accounts.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-2">
                  Nenhuma conta adicionada
                </p>
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
                Adicionar Conta
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>

      {/* Footer */}
      <footer className="p-4 border-t border-sidebar-border space-y-1" role="contentinfo">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground truncate" aria-label={`Usuário logado: ${user.email}`}>
              {user.email}
            </p>
          </div>
        )}
        
        {/* WhatsApp Support Button */}
        <a
          href="https://wa.me/5548996029392?text=Olá! Preciso de suporte com o ProjectHub."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir suporte via WhatsApp"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar group"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          <div className="flex flex-col items-start">
            <span>Suporte</span>
            <span className="text-[10px] text-muted-foreground group-hover:text-emerald-600/70 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Seg-Sex 8h às 18h
            </span>
          </div>
        </a>

        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')}
            aria-label="Abrir painel administrativo"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          >
            <Shield className="w-4 h-4" aria-hidden="true" />
            Painel Admin
          </button>
        )}
        <button 
          onClick={onOpenKeys}
          aria-label="Gerenciar API Keys"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <Key className="w-4 h-4" aria-hidden="true" />
          API Keys
        </button>
        <button
          onClick={onOpenSettings}
          aria-label="Abrir configurações"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          Configurações
        </button>
        <button 
          onClick={handleSignOut}
          aria-label="Sair da conta"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sair
        </button>
      </footer>
    </aside>
  );
}
