import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { AppFooter } from './AppFooter';
import { useAccounts, LovableAccount } from '@/hooks/useProjects';
import { useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AppLayoutProps {
  children: ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function AppLayout({ children }: AppLayoutProps) {
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const [activeView, setActiveView] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'; } catch { return false; }
  });
  const location = useLocation();

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next)); } catch {}
  };

  const getActiveViewFromRoute = () => {
    if (location.pathname === '/dashboard') return activeView;
    if (location.pathname === '/kanban') return 'kanban';
    if (location.pathname === '/proposals') return 'proposals';
    if (location.pathname === '/ideas') return 'ideas';
    if (location.pathname === '/reports') return 'reports';
    if (location.pathname === '/billing') return 'billing';
    if (location.pathname === '/teams') return 'teams';
    if (location.pathname === '/files') return 'files';
    if (location.pathname === '/collaborations') return 'collaborations';
    return activeView;
  };

  const sidebarProps = {
    activeView: getActiveViewFromRoute(),
    onViewChange: setActiveView,
    selectedAccount,
    onAccountChange: setSelectedAccount,
    accounts,
    isLoading: accountsLoading,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div
          className={cn(
            'hidden lg:block transition-all duration-300 ease-in-out relative flex-shrink-0',
            collapsed ? 'w-0 overflow-hidden' : 'w-64'
          )}
        >
          <Sidebar {...sidebarProps} />
        </div>

        {/* Collapse toggle button - desktop only */}
        <div className="hidden lg:flex items-start pt-3 -ml-px z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className="h-9 w-9 rounded-xl border-2 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary hover:border-primary/50 shadow-md hover:shadow-[0_0_16px_hsl(var(--primary)/0.25)] transition-all duration-200 active:scale-95"
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {collapsed ? 'Mostrar menu' : 'Esconder menu'}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center px-4 py-2 border-b border-border bg-card/80 backdrop-blur-xl">
            <MobileSidebar {...sidebarProps} />
            <span className="ml-3 font-semibold text-sm text-foreground">Central Opus Flow</span>
          </div>

          <main className="flex-1 overflow-y-auto scrollbar-thin flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <AppFooter />
          </main>
        </div>
      </div>
      <MobileBottomNav activeView={getActiveViewFromRoute()} onViewChange={setActiveView} onNewProject={() => {}} />
    </div>
  );
}
