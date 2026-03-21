import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

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

  if (projects.length === 0) return null;

  return (
    <Card className="border-border bg-card rounded-xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 h-full">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          Crescimento Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 15%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 13%, 60%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(220, 13%, 60%)' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
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
  );
}
