import { FolderKanban, Star, Globe, AlertTriangle, TrendingUp, Users } from 'lucide-react';
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
      borderColor: 'border-primary/20',
    },
    {
      label: t('stats.favorites'),
      value: favorites,
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      label: t('stats.published'),
      value: published,
      icon: Globe,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: t('stats.overdue'),
      value: overdue,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      highlight: overdue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={stat.label}
            className={cn(
              'group relative bg-card rounded-xl border p-4 sm:p-5 transition-all duration-300',
              'hover:shadow-lg hover:-translate-y-0.5',
              stat.highlight 
                ? 'border-destructive/40 shadow-[0_0_20px_-5px_hsl(var(--destructive)/0.15)]' 
                : 'border-border/60 shadow-sm',
            )}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Top row: label + icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <div className={cn(
                'w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
                stat.bgColor
              )}>
                <Icon className={cn('w-4 h-4 sm:w-[18px] sm:h-[18px]', stat.color)} />
              </div>
            </div>

            {/* Value */}
            <p className={cn(
              'text-2xl sm:text-3xl font-bold tracking-tight text-card-foreground tabular-nums',
              stat.highlight && 'text-destructive'
            )}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
