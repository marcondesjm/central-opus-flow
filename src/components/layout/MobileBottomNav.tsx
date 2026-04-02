import { 
  LayoutDashboard, 
  Kanban, 
  FileText, 
  Sparkles, 
  Star,
  BarChart3,
  Receipt,
  FolderOpen,
  UsersRound,
  MoreHorizontal,
  BookOpen,
  Share2,
  Calendar,
  Clock,
  DollarSign,
  CheckSquare,
  Columns3,
  Settings,
  Globe,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useScheduledMessagesCount } from '@/hooks/useScheduledMessagesCount';

const SHORTCUT_MAP: Record<string, { path: string; label: string; icon: LucideIcon }> = {
  dashboard: { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  clientes: { path: '/clients', label: 'Clientes', icon: Users },
  pipelines: { path: '/leads', label: 'Pipelines', icon: Columns3 },
  kanban: { path: '/kanban', label: 'Kanban', icon: Kanban },
  agenda: { path: '/agenda', label: 'Agenda', icon: Calendar },
  financeiro: { path: '/billing', label: 'Financeiro', icon: DollarSign },
  propostas: { path: '/proposals', label: 'Propostas', icon: FileText },
  projetos: { path: '/portfolio-manager', label: 'Projetos', icon: Globe },
  relatorios: { path: '/reports', label: 'Relatórios', icon: BarChart3 },
};

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard?view=favorites', label: 'Aprovações', icon: Star },
  { path: '/proposals', label: 'Propostas', icon: FileText },
  { path: '/kanban', label: 'Kanban', icon: Kanban },
  { path: '/reports', label: 'Relatórios', icon: BarChart3 },
  { path: '/billing', label: 'Faturamento', icon: Receipt },
  { path: '/files', label: 'Versões', icon: FolderOpen },
  { path: '/teams', label: 'Equipes', icon: UsersRound },
  { path: '/collaborations', label: 'Colaborações', icon: Share2 },
  { path: '/ideas', label: 'Ideias', icon: Sparkles },
  { path: '/scheduling', label: 'Agenda', icon: Calendar },
  { path: '/manual', label: 'Manual', icon: BookOpen },
];

const MOBILE_SHORTCUTS_KEY = 'mobile-shortcuts';
const DEFAULT_SHORTCUTS = ['dashboard', 'clientes', 'pipelines', 'kanban'];

function getShortcuts(): string[] {
  try {
    const saved = localStorage.getItem(MOBILE_SHORTCUTS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  } catch { return DEFAULT_SHORTCUTS; }
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const scheduledCount = useScheduledMessagesCount();
  const [shortcuts, setShortcuts] = useState(getShortcuts);

  useEffect(() => {
    const handler = () => setShortcuts(getShortcuts());
    window.addEventListener('mobile-shortcuts-changed', handler);
    return () => window.removeEventListener('mobile-shortcuts-changed', handler);
  }, []);

  const mainItems = shortcuts
    .map(id => SHORTCUT_MAP[id])
    .filter(Boolean)
    .slice(0, 4);

  // Items not in main shortcuts go to "More" menu
  const mainPaths = new Set(mainItems.map(i => i.path));
  const moreItems = allNavItems.filter(i => !mainPaths.has(i.path));

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
      <div className="flex items-center justify-around px-1 py-1">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const showBadge = item.path === '/kanban' && scheduledCount > 0;

          return (
            <button
              key={item.path + item.label}
              onClick={() => navigate(item.path)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 min-w-[56px]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn('text-[10px] font-medium', active && 'text-primary')}>
                {item.label}
              </span>
              {showBadge && (
                <span className="absolute top-1 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                  {scheduledCount > 9 ? '9+' : scheduledCount}
                </span>
              )}
            </button>
          );
        })}

        {/* More menu */}
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <button
              aria-label="Mais opções"
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200 min-w-[56px]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                moreIsActive
                  ? 'text-primary bg-primary/10'
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
            className="w-52 p-1.5"
            sideOffset={8}
          >
            <div className="space-y-0.5">
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
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
