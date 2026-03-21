import { 
  LayoutDashboard, 
  Kanban, 
  FileText, 
  Sparkles, 
  BarChart3,
  Receipt,
  FolderOpen,
  UsersRound,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const mainItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/kanban', label: 'Kanban', icon: Kanban },
  { path: '/proposals', label: 'Propostas', icon: FileText },
  { path: '/ideas', label: 'Ideias', icon: Sparkles },
];

const moreItems = [
  { path: '/reports', label: 'Relatórios', icon: BarChart3 },
  { path: '/billing', label: 'Faturamento', icon: Receipt },
  { path: '/files', label: 'Arquivos', icon: FolderOpen },
  { path: '/teams', label: 'Equipes', icon: UsersRound },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/dashboard' && location.pathname.startsWith(path));

  const moreIsActive = moreItems.some((item) => isActive(item.path));

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn('text-[10px] font-medium', active && 'text-primary')}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More menu */}
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <button
              aria-label="Mais opções"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                moreIsActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className={cn('text-[10px] font-medium', moreIsActive && 'text-primary')}>
                Mais
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-48 p-1"
            sideOffset={8}
          >
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMoreOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
