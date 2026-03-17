import { useState, useMemo } from 'react';
import { AppNavBar } from '@/components/layout/AppNavBar';
import { useKanbanDeals, PRIORITY_OPTIONS } from '@/hooks/useKanban';
import { useKanbanColumns } from '@/hooks/useKanbanColumns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from 'recharts';
import {
  ArrowLeft, BarChart3, PieChartIcon, TrendingUp, Clock,
  Layers, CalendarDays, Timer, Loader2,
} from 'lucide-react';
import { format, differenceInDays, subDays, startOfDay, isAfter, isBefore, eachWeekOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const CHART_COLORS = [
  'hsl(var(--primary))',
  '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
];

export default function Reports() {
  const { data: deals, isLoading } = useKanbanDeals();
  const { data: columns } = useKanbanColumns();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState('30');
  const [groupBy, setGroupBy] = useState<'phase' | 'priority'>('phase');

  const now = new Date();
  const periodDays = parseInt(period);
  const startDate = subDays(now, periodDays);

  const filteredDeals = useMemo(() =>
    (deals || []).filter(d => isAfter(new Date(d.created_at), startDate)),
    [deals, startDate.getTime()]
  );

  const allDeals = deals || [];

  // ── 1. Grouped Report ────────────────────────
  const groupedData = useMemo(() => {
    const groups: Record<string, number> = {};
    allDeals.forEach(d => {
      const key = groupBy === 'phase' ? d.phase : d.priority;
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups).map(([name, count]) => {
      const label = groupBy === 'phase'
        ? columns?.find(c => c.id === name)?.name || name
        : PRIORITY_OPTIONS.find(p => p.id === name)?.label || name;
      return { name: label, count };
    });
  }, [allDeals, groupBy, columns]);

  // ── 2. Pie Chart ─────────────────────────────
  const pieData = useMemo(() => {
    const groups: Record<string, number> = {};
    allDeals.forEach(d => {
      const key = groupBy === 'phase'
        ? (columns?.find(c => c.id === d.phase)?.name || d.phase)
        : (PRIORITY_OPTIONS.find(p => p.id === d.priority)?.label || d.priority);
      groups[key] = (groups[key] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [allDeals, groupBy, columns]);

  // ── 3. Created vs Completed over time ────────
  const createdVsCompleted = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 });
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const created = allDeals.filter(d => {
        const dt = new Date(d.created_at);
        return isAfter(dt, weekStart) && isBefore(dt, weekEnd);
      }).length;
      const completed = allDeals.filter(d => {
        if (!d.completed_at) return false;
        const dt = new Date(d.completed_at);
        return isAfter(dt, weekStart) && isBefore(dt, weekEnd);
      }).length;
      return {
        week: format(weekStart, 'dd/MM', { locale: ptBR }),
        Criados: created,
        Concluídos: completed,
      };
    });
  }, [allDeals, startDate.getTime()]);

  // ── 4. Recently Created ──────────────────────
  const recentlyCreated = useMemo(() => {
    const last14 = subDays(now, 14);
    const recent = allDeals
      .filter(d => isAfter(new Date(d.created_at), last14))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Group by day
    const days: Record<string, number> = {};
    recent.forEach(d => {
      const day = format(new Date(d.created_at), 'dd/MM', { locale: ptBR });
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).reverse().map(([name, count]) => ({ name, count }));
  }, [allDeals]);

  // ── 5. Items by Time Since ───────────────────
  const timeSinceData = useMemo(() => {
    const buckets = [
      { label: 'Hoje', max: 1 },
      { label: '1-3 dias', max: 3 },
      { label: '4-7 dias', max: 7 },
      { label: '1-2 sem', max: 14 },
      { label: '2-4 sem', max: 28 },
      { label: '1-3 meses', max: 90 },
      { label: '3+ meses', max: Infinity },
    ];
    const openDeals = allDeals.filter(d => !d.completed_at);
    return buckets.map(b => ({
      name: b.label,
      count: openDeals.filter(d => {
        const age = differenceInDays(now, new Date(d.created_at));
        const prevMax = buckets[buckets.indexOf(b) - 1]?.max || 0;
        return age >= prevMax && age < b.max;
      }).length,
    }));
  }, [allDeals]);

  // ── 6. Average Age ───────────────────────────
  const avgAgeData = useMemo(() => {
    const phases: Record<string, { total: number; count: number }> = {};
    allDeals.filter(d => !d.completed_at).forEach(d => {
      const label = columns?.find(c => c.id === d.phase)?.name || d.phase;
      if (!phases[label]) phases[label] = { total: 0, count: 0 };
      phases[label].total += differenceInDays(now, new Date(d.created_at));
      phases[label].count += 1;
    });
    return Object.entries(phases).map(([name, { total, count }]) => ({
      name,
      dias: Math.round(total / count),
    }));
  }, [allDeals, columns]);

  // ── 7. Resolution Time ───────────────────────
  const resolutionData = useMemo(() => {
    const completed = allDeals.filter(d => d.completed_at);
    const buckets = [
      { label: '< 1 dia', max: 1 },
      { label: '1-3 dias', max: 3 },
      { label: '4-7 dias', max: 7 },
      { label: '1-2 sem', max: 14 },
      { label: '2-4 sem', max: 28 },
      { label: '1+ mês', max: Infinity },
    ];
    return buckets.map(b => ({
      name: b.label,
      count: completed.filter(d => {
        const time = differenceInDays(new Date(d.completed_at!), new Date(d.created_at));
        const prevMax = buckets[buckets.indexOf(b) - 1]?.max || 0;
        return time >= prevMax && time < b.max;
      }).length,
    }));
  }, [allDeals]);

  // Stats
  const totalOpen = allDeals.filter(d => !d.completed_at).length;
  const totalCompleted = allDeals.filter(d => d.completed_at).length;
  const avgAge = totalOpen > 0
    ? Math.round(allDeals.filter(d => !d.completed_at).reduce((sum, d) => sum + differenceInDays(now, new Date(d.created_at)), 0) / totalOpen)
    : 0;
  const avgResolution = totalCompleted > 0
    ? Math.round(allDeals.filter(d => d.completed_at).reduce((sum, d) => sum + differenceInDays(new Date(d.completed_at!), new Date(d.created_at)), 0) / totalCompleted)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const chartHeight = isMobile ? 220 : 280;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card px-3 md:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/kanban')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-base md:text-lg font-semibold">Relatórios</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
                <CalendarDays className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7" className="text-xs">Últimos 7 dias</SelectItem>
                <SelectItem value="14" className="text-xs">Últimos 14 dias</SelectItem>
                <SelectItem value="30" className="text-xs">Últimos 30 dias</SelectItem>
                <SelectItem value="90" className="text-xs">Últimos 90 dias</SelectItem>
                <SelectItem value="365" className="text-xs">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={(v: 'phase' | 'priority') => setGroupBy(v)}>
              <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                <Layers className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phase" className="text-xs">Agrupar por Fase</SelectItem>
                <SelectItem value="priority" className="text-xs">Agrupar por Prioridade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-3 md:px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total de Itens', value: allDeals.length, icon: Layers },
            { label: 'Em Aberto', value: totalOpen, icon: Clock },
            { label: 'Concluídos', value: totalCompleted, icon: TrendingUp },
            { label: 'Média Idade (dias)', value: avgAge, icon: Timer },
          ].map((stat) => (
            <Card key={stat.label} className="border">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1. Grouped Bar Chart */}
          <Card>
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Relatório com Agrupamento
              </CardTitle>
              <CardDescription className="text-xs">
                Itens agrupados por {groupBy === 'phase' ? 'fase' : 'prioridade'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 pb-3">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={groupedData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={isMobile ? 60 : 80} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Itens" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. Pie Chart */}
          <Card>
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" />
                Gráfico de Pizza
              </CardTitle>
              <CardDescription className="text-xs">
                Distribuição por {groupBy === 'phase' ? 'fase' : 'prioridade'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 pb-3">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={isMobile ? 70 : 90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. Created vs Completed */}
          <Card>
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Criados vs Concluídos
              </CardTitle>
              <CardDescription className="text-xs">
                Comparação semanal no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 pb-3">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <AreaChart data={createdVsCompleted}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Criados" fill="#ef4444" fillOpacity={0.15} stroke="#ef4444" strokeWidth={2} />
                  <Area type="monotone" dataKey="Concluídos" fill="#22c55e" fillOpacity={0.15} stroke="#22c55e" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 4. Recently Created */}
          <Card>
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Itens Recentemente Criados
              </CardTitle>
              <CardDescription className="text-xs">
                Itens criados nos últimos 14 dias
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 pb-3">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={recentlyCreated}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Criados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 5. Time Since (age buckets) */}
          <Card>
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Tempo Desde Criação
              </CardTitle>
              <CardDescription className="text-xs">
                Itens em aberto agrupados por idade
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 pb-3">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={timeSinceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Itens" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 6. Average Age by Phase */}
          <Card>
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                Média de Idade por Fase
              </CardTitle>
              <CardDescription className="text-xs">
                Tempo médio dos itens não resolvidos por fase
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 pb-3">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={avgAgeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={isMobile ? 60 : 80} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => [`${v} dias`, 'Média']} />
                  <Bar dataKey="dias" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Dias" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 7. Resolution Time */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Tempo de Resolução
              </CardTitle>
              <CardDescription className="text-xs">
                Distribuição do tempo para conclusão de itens ({totalCompleted} concluídos)
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-4 pb-3">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Itens concluídos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
