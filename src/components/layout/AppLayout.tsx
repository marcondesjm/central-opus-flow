import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileSidebar } from './MobileSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { AppFooter } from './AppFooter';
import { useAccounts, LovableAccount } from '@/hooks/useProjects';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const [activeView, setActiveView] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const location = useLocation();

  // Derive active view from current route for sidebar highlighting
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
        <div className="hidden lg:block">
          <Sidebar {...sidebarProps} />
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
