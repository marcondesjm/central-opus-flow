import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  TrendingUp, TrendingDown, DollarSign, Plus, Search,
  Calendar, Loader2, Pencil, Trash2, ArrowUpRight,
  ArrowDownRight, RefreshCw, BarChart3, X, Users, Building2,
  Receipt, Eye, Repeat, ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart as RechartsPie, Pie, Cell,
} from 'recharts';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PixKeysManager } from '@/components/billing/PixKeysManager';
import {
  useFinancialCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useFinancialClients, useCreateClient, useDeleteClient,
  useFinancialSuppliers, useCreateSupplier, useDeleteSupplier,
  useFinancialTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  useFinancialRecurring, useCreateRecurring, useDeleteRecurring,
  useFinancialServices, useCreateService,
  formatBRL, CATEGORY_COLORS,
  FinancialTransaction, FinancialCategory,
} from '@/hooks/useFinancial';

// ─── Venda Rápida Modal ──────────────────────────
function VendaRapidaModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: clients } = useFinancialClients();
  const { data: services } = useFinancialServices();
  const { data: categories } = useFinancialCategories('receita');
  const createTransaction = useCreateTransaction();
  const createClient = useCreateClient();
  const createService = useCreateService();
  const [form, setForm] = useState({
    client_id: '', description: '', amount: 0, due_date: format(new Date(), 'yyyy-MM-dd'),
    payment_mode: 'avista' as 'avista' | 'parcelado' | 'recorrente',
    status: 'pendente' as 'pendente' | 'parcial' | 'pago',
    category_id: '', notes: '',
  });
  const [newClient, setNewClient] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: 0 });
  const [showNewService, setShowNewService] = useState(false);

  const handleSubmit = async () => {
    if (!form.description || form.amount <= 0) return;
    let clientId = form.client_id || null;
    if (showNewClient && newClient.trim()) {
      const result = await createClient.mutateAsync({ name: newClient.trim() });
      clientId = result.id;
    }
    createTransaction.mutate({
      type: 'receita', description: form.description, amount: form.amount,
      due_date: form.due_date, status: form.status, payment_mode: form.payment_mode,
      client_id: clientId, category_id: form.category_id || null,
      notes: form.notes || null, paid_date: form.status === 'pago' ? form.due_date : null,
    } as any, { onSuccess: () => { onOpenChange(false); resetForm(); } });
  };

  const resetForm = () => setForm({ client_id: '', description: '', amount: 0, due_date: format(new Date(), 'yyyy-MM-dd'), payment_mode: 'avista', status: 'pendente', category_id: '', notes: '' });

  const handleAddService = () => {
    if (newService.name.trim()) {
      createService.mutate({ name: newService.name, default_price: newService.price });
      setForm(f => ({ ...f, description: f.description ? `${f.description}, ${newService.name}` : newService.name, amount: f.amount + newService.price }));
      setNewService({ name: '', price: 0 });
      setShowNewService(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Nova Venda Rápida
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Registre uma venda de forma rápida e prática</p>
        </DialogHeader>
        <div className="space-y-4">
          {/* Cliente */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Cliente</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowNewClient(!showNewClient)}>
                <Plus className="w-3 h-3" /> Novo
              </Button>
            </div>
            {showNewClient ? (
              <Input placeholder="Nome do novo cliente..." value={newClient} onChange={e => setNewClient(e.target.value)} />
            ) : (
              <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
                <SelectContent>
                  {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Serviços */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Serviços</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowNewService(!showNewService)}>
                <Plus className="w-3 h-3" /> Novo
              </Button>
            </div>
            {showNewService && (
              <div className="flex gap-2 mb-2">
                <Input placeholder="Nome do serviço" value={newService.name} onChange={e => setNewService(s => ({ ...s, name: e.target.value }))} className="flex-1" />
                <Input type="number" placeholder="Preço" value={newService.price || ''} onChange={e => setNewService(s => ({ ...s, price: parseFloat(e.target.value) || 0 }))} className="w-24" />
                <Button size="sm" onClick={handleAddService}>+</Button>
              </div>
            )}
            <Select onValueChange={v => {
              const svc = services?.find(s => s.id === v);
              if (svc) setForm(f => ({ ...f, description: f.description ? `${f.description}, ${svc.name}` : svc.name, amount: f.amount + Number(svc.default_price) }));
            }}>
              <SelectTrigger><SelectValue placeholder="Buscar e adicionar serviço..." /></SelectTrigger>
              <SelectContent>
                {services?.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - {formatBRL(Number(s.default_price))}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div>
            <Label>Descrição *</Label>
            <Input placeholder="Ex: Projeto de logo" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          {/* Valor + Moeda + Vencimento */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Valor *</Label>
              <Input type="number" min={0} step={0.01} placeholder="0.00" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <Label>Moeda</Label>
              <Select defaultValue="BRL"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="BRL">BRL</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Vencimento *</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>

          {/* Modo de Pagamento */}
          <div>
            <Label>Modo de Pagamento</Label>
            <div className="flex gap-2 mt-1">
              {([['avista', '$ À Vista'], ['parcelado', '⊕ Parcelado'], ['recorrente', '↻ Recorrente']] as const).map(([v, l]) => (
                <Button key={v} variant={form.payment_mode === v ? 'default' : 'outline'} size="sm"
                  className={cn('flex-1', form.payment_mode === v && v === 'avista' && 'bg-emerald-600 hover:bg-emerald-700')}
                  onClick={() => setForm(f => ({ ...f, payment_mode: v }))}>{l}</Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <div className="flex gap-2 mt-1">
              {([['pendente', '⏳ Pendente', 'bg-rose-600 hover:bg-rose-700'], ['parcial', '$ Parcial', ''], ['pago', '✓ Pago', '']] as const).map(([v, l, cls]) => (
                <Button key={v} variant={form.status === v ? 'default' : 'outline'} size="sm"
                  className={cn('flex-1', form.status === v && cls)}
                  onClick={() => setForm(f => ({ ...f, status: v }))}>{l}</Button>
              ))}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <Label>Categoria Financeira</Label>
            <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories?.map(c => <SelectItem key={c.id} value={c.id}><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</span></SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações (opcional)</Label>
            <Textarea placeholder="Adicione observações..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createTransaction.isPending || !form.description || form.amount <= 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            {createTransaction.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Lançar Despesa Modal ──────────────────────────
function LancarDespesaModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: suppliers } = useFinancialSuppliers();
  const { data: categories } = useFinancialCategories('despesa');
  const createTransaction = useCreateTransaction();
  const createSupplier = useCreateSupplier();
  const [form, setForm] = useState({
    supplier_id: '', description: '', amount: 0, due_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'pendente' as 'pendente' | 'pago',
    expense_type: 'avulsa' as 'avulsa' | 'recorrente',
    category_id: '', notes: '',
  });
  const [newSupplier, setNewSupplier] = useState('');
  const [showNewSupplier, setShowNewSupplier] = useState(false);

  const handleSubmit = async () => {
    if (!form.description || form.amount <= 0) return;
    let supplierId = form.supplier_id || null;
    if (showNewSupplier && newSupplier.trim()) {
      const result = await createSupplier.mutateAsync({ name: newSupplier.trim() });
      supplierId = result.id;
    }
    createTransaction.mutate({
      type: 'despesa', description: form.description, amount: form.amount,
      due_date: form.due_date, status: form.status, payment_mode: 'avista',
      supplier_id: supplierId, category_id: form.category_id || null,
      expense_type: form.expense_type, notes: form.notes || null,
      paid_date: form.status === 'pago' ? form.due_date : null,
    } as any, { onSuccess: () => { onOpenChange(false); } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Lançar Despesa
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Registre uma despesa avulsa ou recorrente</p>
        </DialogHeader>
        <div className="space-y-4">
          {/* Fornecedor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Fornecedor</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowNewSupplier(!showNewSupplier)}>
                <Plus className="w-3 h-3" /> Novo
              </Button>
            </div>
            {showNewSupplier ? (
              <Input placeholder="Nome do fornecedor..." value={newSupplier} onChange={e => setNewSupplier(e.target.value)} />
            ) : (
              <Select value={form.supplier_id} onValueChange={v => setForm(f => ({ ...f, supplier_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Buscar fornecedor..." /></SelectTrigger>
                <SelectContent>
                  {suppliers?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label>Descrição *</Label>
            <Input placeholder="Ex: Licença de software" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          {/* Valor + Moeda + Vencimento */}
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Valor *</Label>
              <Input type="number" min={0} step={0.01} placeholder="0.00" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} /></div>
            <div><Label>Moeda</Label>
              <Select defaultValue="BRL"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="BRL">BRL</SelectItem></SelectContent></Select></div>
            <div><Label className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Vencimento *</Label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <div className="flex gap-2 mt-1">
              <Button variant={form.status === 'pendente' ? 'default' : 'outline'} size="sm" className={cn('flex-1', form.status === 'pendente' && 'bg-rose-600 hover:bg-rose-700')}
                onClick={() => setForm(f => ({ ...f, status: 'pendente' }))}>⏳ Pendente</Button>
              <Button variant={form.status === 'pago' ? 'default' : 'outline'} size="sm" className="flex-1"
                onClick={() => setForm(f => ({ ...f, status: 'pago' }))}>✓ Pago</Button>
            </div>
          </div>

          {/* Tipo de Despesa */}
          <div>
            <Label>Tipo de Despesa</Label>
            <div className="flex gap-2 mt-1">
              <Button variant={form.expense_type === 'avulsa' ? 'default' : 'outline'} size="sm"
                className={cn('flex-1', form.expense_type === 'avulsa' && 'bg-rose-600 hover:bg-rose-700')}
                onClick={() => setForm(f => ({ ...f, expense_type: 'avulsa' }))}>$ Avulsa</Button>
              <Button variant={form.expense_type === 'recorrente' ? 'default' : 'outline'} size="sm" className="flex-1"
                onClick={() => setForm(f => ({ ...f, expense_type: 'recorrente' }))}>↻ Recorrente</Button>
            </div>
          </div>

          {/* Status parcial/pago (despesa) */}
          <div>
            <Label>Categoria Financeira</Label>
            <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories?.map(c => <SelectItem key={c.id} value={c.id}><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</span></SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações (opcional)</Label>
            <Textarea placeholder="Adicione observações..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createTransaction.isPending || !form.description || form.amount <= 0}
            className="flex-1 bg-rose-600 hover:bg-rose-700">
            {createTransaction.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Categorias Modal ──────────────────────────
function CategoriasModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tab, setTab] = useState<'receita' | 'despesa'>('receita');
  const { data: categories } = useFinancialCategories(tab);
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    createCat.mutate({ name: newName.trim(), color: newColor, type: tab, position: (categories?.length || 0) });
    setNewName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5" /> Categorias Financeiras</DialogTitle>
        </DialogHeader>

        {/* Tabs receita/despesa */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <Button variant={tab === 'receita' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setTab('receita')}>Contas a Receber</Button>
          <Button variant={tab === 'despesa' ? 'default' : 'ghost'} size="sm" className="flex-1" onClick={() => setTab('despesa')}>Contas a Pagar</Button>
        </div>

        {/* New category */}
        <div>
          <Label className="text-xs">Nova categoria</Label>
          <div className="flex gap-2 mt-1">
            <Input placeholder="Ex: Hospedagem, Marketing..." value={newName} onChange={e => setNewName(e.target.value)} className="flex-1" />
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
            <Button size="icon" onClick={handleAdd} disabled={createCat.isPending}><Plus className="w-4 h-4" /></Button>
          </div>
          {/* Color palette */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {CATEGORY_COLORS.map(c => (
              <button key={c} className={cn('w-5 h-5 rounded-full border-2 transition-all', newColor === c ? 'border-foreground scale-125' : 'border-transparent')}
                style={{ backgroundColor: c }} onClick={() => setNewColor(c)} />
            ))}
          </div>
        </div>

        {/* Categories list */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {categories?.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              {editingId === cat.id ? (
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-7 text-sm flex-1"
                  onBlur={() => { updateCat.mutate({ id: cat.id, name: editName }); setEditingId(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { updateCat.mutate({ id: cat.id, name: editName }); setEditingId(null); } }}
                  autoFocus />
              ) : (
                <span className="flex-1 text-sm font-medium">{cat.name}</span>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCat.mutate(cat.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
          {!categories?.length && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Transaction Row ──────────────────────────
function TransactionRow({ tx, clients, suppliers, categories, onDelete }: {
  tx: FinancialTransaction; clients?: any[]; suppliers?: any[]; categories?: FinancialCategory[]; onDelete: (id: string) => void;
}) {
  const client = clients?.find(c => c.id === tx.client_id);
  const supplier = suppliers?.find(s => s.id === tx.supplier_id);
  const cat = categories?.find(c => c.id === tx.category_id);
  const isOverdue = tx.status === 'pendente' && isBefore(parseISO(tx.due_date), new Date());

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30">
      <span className="text-muted-foreground w-20 flex-shrink-0">{format(parseISO(tx.due_date), 'dd/MM/yyyy')}</span>
      <span className="flex-1 truncate font-medium">{tx.description}</span>
      <span className="text-xs text-muted-foreground truncate w-24">{client?.name || supplier?.name || '—'}</span>
      {cat && <Badge variant="secondary" className="text-[10px]" style={{ borderColor: cat.color, color: cat.color }}>{cat.name}</Badge>}
      <Badge variant="outline" className={cn('text-[10px]',
        tx.status === 'pago' && 'border-emerald-500 text-emerald-500',
        tx.status === 'pendente' && !isOverdue && 'border-amber-500 text-amber-500',
        isOverdue && 'border-destructive text-destructive',
        tx.status === 'parcial' && 'border-blue-500 text-blue-500',
      )}>{isOverdue ? 'Vencido' : tx.status === 'pago' ? 'Pago' : tx.status === 'parcial' ? 'Parcial' : 'Pendente'}</Badge>
      <span className={cn('font-semibold w-28 text-right', tx.type === 'receita' ? 'text-emerald-500' : 'text-rose-500')}>
        {tx.type === 'despesa' && '- '}{formatBRL(Number(tx.amount))}
      </span>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(tx.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
    </div>
  );
}

// ─── Main Page ──────────────────────────
export default function BillingPage() {
  const { data: allTx, isLoading: txLoading } = useFinancialTransactions();
  const { data: receitas } = useFinancialTransactions('receita');
  const { data: despesas } = useFinancialTransactions('despesa');
  const { data: clients } = useFinancialClients();
  const { data: suppliers } = useFinancialSuppliers();
  const { data: categories } = useFinancialCategories();
  const { data: recurring } = useFinancialRecurring();
  const deleteTx = useDeleteTransaction();
  const deleteRecurring = useDeleteRecurring();

  const [activeTab, setActiveTab] = useState('overview');
  const [showVenda, setShowVenda] = useState(false);
  const [showDespesa, setShowDespesa] = useState(false);
  const [showCategorias, setShowCategorias] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [dateStart, setDateStart] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateEnd, setDateEnd] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const filterTx = (txs: FinancialTransaction[] | undefined) => {
    if (!txs) return [];
    return txs.filter(tx => {
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (clientFilter !== 'all' && tx.client_id !== clientFilter && tx.supplier_id !== clientFilter) return false;
      const d = parseISO(tx.due_date);
      if (dateStart && isBefore(d, parseISO(dateStart))) return false;
      if (dateEnd && isBefore(parseISO(dateEnd), d)) return false;
      return true;
    });
  };

  // Overview metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const recs = receitas || [];
    const desps = despesas || [];

    const recebido = recs.filter(t => t.status === 'pago').reduce((s, t) => s + Number(t.amount), 0);
    const recPendente = recs.filter(t => t.status === 'pendente').reduce((s, t) => s + Number(t.amount), 0);
    const recVencido = recs.filter(t => t.status === 'pendente' && isBefore(parseISO(t.due_date), now)).reduce((s, t) => s + Number(t.amount), 0);
    const totalReceber = recebido + recPendente + recVencido;

    const pago = desps.filter(t => t.status === 'pago').reduce((s, t) => s + Number(t.amount), 0);
    const despPendente = desps.filter(t => t.status === 'pendente').reduce((s, t) => s + Number(t.amount), 0);
    const despVencido = desps.filter(t => t.status === 'pendente' && isBefore(parseISO(t.due_date), now)).reduce((s, t) => s + Number(t.amount), 0);
    const totalPagar = pago + despPendente + despVencido;

    const lucro = recebido - pago;

    // Filtered totals for receber/pagar tabs
    const filteredRec = filterTx(recs);
    const filteredDesp = filterTx(desps);
    const filtRecTotal = filteredRec.reduce((s, t) => s + Number(t.amount), 0);
    const filtRecPend = filteredRec.filter(t => t.status === 'pendente').reduce((s, t) => s + Number(t.amount), 0);
    const filtDespTotal = filteredDesp.reduce((s, t) => s + Number(t.amount), 0);
    const filtDespPend = filteredDesp.filter(t => t.status === 'pendente').reduce((s, t) => s + Number(t.amount), 0);

    // Recurring
    const activeRecurring = (recurring || []).filter(r => r.is_active);
    const mrr = activeRecurring.filter(r => r.type === 'receita').reduce((s, r) => s + Number(r.amount), 0);
    const mrrDespesa = activeRecurring.filter(r => r.type === 'despesa').reduce((s, r) => s + Number(r.amount), 0);

    // Reports
    const emAtraso = recs.filter(t => t.status === 'pendente' && isBefore(parseISO(t.due_date), now)).reduce((s, t) => s + Number(t.amount), 0);
    const ticketMedio = recs.filter(t => t.status === 'pago').length > 0 ? recebido / recs.filter(t => t.status === 'pago').length : 0;
    const inadimplencia = (recebido + recPendente) > 0 ? (emAtraso / (recebido + recPendente)) * 100 : 0;

    return {
      recebido, recPendente, recVencido, totalReceber,
      pago, despPendente, despVencido, totalPagar,
      lucro,
      filtRecTotal, filtRecPend, filtDespTotal, filtDespPend,
      activeRecurring: activeRecurring.length, mrr, mrrDespesa,
      totalRecurring: (recurring || []).length,
      emAtraso, ticketMedio, inadimplencia,
    };
  }, [receitas, despesas, recurring, search, statusFilter, clientFilter, dateStart, dateEnd]);

  // Chart data for reports
  const monthlyChartData = useMemo(() => {
    const data: { month: string; Receita: number; Despesa: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const ms = startOfMonth(d); const me = endOfMonth(d);
      const rec = (receitas || []).filter(t => t.status === 'pago' && isWithinInterval(parseISO(t.due_date), { start: ms, end: me })).reduce((s, t) => s + Number(t.amount), 0);
      const desp = (despesas || []).filter(t => t.status === 'pago' && isWithinInterval(parseISO(t.due_date), { start: ms, end: me })).reduce((s, t) => s + Number(t.amount), 0);
      data.push({ month: format(d, 'MMM', { locale: ptBR }), Receita: rec, Despesa: desp });
    }
    return data;
  }, [receitas, despesas]);

  const receitaPorCategoria = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};
    (receitas || []).filter(t => t.status === 'pago').forEach(t => {
      const cat = categories?.find(c => c.id === t.category_id);
      const key = cat?.name || 'Sem categoria';
      if (!map[key]) map[key] = { name: key, value: 0, color: cat?.color || '#64748b' };
      map[key].value += Number(t.amount);
    });
    return Object.values(map).filter(d => d.value > 0);
  }, [receitas, categories]);

  const despesaPorCategoria = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};
    (despesas || []).filter(t => t.status === 'pago').forEach(t => {
      const cat = categories?.find(c => c.id === t.category_id);
      const key = cat?.name || 'Sem categoria';
      if (!map[key]) map[key] = { name: key, value: 0, color: cat?.color || '#64748b' };
      map[key].value += Number(t.amount);
    });
    return Object.values(map).filter(d => d.value > 0);
  }, [despesas, categories]);

  const handleDelete = (id: string) => { if (confirm('Remover este registro?')) deleteTx.mutate(id); };

  if (txLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Controle suas receitas, despesas e contas</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => setShowVenda(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <TrendingUp className="w-4 h-4" /> Venda Rápida
          </Button>
          <Button onClick={() => setShowDespesa(true)} className="gap-1.5 bg-rose-600 hover:bg-rose-700">
            <TrendingDown className="w-4 h-4" /> Lançar Despesa
          </Button>
          <Button variant="outline" onClick={() => setShowCategorias(true)} className="gap-1.5">
            <Eye className="w-4 h-4" /> Categorias
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1"><Eye className="w-3.5 h-3.5" /> Visão Geral</TabsTrigger>
              <TabsTrigger value="receber" className="text-xs sm:text-sm gap-1"><TrendingUp className="w-3.5 h-3.5" /> Receber</TabsTrigger>
              <TabsTrigger value="pagar" className="text-xs sm:text-sm gap-1"><TrendingDown className="w-3.5 h-3.5" /> Pagar</TabsTrigger>
              <TabsTrigger value="clientes" className="text-xs sm:text-sm gap-1"><Users className="w-3.5 h-3.5" /> Clientes</TabsTrigger>
              <TabsTrigger value="fornecedores" className="text-xs sm:text-sm">Fornecedores</TabsTrigger>
              <TabsTrigger value="pix" className="text-xs sm:text-sm gap-1"><Receipt className="w-3.5 h-3.5" /> PIX</TabsTrigger>
              <TabsTrigger value="recorrentes" className="text-xs sm:text-sm gap-1"><Repeat className="w-3.5 h-3.5" /> Recorrentes</TabsTrigger>
              <TabsTrigger value="relatorios" className="text-xs sm:text-sm gap-1"><BarChart3 className="w-3.5 h-3.5" /> Relatórios</TabsTrigger>
            </TabsList>
          </div>

          {/* ═══ VISÃO GERAL ═══ */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10"><TrendingUp className="w-4 h-4 text-emerald-500" /></div>
                    <span className="font-semibold">Contas a Receber</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Recebido</span><span className="text-emerald-500 font-medium">{formatBRL(metrics.recebido)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pendente</span><span className="text-amber-500 font-medium">{formatBRL(metrics.recPendente)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Vencido</span><span className="text-destructive font-medium">{formatBRL(metrics.recVencido)}</span></div>
                    <div className="flex justify-between pt-2 border-t mt-2"><span className="font-semibold">Total</span><span className="font-bold">{formatBRL(metrics.totalReceber)}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-rose-500/10"><TrendingDown className="w-4 h-4 text-rose-500" /></div>
                    <span className="font-semibold">Contas a Pagar</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Pago</span><span className="text-emerald-500 font-medium">{formatBRL(metrics.pago)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pendente</span><span className="text-amber-500 font-medium">{formatBRL(metrics.despPendente)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Vencido</span><span className="text-destructive font-medium">{formatBRL(metrics.despVencido)}</span></div>
                    <div className="flex justify-between pt-2 border-t mt-2"><span className="font-semibold">Total</span><span className="font-bold">{formatBRL(metrics.totalPagar)}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10"><DollarSign className="w-4 h-4 text-primary" /></div>
                    <span className="font-semibold">Lucro do Período</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Receitas</span><span className="text-emerald-500 font-medium">{formatBRL(metrics.recebido)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Despesas</span><span className="text-rose-500 font-medium">{formatBRL(metrics.pago)}</span></div>
                    <div className="flex justify-between pt-2 border-t mt-2">
                      <span className="font-semibold">Lucro Líquido</span>
                      <span className={cn('font-bold', metrics.lucro >= 0 ? 'text-emerald-500' : 'text-destructive')}>{formatBRL(metrics.lucro)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transações recentes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Transações</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="parcial">Parcial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="all">
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent>
                  </Select>
                  <Select value="all">
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todas</SelectItem></SelectContent>
                  </Select>
                  <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-36 h-8 text-xs" />
                  <span className="text-muted-foreground self-center text-xs">-</span>
                  <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-36 h-8 text-xs" />
                </div>

                <div className="border rounded-lg overflow-hidden">
                  {filterTx(allTx).length > 0 ? (
                    filterTx(allTx).slice(0, 20).map(tx => (
                      <TransactionRow key={tx.id} tx={tx} clients={clients} suppliers={suppliers} categories={categories} onDelete={handleDelete} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-12">Nenhuma transação encontrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ RECEBER ═══ */}
          <TabsContent value="receber" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">Filtros Rápidos</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-32 h-7 text-xs" />
                <span>—</span>
                <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-32 h-7 text-xs" />
              </div>
              <Badge className="bg-emerald-600/20 text-emerald-500 border-emerald-500/30 text-xs">Total: {formatBRL(metrics.filtRecTotal)}</Badge>
              <Badge className="bg-amber-600/20 text-amber-500 border-amber-500/30 text-xs">Pendente mês: {formatBRL(metrics.filtRecPend)}</Badge>
              <Button size="sm" onClick={() => setShowVenda(true)} className="ml-auto gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <TrendingUp className="w-4 h-4" /> Nova Conta a Receber
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Receipt className="w-4 h-4" /> Contas a Receber</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1"><Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar cliente, título..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="pago">Pago</SelectItem></SelectContent>
                  </Select>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Todos clientes" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos clientes</SelectItem>
                      {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  {filterTx(receitas).length > 0 ? filterTx(receitas).map(tx => (
                    <TransactionRow key={tx.id} tx={tx} clients={clients} suppliers={suppliers} categories={categories} onDelete={handleDelete} />
                  )) : <p className="text-sm text-muted-foreground text-center py-12">Nenhuma conta a receber encontrada</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PAGAR ═══ */}
          <TabsContent value="pagar" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">Filtros Rápidos</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-32 h-7 text-xs" />
                <span>—</span>
                <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-32 h-7 text-xs" />
              </div>
              <Badge className="bg-rose-600/20 text-rose-500 border-rose-500/30 text-xs">Total: {formatBRL(metrics.filtDespTotal)}</Badge>
              <Badge className="bg-amber-600/20 text-amber-500 border-amber-500/30 text-xs">Pendente: {formatBRL(metrics.filtDespPend)}</Badge>
              <Button size="sm" onClick={() => setShowDespesa(true)} className="ml-auto gap-1.5 bg-rose-600 hover:bg-rose-700">
                <TrendingDown className="w-4 h-4" /> Lançar Despesa
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Receipt className="w-4 h-4" /> Contas a Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1"><Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar fornecedor, descrição..." className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="pago">Pago</SelectItem></SelectContent>
                  </Select>
                  <Select value="all">
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Todas categorias" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todas categorias</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  {filterTx(despesas).length > 0 ? filterTx(despesas).map(tx => (
                    <TransactionRow key={tx.id} tx={tx} clients={clients} suppliers={suppliers} categories={categories} onDelete={handleDelete} />
                  )) : <p className="text-sm text-muted-foreground text-center py-12">Nenhuma conta a pagar encontrada</p>}
                </div>
              </CardContent>
            </Card>

            {/* Despesas Recorrentes */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Despesas Recorrentes</h3>
              <Button variant="outline" size="sm" className="gap-1.5 text-rose-500 border-rose-500/30">
                <Plus className="w-3.5 h-3.5" /> Nova Despesa Recorrente
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><RefreshCw className="w-3.5 h-3.5 text-rose-500" /> Despesas Ativas</div>
                <p className="text-2xl font-bold">{(recurring || []).filter(r => r.is_active && r.type === 'despesa').length}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><DollarSign className="w-3.5 h-3.5 text-rose-500" /> Custo Mensal Fixo</div>
                <p className="text-2xl font-bold text-rose-500">{formatBRL(metrics.mrrDespesa)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Eye className="w-3.5 h-3.5" /> Total</div>
                <p className="text-2xl font-bold">{(recurring || []).filter(r => r.type === 'despesa').length}</p>
              </CardContent></Card>
            </div>
            {(recurring || []).filter(r => r.type === 'despesa').length === 0 && (
              <Card><CardContent className="py-12 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma despesa recorrente encontrada</p>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* ═══ CLIENTES ═══ */}
          <TabsContent value="clientes" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Clientes</CardTitle>
                <Button size="sm" onClick={() => setShowVenda(true)} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Novo Cliente</Button>
              </CardHeader>
              <CardContent>
                {clients && clients.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[2fr,1.5fr,1fr,60px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                      <span>Nome</span><span>Email</span><span>Telefone</span><span />
                    </div>
                    {clients.map(c => (
                      <div key={c.id} className="grid grid-cols-[2fr,1.5fr,1fr,60px] gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground">{c.email || '—'}</span>
                        <span className="text-muted-foreground">{c.phone || '—'}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => { if (confirm('Remover cliente?')) { const dc = useDeleteClient as any; } }}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-12">Nenhum cliente cadastrado</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ FORNECEDORES ═══ */}
          <TabsContent value="fornecedores" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Fornecedores</CardTitle>
                <Button size="sm" onClick={() => setShowDespesa(true)} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Novo Fornecedor</Button>
              </CardHeader>
              <CardContent>
                {suppliers && suppliers.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[2fr,1.5fr,1fr,60px] gap-3 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                      <span>Nome</span><span>Email</span><span>Telefone</span><span />
                    </div>
                    {suppliers.map(s => (
                      <div key={s.id} className="grid grid-cols-[2fr,1.5fr,1fr,60px] gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30 items-center">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground">{s.email || '—'}</span>
                        <span className="text-muted-foreground">{s.phone || '—'}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-12">Nenhum fornecedor cadastrado</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ PIX ═══ */}
          <TabsContent value="pix" className="mt-4">
            <PixKeysManager />
          </TabsContent>

          {/* ═══ RECORRENTES ═══ */}
          <TabsContent value="recorrentes" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Assinaturas Ativas</div>
                <p className="text-2xl font-bold">{metrics.activeRecurring}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> MRR Interno</div>
                <p className="text-2xl font-bold text-emerald-500">{formatBRL(metrics.mrr)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Eye className="w-3.5 h-3.5" /> Total de Assinaturas</div>
                <p className="text-2xl font-bold">{metrics.totalRecurring}</p>
              </CardContent></Card>
            </div>

            {(recurring || []).filter(r => r.type === 'receita').length > 0 ? (
              <Card>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    {(recurring || []).filter(r => r.type === 'receita').map(r => (
                      <div key={r.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-sm hover:bg-muted/30">
                        <span className="flex-1 font-medium">{r.description}</span>
                        <Badge variant={r.is_active ? 'default' : 'secondary'} className="text-[10px]">{r.is_active ? 'Ativo' : 'Inativo'}</Badge>
                        <span className="text-emerald-500 font-semibold w-28 text-right">{formatBRL(Number(r.amount))}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRecurring.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent className="py-12 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma assinatura interna encontrada</p>
                <p className="text-xs text-muted-foreground">Crie uma venda recorrente "Até cancelar" para começar</p>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* ═══ RELATÓRIOS ═══ */}
          <TabsContent value="relatorios" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Relatórios Financeiros</h2>
                <p className="text-sm text-muted-foreground">Visão completa das suas finanças</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5"><ArrowDownRight className="w-4 h-4" /> Exportar</Button>
                <Select defaultValue="month">
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="month">Este mês</SelectItem><SelectItem value="quarter">Trimestre</SelectItem><SelectItem value="year">Este ano</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            {/* KPIs row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Receita Total</div>
                <p className="text-xl font-bold text-emerald-500">{formatBRL(metrics.recebido)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Despesa Total</div>
                <p className="text-xl font-bold text-rose-500">{formatBRL(metrics.pago)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Lucro Líquido</div>
                <p className={cn('text-xl font-bold', metrics.lucro >= 0 ? 'text-emerald-500' : 'text-rose-500')}>{formatBRL(metrics.lucro)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><ArrowUpRight className="w-3.5 h-3.5 text-amber-500" /> Inadimplência</div>
                <p className="text-xl font-bold text-amber-500">{metrics.inadimplencia.toFixed(1)}%</p>
              </CardContent></Card>
            </div>

            {/* KPIs row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Recebido</div>
                <p className="text-lg font-bold">{formatBRL(metrics.recebido)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Em Atraso</div>
                <p className="text-lg font-bold text-rose-500">{formatBRL(metrics.emAtraso)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Ticket Médio</div>
                <p className="text-lg font-bold">{formatBRL(metrics.ticketMedio)}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><RefreshCw className="w-3 h-3" /> Assinaturas Ativas</div>
                <p className="text-lg font-bold">{metrics.activeRecurring}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><RefreshCw className="w-3 h-3" /> MRR Interno</div>
                <p className="text-lg font-bold text-emerald-500">{formatBRL(metrics.mrr)}</p>
              </CardContent></Card>
            </div>

            {/* Receita vs Despesa chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Receita vs Despesa</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                    <Tooltip formatter={(value: number) => formatBRL(value)} />
                    <Legend />
                    <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Receita por Categoria</CardTitle></CardHeader>
                <CardContent>
                  {receitaPorCategoria.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie data={receitaPorCategoria} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {receitaPorCategoria.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatBRL(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-muted-foreground text-center py-12">Sem dados</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Despesas por Categoria</CardTitle></CardHeader>
                <CardContent>
                  {despesaPorCategoria.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie data={despesaPorCategoria} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {despesaPorCategoria.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatBRL(value)} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-muted-foreground text-center py-12">Sem dados</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <VendaRapidaModal open={showVenda} onOpenChange={setShowVenda} />
      <LancarDespesaModal open={showDespesa} onOpenChange={setShowDespesa} />
      <CategoriasModal open={showCategorias} onOpenChange={setShowCategorias} />
    </AppLayout>
  );
}
