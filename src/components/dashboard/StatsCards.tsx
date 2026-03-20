import { FolderKanban, Star, Globe, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
      accentColor: 'hsl(263, 70%, 58%)',
      accentBg: 'bg-[hsl(263,70%,58%)]/10',
      accentText: 'text-[hsl(263,70%,58%)]',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: t('stats.favorites'),
      value: favorites,
      icon: Star,
      accentColor: 'hsl(38, 92%, 50%)',
      accentBg: 'bg-[hsl(38,92%,50%)]/10',
      accentText: 'text-[hsl(38,92%,50%)]',
      trend: '+3',
      trendUp: true,
    },
    {
      label: t('stats.published'),
      value: published,
      icon: Globe,
      accentColor: 'hsl(160, 84%, 39%)',
      accentBg: 'bg-[hsl(160,84%,39%)]/10',
      accentText: 'text-[hsl(160,84%,39%)]',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: t('stats.overdue'),
      value: overdue,
      icon: AlertTriangle,
      accentColor: overdue > 0 ? 'hsl(0, 72%, 55%)' : 'hsl(220, 13%, 45%)',
      accentBg: overdue > 0 ? 'bg-[hsl(0,72%,55%)]/10' : 'bg-muted/50',
      accentText: overdue > 0 ? 'text-[hsl(0,72%,55%)]' : 'text-muted-foreground',
      trend: overdue > 0 ? `${overdue}` : '0',
      trendUp: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="group relative animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-xl p-4 sm:p-5 transition-all duration-300',
                'bg-card border border-border',
                'hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]',
                'active:scale-[0.98]',
              )}
              style={{
                ['--hover-border' as string]: stat.accentColor,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = stat.accentColor;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${stat.accentColor}15`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.accentBg)}>
                    <Icon className={cn('w-4 h-4', stat.accentText)} />
                  </div>
                  <div className={cn('flex items-center gap-1 text-xs font-medium', stat.trendUp ? 'text-[hsl(160,84%,39%)]' : overdue > 0 ? 'text-[hsl(0,72%,55%)]' : 'text-muted-foreground')}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : overdue > 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    <span>{stat.trend}</span>
                  </div>
                </div>

                <p className={cn('text-3xl sm:text-4xl font-bold tracking-tight tabular-nums', stat.accentText)}>
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
