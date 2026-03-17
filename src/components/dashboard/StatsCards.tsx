import { FolderKanban, Star, Globe, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface StatsCardsProps {
  totalProjects: number;
  favorites: number;
  published: number;
  archived: number;
  overdue?: number;
}

export function StatsCards({ totalProjects, favorites, published, archived, overdue = 0 }: StatsCardsProps) {
  const { t } = useTranslation();
  const stats = [
    {
      label: t('stats.totalProjects'),
      value: totalProjects,
      icon: FolderKanban,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: t('stats.favorites'),
      value: favorites,
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: t('stats.published'),
      value: published,
      icon: Globe,
      color: 'text-status-published',
      bgColor: 'bg-status-published/10',
    },
    {
      label: t('stats.overdue'),
      value: overdue,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      highlight: overdue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={stat.label}
            className={cn(
              'bg-card rounded-xl border border-border p-3 sm:p-4 shadow-card hover:shadow-card-hover transition-all duration-300',
              stat.highlight && 'border-destructive/50 shadow-[0_0_12px_-3px_hsl(var(--destructive)/0.4)]'
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={cn('p-2 sm:p-2.5 rounded-lg shrink-0', stat.bgColor)}>
                <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', stat.color)} />
              </div>
              <div className="min-w-0">
                <p className={cn('text-xl sm:text-2xl font-bold text-card-foreground truncate', stat.highlight && 'text-destructive')}>
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
