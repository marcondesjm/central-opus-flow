import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Project {
  id: string;
  status: string;
  type: string;
  is_favorite: boolean;
  created_at: string;
}

interface ProjectChartsProps {
  projects: Project[];
}

const STATUS_COLORS: Record<string, string> = {
  published: 'hsl(160, 84%, 39%)',
  draft: 'hsl(38, 92%, 50%)',
  archived: 'hsl(220, 13%, 45%)',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
  archived: 'Arquivado',
};

const CustomTooltipStyle = {
  backgroundColor: 'hsl(222, 41%, 8%)',
  border: '1px solid hsl(217, 33%, 15%)',
  borderRadius: '12px',
  color: 'hsl(220, 13%, 91%)',
  fontSize: '12px',
  padding: '10px 14px',
  boxShadow: '0 8px 24px hsl(222 47% 2% / 0.5)',
};

export function ProjectCharts({ projects }: ProjectChartsProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { published: 0, draft: 0, archived: 0 };
    projects.forEach(p => {
      if (counts[p.status] !== undefined) counts[p.status]++;
    });
    return Object.entries(counts)
      .filter(([_, v]) => v > 0)
      .map(([name, value]) => ({
        name: STATUS_LABELS[name] || name,
        value,
        fill: STATUS_COLORS[name] || 'hsl(var(--muted))',
      }));
  }, [projects]);

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('pt-BR', { month: 'short' });
      months[key] = 0;
    }
    projects.forEach(p => {
      const date = new Date(p.created_at);
      const key = date.toLocaleDateString('pt-BR', { month: 'short' });
      if (months[key] !== undefined) months[key]++;
    });
    let acc = 0;
    return Object.entries(months).map(([name, count]) => {
      acc += count;
      return { name, novos: count, total: acc };
    });
  }, [projects]);

  const totalByStatus = statusData.reduce((s, d) => s + d.value, 0);

  if (projects.length === 0) return null;

  return (
    <div className="mb-6">
      {/* Mobile toggle */}
      <div className="sm:hidden mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between rounded-xl"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-5 gap-4 ${!isExpanded && isMobile ? 'hidden' : ''}`}>
        {/* Line / Area Chart — 3 cols */}
        <Card className="lg:col-span-3 border-border bg-card rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              Crescimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 15%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'hsl(220, 13%, 60%)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(220, 13%, 60%)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(263, 70%, 58%)"
                    strokeWidth={2.5}
                    fill="url(#gradientArea)"
                    dot={{ r: 4, fill: 'hsl(263, 70%, 58%)', strokeWidth: 2, stroke: 'hsl(222, 41%, 8%)' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(222, 41%, 8%)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart — 2 cols */}
        <Card className="lg:col-span-2 border-border bg-card rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <PieIcon className="w-4 h-4 text-primary" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] sm:h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 45 : 58}
                    outerRadius={isMobile ? 68 : 82}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="hsl(222, 41%, 8%)"
                    strokeWidth={3}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{totalByStatus}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">projetos</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
