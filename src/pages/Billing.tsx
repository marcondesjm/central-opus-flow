import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, TrendingUp, TrendingDown, Receipt,
  Calendar, Building2, Filter, Download, Loader2, PieChart,
  BarChart3, ArrowUpRight, ArrowDownRight, Wallet, CreditCard,
  Clock, CheckCircle, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKanbanDeals, KanbanDeal } from '@/hooks/useKanban';
import { useKanbanPayments, KanbanPayment } from '@/hooks/useKanbanPayments';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart as RechartsPie, Pie, Cell,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pago: { label: 'Pago', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', chartColor: '#10b981' },
  pendente: { label: 'Pendente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', chartColor: '#f59e0b' },
  cancelado: { label: 'Cancelado', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', chartColor: '#ef4444' },
};

const PERIOD_OPTIONS = [
  { value: '1', label: 'Último mês' },
  { value: '3', label: 'Últimos 3 meses' },
  { value: '6', label: 'Últimos 6 meses' },
  { value: '12', label: 'Último ano' },
  { value: 'all', label: 'Todo o período' },
];

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, className }: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn('p-2.5 rounded-xl', trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-muted text-muted-foreground')}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trendValue && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground')}>
            {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
            {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const { data: deals, isLoading: dealsLoading } = useKanbanDeals();
  const { data: allPayments, isLoading: paymentsLoading } = useKanbanPayments();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('3');
  const [activeTab, setActiveTab] = useState('overview');

  const isLoading = dealsLoading || paymentsLoading;

  // Filter payments by period
  const filteredPayments = useMemo(() => {
    if (!allPayments) return [];
    if (period === 'all') return allPayments;

    const months = parseInt(period);
    const startDate = startOfMonth(subMonths(new Date(), months));
    return allPayments.filter(p => {
      const paymentDate = parseISO(p.payment_date);
      return paymentDate >= startDate;
    });
  }, [allPayments, period]);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const payments = filteredPayments;
    const totalRevenue = deals?.reduce((sum, d) => sum + Number(d.revenue || 0), 0) || 0;
    const totalPago = payments.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPendente = payments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCancelado = payments.filter(p => p.status === 'cancelado').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate previous period for trend
    const months = period === 'all' ? 12 : parseInt(period);
    const prevStart = startOfMonth(subMonths(new Date(), months * 2));
    const prevEnd = startOfMonth(subMonths(new Date(), months));
    const prevPayments = (allPayments || []).filter(p => {
      const d = parseISO(p.payment_date);
      return d >= prevStart && d < prevEnd;
    });
    const prevPago = prevPayments.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.amount), 0);
    const trendPercentage = prevPago > 0 ? ((totalPago - prevPago) / prevPago * 100).toFixed(1) : null;

    return {
      totalRevenue,
      totalPago,
      totalPendente,
      totalCancelado,
      totalPayments,
      paymentCount: payments.length,
      dealCount: deals?.length || 0,
      avgTicket: payments.length > 0 ? totalPago / payments.filter(p => p.status === 'pago').length : 0,
      trendPercentage,
    };
  }, [filteredPayments, deals, allPayments, period]);

  // Monthly revenue chart data
  const monthlyData = useMemo(() => {
    const months = period === 'all' ? 12 : parseInt(period);
    const data: { month: string; receita: number; pendente: number; cancelado: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, 'MMM/yy', { locale: ptBR });

      const monthPayments = filteredPayments.filter(p => {
        const d = parseISO(p.payment_date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      });

      data.push({
        month: monthLabel,
        receita: monthPayments.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.amount), 0),
        pendente: monthPayments.filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.amount), 0),
        cancelado: monthPayments.filter(p => p.status === 'cancelado').reduce((s, p) => s + Number(p.amount), 0),
      });
    }
    return data;
  }, [filteredPayments, period]);

  // Revenue by client
  const clientData = useMemo(() => {
    if (!deals || !filteredPayments) return [];
    const clientMap: Record<string, { name: string; receita: number; pendente: number }> = {};

    filteredPayments.forEach(payment => {
      const deal = deals.find(d => d.id === payment.deal_id);
      if (!deal) return;
      const name = deal.company_name;
      if (!clientMap[name]) clientMap[name] = { name, receita: 0, pendente: 0 };
      if (payment.status === 'pago') clientMap[name].receita += Number(payment.amount);
      if (payment.status === 'pendente') clientMap[name].pendente += Number(payment.amount);
    });

    return Object.values(clientMap).sort((a, b) => (b.receita + b.pendente) - (a.receita + a.pendente)).slice(0, 10);
  }, [deals, filteredPayments]);

  // Pie chart data
  const statusPieData = useMemo(() => [
    { name: 'Pago', value: metrics.totalPago, color: '#10b981' },
    { name: 'Pendente', value: metrics.totalPendente, color: '#f59e0b' },
    { name: 'Cancelado', value: metrics.totalCancelado, color: '#ef4444' },
  ].filter(d => d.value > 0), [metrics]);

  // Revenue by deal phase
  const phaseData = useMemo(() => {
    if (!deals) return [];
    const phaseMap: Record<string, number> = {};
    deals.forEach(d => {
      phaseMap[d.phase] = (phaseMap[d.phase] || 0) + Number(d.revenue || 0);
    });
    return Object.entries(phaseMap).map(([phase, value]) => ({ phase, value })).filter(d => d.value > 0);
  }, [deals]);

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Faturamento
              </h1>
              <p className="text-xs text-muted-foreground">
                {metrics.dealCount} contratos · {metrics.paymentCount} pagamentos registrados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita Total"
            value={formatCurrency(metrics.totalPago)}
            subtitle={`${metrics.paymentCount} pagamentos confirmados`}
            icon={TrendingUp}
            trend={metrics.trendPercentage ? (parseFloat(metrics.trendPercentage) >= 0 ? 'up' : 'down') : 'neutral'}
            trendValue={metrics.trendPercentage ? `${metrics.trendPercentage}% vs período anterior` : undefined}
          />
          <StatCard
            title="Pendente"
            value={formatCurrency(metrics.totalPendente)}
            subtitle="Aguardando pagamento"
            icon={Clock}
            trend="neutral"
          />
          <StatCard
            title="Ticket Médio"
            value={formatCurrency(metrics.avgTicket)}
            subtitle="Por pagamento"
            icon={Wallet}
            trend="neutral"
          />
          <StatCard
            title="Valor dos Contratos"
            value={formatCurrency(metrics.totalRevenue)}
            subtitle={`${metrics.dealCount} contratos ativos`}
            icon={CreditCard}
            trend="up"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="clients">Por Cliente</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Monthly Revenue Chart */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Receita Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="receita-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" fill="url(#receita-fill)" strokeWidth={2} />
                        <Bar dataKey="pendente" name="Pendente" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cancelado" name="Cancelado" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhum dado para o período selecionado</p>
                  )}
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Distribuição por Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statusPieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPie>
                          <Pie
                            data={statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statusPieData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {statusPieData.map(item => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhum pagamento registrado</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Faturamento por Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={clientData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="receita" name="Pago" fill="#10b981" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="pendente" name="Pendente" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Client table */}
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                        <span>Cliente</span>
                        <span className="text-right">Pago</span>
                        <span className="text-right">Pendente</span>
                        <span className="text-right">Total</span>
                      </div>
                      {clientData.map(client => (
                        <div key={client.name} className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30">
                          <span className="font-medium truncate">{client.name}</span>
                          <span className="text-right text-emerald-600">{formatCurrency(client.receita)}</span>
                          <span className="text-right text-amber-600">{formatCurrency(client.pendente)}</span>
                          <span className="text-right font-semibold">{formatCurrency(client.receita + client.pendente)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">Nenhum pagamento registrado por cliente</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Histórico de Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr,1.5fr,1fr,1fr,100px] gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                    <span>Data</span>
                    <span>Contrato</span>
                    <span>Descrição</span>
                    <span className="text-right">Valor</span>
                    <span className="text-center">Status</span>
                  </div>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map(payment => {
                      const deal = deals?.find(d => d.id === payment.deal_id);
                      const statusConf = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pendente;
                      const StatusIcon = statusConf.icon;

                      return (
                        <div key={payment.id} className="grid grid-cols-[1fr,1.5fr,1fr,1fr,100px] gap-4 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center">
                          <span className="text-muted-foreground">{format(parseISO(payment.payment_date), 'dd/MM/yyyy')}</span>
                          <span className="font-medium truncate">{deal?.company_name || '—'}</span>
                          <span className="text-muted-foreground truncate">{payment.description || '—'}</span>
                          <span className={cn('text-right font-semibold', payment.status === 'pago' ? 'text-emerald-600' : payment.status === 'cancelado' ? 'text-destructive' : '')}>{formatCurrency(Number(payment.amount))}</span>
                          <div className="flex justify-center">
                            <Badge variant="outline" className={cn('text-[10px]', statusConf.bg, statusConf.color)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConf.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhum pagamento no período</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
