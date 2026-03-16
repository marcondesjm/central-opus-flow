import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, DollarSign, TrendingUp, Receipt, Plus,
  Calendar, Building2, Loader2, PieChart, Minus,
  BarChart3, ArrowUpRight, ArrowDownRight, Wallet, CreditCard,
  Clock, CheckCircle, XCircle, Trash2, Percent, Pencil,
  Bot, Coins, Download, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useKanbanDeals, useDeleteDeal, KanbanDeal } from '@/hooks/useKanban';
import { useKanbanPayments, useCreatePayment, useUpdatePayment, useDeletePayment, KanbanPayment, PAYMENT_METHODS, PAYMENT_CATEGORIES } from '@/hooks/useKanbanPayments';
import { useKanbanExpenses, useCreateExpense, useDeleteExpense, KanbanExpense, EXPENSE_CATEGORIES } from '@/hooks/useKanbanExpenses';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart as RechartsPie, Pie, Cell,
  Area, AreaChart,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PixKeysManager } from '@/components/billing/PixKeysManager';

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
  title: string; value: string; subtitle?: string; icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral'; trendValue?: string; className?: string;
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

// ─── Add Payment Modal ──────────────────────────
function AddPaymentModal({ open, onOpenChange, deals }: { open: boolean; onOpenChange: (v: boolean) => void; deals: KanbanDeal[] }) {
  const createPayment = useCreatePayment();
  const [form, setForm] = useState({
    deal_id: '',
    amount: 0,
    status: 'pendente',
    description: '',
    payment_method: 'pix',
    category: 'projeto',
    payment_date: undefined as Date | undefined,
  });

  const handleSubmit = () => {
    if (!form.deal_id || form.amount <= 0) return;
    createPayment.mutate({
      deal_id: form.deal_id,
      amount: form.amount,
      status: form.status,
      description: form.description || undefined,
      payment_method: form.payment_method,
      category: form.category,
      payment_date: form.payment_date ? format(form.payment_date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({ deal_id: '', amount: 0, status: 'pendente', description: '', payment_method: 'pix', category: 'projeto', payment_date: undefined });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Novo Pagamento</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Contrato *</Label>
            <Select value={form.deal_id} onValueChange={v => setForm(f => ({ ...f, deal_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar contrato" /></SelectTrigger>
              <SelectContent>
                {deals.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.company_name} - {d.client_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" min={0} step={0.01} value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.payment_date && 'text-muted-foreground')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {form.payment_date ? format(form.payment_date, 'dd/MM/yyyy') : 'Hoje'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={form.payment_date} onSelect={d => setForm(f => ({ ...f, payment_date: d }))} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input placeholder="Opcional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createPayment.isPending || !form.deal_id || form.amount <= 0}>
            {createPayment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Expense Modal ──────────────────────────
function AddExpenseModal({ open, onOpenChange, deals }: { open: boolean; onOpenChange: (v: boolean) => void; deals: KanbanDeal[] }) {
  const createExpense = useCreateExpense();
  const [form, setForm] = useState({
    deal_id: '' as string,
    amount: 0,
    description: '',
    category: 'geral',
    expense_date: undefined as Date | undefined,
  });

  const handleSubmit = () => {
    if (form.amount <= 0) return;
    createExpense.mutate({
      deal_id: form.deal_id || null,
      amount: form.amount,
      description: form.description || undefined,
      category: form.category,
      expense_date: form.expense_date ? format(form.expense_date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({ deal_id: '', amount: 0, description: '', category: 'geral', expense_date: undefined });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nova Despesa</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Contrato (opcional)</Label>
            <Select value={form.deal_id} onValueChange={v => setForm(f => ({ ...f, deal_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Geral (sem contrato)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Geral (sem contrato)</SelectItem>
                {deals.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" min={0} step={0.01} value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.expense_date && 'text-muted-foreground')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {form.expense_date ? format(form.expense_date, 'dd/MM/yyyy') : 'Hoje'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={form.expense_date} onSelect={d => setForm(f => ({ ...f, expense_date: d }))} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input placeholder="Opcional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createExpense.isPending || form.amount <= 0}>
            {createExpense.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Payment Modal ──────────────────────────
function EditPaymentModal({ open, onOpenChange, payment, deals }: { open: boolean; onOpenChange: (v: boolean) => void; payment: KanbanPayment; deals: KanbanDeal[] }) {
  const updatePayment = useUpdatePayment();
  const [form, setForm] = useState({
    deal_id: payment.deal_id,
    amount: payment.amount,
    status: payment.status,
    description: payment.description || '',
    payment_method: payment.payment_method || 'pix',
    category: payment.category || 'projeto',
    payment_date: payment.payment_date ? new Date(payment.payment_date + 'T12:00:00') : new Date(),
  });

  const handleSubmit = () => {
    if (!form.deal_id || form.amount <= 0) return;
    updatePayment.mutate({
      id: payment.id,
      deal_id: form.deal_id,
      amount: form.amount,
      status: form.status,
      description: form.description || null,
      payment_method: form.payment_method,
      category: form.category,
      payment_date: format(form.payment_date, 'yyyy-MM-dd'),
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar Pagamento</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Contrato *</Label>
            <Select value={form.deal_id} onValueChange={v => setForm(f => ({ ...f, deal_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar contrato" /></SelectTrigger>
              <SelectContent>
                {deals.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.company_name} - {d.client_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" min={0} step={0.01} value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(form.payment_date, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={form.payment_date} onSelect={d => d && setForm(f => ({ ...f, payment_date: d }))} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input placeholder="Opcional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={updatePayment.isPending || !form.deal_id || form.amount <= 0}>
            {updatePayment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: deals, isLoading: dealsLoading } = useKanbanDeals();
  const { data: allPayments, isLoading: paymentsLoading } = useKanbanPayments();
  const { data: allExpenses, isLoading: expensesLoading } = useKanbanExpenses();
  const deleteExpense = useDeleteExpense();
  const deletePayment = useDeletePayment();

  const handleDeletePayment = (id: string) => {
    if (confirm('Deseja excluir este pagamento?')) {
      deletePayment.mutate(id);
    }
  };

  const deleteDeal = useDeleteDeal();
  const handleDeleteDeal = (id: string) => {
    if (confirm('Deseja excluir este cliente/contrato e todos seus pagamentos?')) {
      deleteDeal.mutate(id);
    }
  };

  const handleExportBilling = () => {
    const exportData = {
      payments: allPayments || [],
      expenses: allExpenses || [],
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faturamento-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBilling = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      let imported = 0;
      if (data.payments?.length > 0) {
        const { error } = await supabase.from('kanban_payments').insert(
          data.payments.map((p: any) => ({ ...p, id: undefined, user_id: user!.id }))
        );
        if (!error) imported += data.payments.length;
      }
      if (data.expenses?.length > 0) {
        const { error } = await supabase.from('kanban_expenses').insert(
          data.expenses.map((ex: any) => ({ ...ex, id: undefined, user_id: user!.id }))
        );
        if (!error) imported += data.expenses.length;
      }
      if (imported > 0) {
        toast({ title: `${imported} registros importados com sucesso!` });
        window.location.reload();
      }
    } catch {
      toast({ title: 'Erro ao importar arquivo', variant: 'destructive' });
    }
    e.target.value = '';
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState('3');
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingPayment, setEditingPayment] = useState<KanbanPayment | null>(null);
  const updatePayment = useUpdatePayment();

  // Sync tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'clients', 'ai-costs', 'expenses', 'history', 'pix'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const isLoading = dealsLoading || paymentsLoading || expensesLoading;

  // Filter payments by period
  const filteredPayments = useMemo(() => {
    if (!allPayments) return [];
    if (period === 'all') return allPayments;
    const months = parseInt(period);
    const startDate = startOfMonth(subMonths(new Date(), months));
    return allPayments.filter(p => parseISO(p.payment_date) >= startDate);
  }, [allPayments, period]);

  // Filter expenses by period
  const filteredExpenses = useMemo(() => {
    if (!allExpenses) return [];
    if (period === 'all') return allExpenses;
    const months = parseInt(period);
    const startDate = startOfMonth(subMonths(new Date(), months));
    return allExpenses.filter(e => parseISO(e.expense_date) >= startDate);
  }, [allExpenses, period]);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const totalRevenue = deals?.reduce((sum, d) => sum + Number(d.revenue || 0), 0) || 0;
    const totalPago = filteredPayments.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPendente = filteredPayments.filter(p => p.status === 'pendente').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCancelado = filteredPayments.filter(p => p.status === 'cancelado').reduce((sum, p) => sum + Number(p.amount), 0);
    const totalDespesas = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const lucroLiquido = totalPago - totalDespesas;
    const margem = totalPago > 0 ? (lucroLiquido / totalPago) * 100 : 0;

    // Trend vs previous period
    const months = period === 'all' ? 12 : parseInt(period);
    const prevStart = startOfMonth(subMonths(new Date(), months * 2));
    const prevEnd = startOfMonth(subMonths(new Date(), months));
    const prevPago = (allPayments || []).filter(p => {
      const d = parseISO(p.payment_date);
      return d >= prevStart && d < prevEnd && p.status === 'pago';
    }).reduce((sum, p) => sum + Number(p.amount), 0);
    const trendPercentage = prevPago > 0 ? ((totalPago - prevPago) / prevPago * 100).toFixed(1) : null;

    // Projection: average monthly revenue * next 3 months
    const monthlyAvg = months > 0 ? totalPago / months : 0;
    const projecao3m = monthlyAvg * 3 + totalPendente;

    return {
      totalRevenue, totalPago, totalPendente, totalCancelado, totalDespesas,
      lucroLiquido, margem, trendPercentage, projecao3m,
      paymentCount: filteredPayments.length,
      dealCount: deals?.length || 0,
      avgTicket: filteredPayments.filter(p => p.status === 'pago').length > 0
        ? totalPago / filteredPayments.filter(p => p.status === 'pago').length : 0,
    };
  }, [filteredPayments, filteredExpenses, deals, allPayments, period]);

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months = period === 'all' ? 12 : parseInt(period);
    const data: { month: string; receita: number; despesas: number; lucro: number; pendente: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const mStart = startOfMonth(date);
      const mEnd = endOfMonth(date);
      const label = format(date, 'MMM/yy', { locale: ptBR });
      const mPayments = filteredPayments.filter(p => isWithinInterval(parseISO(p.payment_date), { start: mStart, end: mEnd }));
      const mExpenses = filteredExpenses.filter(e => isWithinInterval(parseISO(e.expense_date), { start: mStart, end: mEnd }));
      const rec = mPayments.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.amount), 0);
      const desp = mExpenses.reduce((s, e) => s + Number(e.amount), 0);
      data.push({
        month: label,
        receita: rec,
        despesas: desp,
        lucro: rec - desp,
        pendente: mPayments.filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.amount), 0),
      });
    }
    return data;
  }, [filteredPayments, filteredExpenses, period]);

  // Client data
  const clientData = useMemo(() => {
    if (!deals || !filteredPayments) return [];
    const clientMap: Record<string, { name: string; receita: number; pendente: number; despesas: number }> = {};
    filteredPayments.forEach(payment => {
      const deal = deals.find(d => d.id === payment.deal_id);
      if (!deal) return;
      if (!clientMap[deal.company_name]) clientMap[deal.company_name] = { name: deal.company_name, receita: 0, pendente: 0, despesas: 0 };
      if (payment.status === 'pago') clientMap[deal.company_name].receita += Number(payment.amount);
      if (payment.status === 'pendente') clientMap[deal.company_name].pendente += Number(payment.amount);
    });
    filteredExpenses.forEach(expense => {
      if (!expense.deal_id) return;
      const deal = deals.find(d => d.id === expense.deal_id);
      if (!deal || !clientMap[deal.company_name]) return;
      clientMap[deal.company_name].despesas += Number(expense.amount);
    });
    return Object.values(clientMap).sort((a, b) => (b.receita + b.pendente) - (a.receita + a.pendente)).slice(0, 10);
  }, [deals, filteredPayments, filteredExpenses]);

  // Pie data
  const statusPieData = useMemo(() => [
    { name: 'Pago', value: metrics.totalPago, color: '#10b981' },
    { name: 'Pendente', value: metrics.totalPendente, color: '#f59e0b' },
    { name: 'Despesas', value: metrics.totalDespesas, color: '#8b5cf6' },
    { name: 'Cancelado', value: metrics.totalCancelado, color: '#ef4444' },
  ].filter(d => d.value > 0), [metrics]);

  // Payment method breakdown
  const methodData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPayments.filter(p => p.status === 'pago').forEach(p => {
      const method = (p as any).payment_method || 'pix';
      map[method] = (map[method] || 0) + Number(p.amount);
    });
    return Object.entries(map).map(([method, value]) => ({
      method: PAYMENT_METHODS.find(m => m.value === method)?.label || method,
      value,
    }));
  }, [filteredPayments]);

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
                {metrics.dealCount} contratos · {metrics.paymentCount} pagamentos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleExportBilling} className="gap-1.5" title="Exportar dados">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <label>
              <input type="file" accept=".json" className="hidden" onChange={handleImportBilling} />
              <Button size="sm" variant="ghost" asChild className="gap-1.5 cursor-pointer" title="Importar dados">
                <span>
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Importar</span>
                </span>
              </Button>
            </label>
            <Button size="sm" variant="outline" onClick={() => setShowAddExpense(true)} className="gap-1.5">
              <Minus className="w-4 h-4" />
              <span className="hidden sm:inline">Despesa</span>
            </Button>
            <Button size="sm" onClick={() => setShowAddPayment(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Pagamento</span>
            </Button>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards - 6 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            title="Receita"
            value={formatCurrency(metrics.totalPago)}
            subtitle={`${filteredPayments.filter(p => p.status === 'pago').length} pagos`}
            icon={TrendingUp}
            trend={metrics.trendPercentage ? (parseFloat(metrics.trendPercentage) >= 0 ? 'up' : 'down') : 'neutral'}
            trendValue={metrics.trendPercentage ? `${metrics.trendPercentage}%` : undefined}
          />
          <StatCard
            title="Despesas"
            value={formatCurrency(metrics.totalDespesas)}
            subtitle={`${filteredExpenses.length} registros`}
            icon={Minus}
            trend="down"
          />
          <StatCard
            title="Lucro Líquido"
            value={formatCurrency(metrics.lucroLiquido)}
            subtitle="Receita - Despesas"
            icon={DollarSign}
            trend={metrics.lucroLiquido >= 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Margem"
            value={`${metrics.margem.toFixed(1)}%`}
            subtitle="Lucro / Receita"
            icon={Percent}
            trend={metrics.margem >= 30 ? 'up' : metrics.margem >= 0 ? 'neutral' : 'down'}
          />
          <StatCard
            title="Pendente"
            value={formatCurrency(metrics.totalPendente)}
            subtitle="A receber"
            icon={Clock}
            trend="neutral"
          />
          <StatCard
            title="Projeção 3m"
            value={formatCurrency(metrics.projecao3m)}
            subtitle="Estimativa futura"
            icon={CreditCard}
            trend="up"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="clients">Por Cliente</TabsTrigger>
            <TabsTrigger value="ai-costs">🤖 IA & Créditos</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="pix">💳 PIX</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Receita vs Despesas Mensal
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
                          <linearGradient id="despesas-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Area type="monotone" dataKey="receita" name="Receita" stroke="#10b981" fill="url(#receita-fill)" strokeWidth={2} />
                        <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#8b5cf6" fill="url(#despesas-fill)" strokeWidth={2} />
                        <Bar dataKey="lucro" name="Lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhum dado para o período</p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* Status Pie */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <PieChart className="w-4 h-4" />
                      Distribuição
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusPieData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={160}>
                          <RechartsPie>
                            <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                              {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          </RechartsPie>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-2">
                          {statusPieData.map(item => (
                            <div key={item.name} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground">{item.name}</span>
                              </div>
                              <span className="font-medium">{formatCurrency(item.value)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                {methodData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Por Forma de Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {methodData.map(m => {
                          const total = methodData.reduce((s, x) => s + x.value, 0);
                          const pct = total > 0 ? (m.value / total * 100) : 0;
                          return (
                            <div key={m.method} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{m.method}</span>
                                <span className="font-medium">{formatCurrency(m.value)} ({pct.toFixed(0)}%)</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* AI & Credits Tab */}
          <TabsContent value="ai-costs" className="mt-4 space-y-4">
            {(() => {
              const aiCategories = ['ia', 'tokens', 'creditos'];
              const aiExpenses = filteredExpenses.filter(e => aiCategories.includes(e.category));
              const totalAI = aiExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
              const byCategory = aiCategories.map(cat => {
                const catExpenses = aiExpenses.filter(e => e.category === cat);
                const total = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
                const catLabel = EXPENSE_CATEGORIES.find(c => c.value === cat)?.label || cat;
                return { category: cat, label: catLabel, total, count: catExpenses.length };
              }).filter(c => c.total > 0 || c.count > 0);

              return (
                <>
                  {/* AI Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard
                      title="Total IA & Créditos"
                      value={formatCurrency(totalAI)}
                      subtitle={`${aiExpenses.length} registros`}
                      icon={Bot}
                      trend="down"
                    />
                    <StatCard
                      title="Tokens / API"
                      value={formatCurrency(aiExpenses.filter(e => e.category === 'tokens').reduce((s, e) => s + Number(e.amount), 0))}
                      subtitle="Custos com APIs de IA"
                      icon={Coins}
                      trend="neutral"
                    />
                    <StatCard
                      title="Créditos"
                      value={formatCurrency(aiExpenses.filter(e => e.category === 'creditos').reduce((s, e) => s + Number(e.amount), 0))}
                      subtitle="Lovable, Vercel, etc"
                      icon={CreditCard}
                      trend="neutral"
                    />
                  </div>

                  {/* Quick Add AI Expense */}
                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Registrar Gasto com IA
                      </CardTitle>
                      <Button size="sm" variant="outline" onClick={() => {
                        setShowAddExpense(true);
                      }} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Nova Despesa IA
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Registre seus gastos com inteligência artificial, tokens de API (OpenAI, Claude, etc) e créditos de plataformas (Lovable, Vercel, etc).
                      </p>

                      {/* Category Breakdown */}
                      {byCategory.length > 0 ? (
                        <div className="space-y-3 mb-6">
                          {byCategory.map(cat => {
                            const pct = totalAI > 0 ? (cat.total / totalAI * 100) : 0;
                            return (
                              <div key={cat.category} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">{cat.label} ({cat.count})</span>
                                  <span className="font-medium">{formatCurrency(cat.total)} ({pct.toFixed(0)}%)</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* AI Expense List */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="grid grid-cols-[1fr,1.5fr,1fr,1fr,60px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                          <span>Data</span>
                          <span>Descrição</span>
                          <span>Tipo</span>
                          <span className="text-right">Valor</span>
                          <span />
                        </div>
                        {aiExpenses.length > 0 ? (
                          aiExpenses.map(expense => {
                            const cat = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
                            return (
                              <div key={expense.id} className="grid grid-cols-[1fr,1.5fr,1fr,1fr,60px] gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center">
                                <span className="text-muted-foreground">{format(parseISO(expense.expense_date), 'dd/MM/yyyy')}</span>
                                <span className="truncate">{expense.description || '—'}</span>
                                <Badge variant="secondary" className="text-[10px] w-fit">{cat?.label || expense.category}</Badge>
                                <span className="text-right font-semibold text-violet-600">{formatCurrency(Number(expense.amount))}</span>
                                <button onClick={() => deleteExpense.mutate(expense.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-12 space-y-2">
                            <Bot className="w-8 h-8 mx-auto text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Nenhum gasto com IA registrado</p>
                            <p className="text-xs text-muted-foreground">Clique em "Nova Despesa IA" para começar a rastrear</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              );
            })()}
          </TabsContent>


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
                        <Bar dataKey="despesas" name="Despesas" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,40px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                        <span>Cliente</span>
                        <span className="text-right">Pago</span>
                        <span className="text-right">Pendente</span>
                        <span className="text-right">Despesas</span>
                        <span className="text-right">Lucro</span>
                        <span></span>
                      </div>
                      {clientData.map(client => {
                        const deal = deals?.find(d => d.company_name === client.name);
                        return (
                          <div key={client.name} className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,40px] gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center">
                            <span className="font-medium truncate">{client.name}</span>
                            <span className="text-right text-emerald-600">{formatCurrency(client.receita)}</span>
                            <span className="text-right text-amber-600">{formatCurrency(client.pendente)}</span>
                            <span className="text-right text-violet-600">{formatCurrency(client.despesas)}</span>
                            <span className={cn('text-right font-semibold', (client.receita - client.despesas) >= 0 ? 'text-emerald-600' : 'text-destructive')}>
                              {formatCurrency(client.receita - client.despesas)}
                            </span>
                            {deal && (
                              <button
                                onClick={() => handleDeleteDeal(deal.id)}
                                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Excluir cliente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">Nenhum dado por cliente</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="mt-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Minus className="w-4 h-4" />
                  Despesas ({filteredExpenses.length})
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowAddExpense(true)} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr,1.5fr,1fr,1fr,60px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                    <span>Data</span>
                    <span>Descrição</span>
                    <span>Categoria</span>
                    <span className="text-right">Valor</span>
                    <span />
                  </div>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map(expense => {
                      const cat = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
                      return (
                        <div key={expense.id} className="grid grid-cols-[1fr,1.5fr,1fr,1fr,60px] gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center">
                          <span className="text-muted-foreground">{format(parseISO(expense.expense_date), 'dd/MM/yyyy')}</span>
                          <span className="truncate">{expense.description || '—'}</span>
                          <Badge variant="secondary" className="text-[10px] w-fit">{cat?.label || expense.category}</Badge>
                          <span className="text-right font-semibold text-violet-600">{formatCurrency(Number(expense.amount))}</span>
                          <button onClick={() => deleteExpense.mutate(expense.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhuma despesa registrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Histórico de Pagamentos
                </CardTitle>
                <Button size="sm" onClick={() => setShowAddPayment(true)} className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr,1.2fr,1fr,0.8fr,0.8fr,80px,70px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                    <span>Data</span>
                    <span>Contrato</span>
                    <span>Descrição</span>
                    <span>Método</span>
                    <span className="text-right">Valor</span>
                    <span className="text-center">Status</span>
                    <span></span>
                  </div>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map(payment => {
                      const deal = deals?.find(d => d.id === payment.deal_id);
                      const statusConf = STATUS_CONFIG[payment.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pendente;
                      const StatusIcon = statusConf.icon;
                      const method = PAYMENT_METHODS.find(m => m.value === (payment as any).payment_method);

                      return (
                        <div key={payment.id} className="grid grid-cols-[1fr,1.2fr,1fr,0.8fr,0.8fr,80px,70px] gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center">
                          <span className="text-muted-foreground">{format(parseISO(payment.payment_date), 'dd/MM/yyyy')}</span>
                          <span className="font-medium truncate">{deal?.company_name || '—'}</span>
                          <span className="text-muted-foreground truncate">{payment.description || '—'}</span>
                          <span className="text-xs text-muted-foreground">{method?.label || '—'}</span>
                          <span className={cn('text-right font-semibold', payment.status === 'pago' ? 'text-emerald-600' : payment.status === 'cancelado' ? 'text-destructive' : '')}>
                            {formatCurrency(Number(payment.amount))}
                          </span>
                          <div className="flex justify-center">
                            <Badge variant="outline" className={cn('text-[10px]', statusConf.bg, statusConf.color)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConf.label}
                            </Badge>
                          </div>
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => setEditingPayment(payment)}
                              className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-primary/10"
                              title="Editar pagamento"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                              title="Excluir pagamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Modals */}
      {showAddPayment && deals && <AddPaymentModal open={showAddPayment} onOpenChange={setShowAddPayment} deals={deals} />}
      {showAddExpense && deals && <AddExpenseModal open={showAddExpense} onOpenChange={setShowAddExpense} deals={deals} />}

      {/* Edit Payment Modal */}
      {editingPayment && deals && (
        <EditPaymentModal
          open={!!editingPayment}
          onOpenChange={(v) => { if (!v) setEditingPayment(null); }}
          payment={editingPayment}
          deals={deals}
        />
      )}
    </div>
  );
}
