import { LayoutDashboard, Star, Archive, Tag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onNewProject: () => void;
}

const navItems = [
  { id: 'all', label: 'Projetos', icon: LayoutDashboard },
  { id: 'favorites', label: 'Favoritos', icon: Star },
  { id: 'new', label: 'Novo', icon: Plus, isAction: true },
  { id: 'archived', label: 'Arquivados', icon: Archive },
  { id: 'tags', label: 'Tags', icon: Tag },
];

export function MobileBottomNav({ activeView, onViewChange, onNewProject }: MobileBottomNavProps) {
  const handleClick = (item: typeof navItems[0]) => {
    if (item.isAction) {
      onNewProject();
    } else {
      onViewChange(item.id);
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom"
      role="navigation"
      aria-label="Menu principal"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isAction = item.isAction;

          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isAction
                  ? 'bg-primary text-primary-foreground shadow-lg -mt-4 rounded-full p-3'
                  : isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isAction && 'w-6 h-6')} />
              {!isAction && (
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive && 'text-primary'
                )}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
