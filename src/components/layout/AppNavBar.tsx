import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Kanban,
  FileText,
  Sparkles,
  BarChart3,
  Receipt,
  UsersRound,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/kanban', label: 'Kanban', icon: Kanban },
  { path: '/proposals', label: 'Propostas', icon: FileText },
  { path: '/ideas', label: 'Ideias', icon: Sparkles },
  { path: '/reports', label: 'Relatórios', icon: BarChart3 },
  { path: '/billing', label: 'Faturamento', icon: Receipt },
  { path: '/teams', label: 'Equipes', icon: UsersRound },
];

export function AppNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isActive
                    ? 'bg-primary/10 text-primary border-b-2 border-primary rounded-b-none'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isMobile && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
