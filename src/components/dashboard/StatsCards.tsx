import { FolderKanban, Star, Globe, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
      gradient: 'from-[hsl(243,75%,59%)] to-[hsl(280,65%,55%)]',
      glowColor: 'hsl(243 75% 59% / 0.2)',
      iconBg: 'bg-white/20',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: t('stats.favorites'),
      value: favorites,
      icon: Star,
      gradient: 'from-[hsl(38,92%,50%)] to-[hsl(25,95%,53%)]',
      glowColor: 'hsl(38 92% 50% / 0.2)',
      iconBg: 'bg-white/20',
      trend: '+3',
      trendUp: true,
    },
    {
      label: t('stats.published'),
      value: published,
      icon: Globe,
      gradient: 'from-[hsl(160,84%,39%)] to-[hsl(172,66%,50%)]',
      glowColor: 'hsl(160 84% 39% / 0.2)',
      iconBg: 'bg-white/20',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: t('stats.overdue'),
      value: overdue,
      icon: AlertTriangle,
      gradient: overdue > 0 
        ? 'from-[hsl(0,72%,51%)] to-[hsl(350,89%,60%)]'
        : 'from-[hsl(215,20%,65%)] to-[hsl(220,9%,46%)]',
      glowColor: overdue > 0 ? 'hsl(0 72% 51% / 0.2)' : 'transparent',
      iconBg: 'bg-white/20',
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
            {/* Glow effect */}
            <div
              className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              style={{ background: stat.glowColor }}
            />

            <div
              className={cn(
                'relative overflow-hidden rounded-xl p-4 sm:p-5 transition-all duration-300',
                'bg-gradient-to-br text-white',
                'hover:-translate-y-1 hover:shadow-xl',
                'active:scale-[0.98]',
                stat.gradient,
              )}
            >
              {/* Decorative circles */}
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.iconBg)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-white/80">
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : overdue > 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : null}
                    <span>{stat.trend}</span>
                  </div>
                </div>

                <p className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-white/70 mt-1 uppercase tracking-wider">
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
