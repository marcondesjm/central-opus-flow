import { useState, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, DollarSign, Plus, Calendar, Settings2, Repeat, CreditCard, Banknote, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancialClients, useCreateClient, useFinancialCategories, useCreateCategory, useCreateTransaction, useFinancialServices, useCreateService, formatBRL, CATEGORY_COLORS } from '@/hooks/useFinancial';
import { cn } from '@/lib/utils';

interface NewSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenQuoteWizard?: () => void;
}

export function NewSaleModal({ open, onOpenChange, onOpenQuoteWizard }: NewSaleModalProps) {
  const [mode, setMode] = useState<'choose' | 'quick'>('choose');

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setMode('choose'); onOpenChange(v); }}>
      <DialogContent className={cn("max-w-md", mode === 'quick' && 'max-w-lg max-h-[90vh] flex flex-col')}>
        {mode === 'choose' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">O que você deseja fazer?</DialogTitle>
              <p className="text-sm text-muted-foreground text-center">Escolha uma opção para continuar</p>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => {
                  onOpenChange(false);
                  setMode('choose');
                  onOpenQuoteWizard?.();
                }}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Novo Orçamento</p>
                  <p className="text-xs text-muted-foreground">Proposta detalhada com aprovação</p>
                </div>
              </button>
              <button
                onClick={() => setMode('quick')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-emerald-500/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Venda Rápida</p>
                  <p className="text-xs text-muted-foreground">Registrar venda direto</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <QuickSaleForm onClose={() => { setMode('choose'); onOpenChange(false); }} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuickSaleForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const { data: clients = [] } = useFinancialClients();
  const { data: services = [] } = useFinancialServices();
  const { data: categories = [] } = useFinancialCategories();
  const createTx = useCreateTransaction();
  const createClient = useCreateClient();
  const createService = useCreateService();
  const createCategory = useCreateCategory();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [showNewService, setShowNewService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

  const [form, setForm] = useState({
    client_id: '',
    service_ids: [] as string[],
    description: '',
    amount: '',
    currency: 'BRL',
    due_date: new Date().toISOString().split('T')[0],
    payment_mode: 'avista' as 'avista' | 'parcelado' | 'recorrente',
    status: 'pendente' as 'pendente' | 'parcial' | 'pago',
    category_id: '',
    notes: '',
    installments: 3,
    installment_frequency: 'mensal',
    has_entry: false,
    recurring_cycle: 'mensal',
    recurring_duration: 'until_cancel' as 'until_cancel' | 'fixed',
    recurring_fixed_count: 12,
  });

  const amount = Number(form.amount) || 0;
  const installmentValue = useMemo(() => {
    if (form.payment_mode !== 'parcelado' || form.installments <= 0) return 0;
    return amount / form.installments;
  }, [amount, form.installments, form.payment_mode]);

  const handleCreateClient = async () => {
    if (!newClientName.trim()) { toast({ title: 'Informe o nome do cliente', variant: 'destructive' }); return; }
    try {
      const r = await createClient.mutateAsync({ name: newClientName.trim() });
      setForm(f => ({ ...f, client_id: r.id }));
      setNewClientName('');
      setShowNewClient(false);
      toast({ title: 'Cliente criado!' });
    } catch {}
  };

  const handleCreateService = async () => {
    if (!newServiceName.trim()) { toast({ title: 'Informe o nome do serviço', variant: 'destructive' }); return; }
    try {
      const price = Number(newServicePrice) || 0;
      const r = await createService.mutateAsync({ name: newServiceName.trim(), default_price: price });
      setForm(f => ({
        ...f,
        service_ids: [...f.service_ids, r.id],
        description: f.description ? `${f.description}, ${r.name}` : r.name,
        amount: f.amount ? String(Number(f.amount) + price) : String(price),
      }));
      setNewServiceName('');
      setNewServicePrice('');
      setShowNewService(false);
      toast({ title: 'Serviço criado!' });
    } catch {}
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) { toast({ title: 'Informe o nome da categoria', variant: 'destructive' }); return; }
    try {
      const r = await createCategory.mutateAsync({ name: newCategoryName.trim(), color: newCategoryColor, type: 'receita' });
      setForm(f => ({ ...f, category_id: r.id }));
      setNewCategoryName('');
      setShowNewCategory(false);
      toast({ title: 'Categoria criada!' });
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.amount) {
      toast({ title: 'Preencha descrição e valor', variant: 'destructive' });
      return;
    }

    let clientId = form.client_id || null;

    if (form.payment_mode === 'parcelado' && form.installments > 1) {
      const baseDate = new Date(form.due_date);
      for (let i = 0; i < form.installments; i++) {
        const dueDate = new Date(baseDate);
        if (form.installment_frequency === 'mensal') dueDate.setMonth(dueDate.getMonth() + i);
        else if (form.installment_frequency === 'quinzenal') dueDate.setDate(dueDate.getDate() + (i * 15));
        else if (form.installment_frequency === 'semanal') dueDate.setDate(dueDate.getDate() + (i * 7));

        createTx.mutate({
          type: 'receita',
          description: `${form.description} (${i + 1}/${form.installments})`,
          amount: installmentValue,
          currency: form.currency,
          due_date: dueDate.toISOString().split('T')[0],
          payment_mode: 'parcelado',
          installments: form.installments,
          installment_number: i + 1,
          status: 'pendente',
          client_id: clientId,
          category_id: form.category_id || null,
          notes: `${form.installments}x ${form.installment_frequency} de ${formatBRL(installmentValue)}`,
        } as any, {
          onSuccess: i === form.installments - 1 ? () => { toast({ title: 'Venda parcelada registrada!' }); onClose(); } : undefined,
        });
      }
    } else {
      createTx.mutate({
        type: 'receita',
        description: form.description,
        amount,
        currency: form.currency,
        due_date: form.due_date,
        payment_mode: form.payment_mode,
        status: form.status === 'pago' ? 'pago' : form.status,
        paid_date: form.status === 'pago' ? form.due_date : null,
        client_id: clientId,
        category_id: form.category_id || null,
        notes: form.payment_mode === 'recorrente'
          ? `Recorrente ${form.recurring_cycle}, ${form.recurring_duration === 'until_cancel' ? 'até cancelar' : `${form.recurring_fixed_count}x`}`
          : (form.notes || null),
      } as any, {
        onSuccess: () => { toast({ title: 'Venda registrada com sucesso!' }); onClose(); },
      });
    }
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()));

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          Nova Venda Rápida
        </DialogTitle>
        <p className="text-sm text-muted-foreground">Registre uma venda de forma rápida e prática</p>
      </DialogHeader>

      <div ref={scrollRef} className="space-y-3 mt-2 overflow-y-auto flex-1 pr-1 relative">
        {/* Cliente */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1">👤 Cliente</Label>
          <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => setShowNewClient(!showNewClient)}>
            <Plus className="w-3 h-3" /> Novo
          </button>
        </div>
        {showNewClient ? (
          <div className="flex gap-2">
            <Input placeholder="Nome do novo cliente..." value={newClientName} onChange={e => setNewClientName(e.target.value)} className="h-9 flex-1" />
            <Button size="sm" className="h-9" onClick={handleCreateClient} disabled={createClient.isPending}>
              {createClient.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        ) : (
          <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
            <SelectContent>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {/* Serviços */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1">⚙️ Serviços</Label>
          <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => setShowNewService(!showNewService)}>
            <Plus className="w-3 h-3" /> Novo
          </button>
        </div>
        {showNewService ? (
          <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/30">
            <Input placeholder="Nome do serviço..." value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="h-9" />
            <Input type="number" placeholder="Preço (R$)" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="h-9" step="0.01" min={0} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => setShowNewService(false)}>Cancelar</Button>
              <Button size="sm" className="flex-1 h-8" onClick={handleCreateService} disabled={createService.isPending}>
                {createService.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Criar Serviço'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Input placeholder="Buscar e adicionar serviço..." value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} className="h-9" />
            {serviceSearch && (
              <div className="absolute z-50 top-10 left-0 right-0 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredServices.length > 0 ? filteredServices.map(s => (
                  <button key={s.id} className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => {
                      setForm(f => ({
                        ...f,
                        service_ids: [...f.service_ids, s.id],
                        description: f.description ? `${f.description}, ${s.name}` : s.name,
                        amount: f.amount ? String(Number(f.amount) + Number(s.default_price)) : String(s.default_price),
                      }));
                      setServiceSearch('');
                    }}>
                    {s.name} — {formatBRL(Number(s.default_price))}
                  </button>
                )) : (
                  <p className="px-3 py-3 text-sm text-muted-foreground text-center">Nenhum serviço encontrado</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Descrição */}
        <div>
          <Label className="text-xs font-medium">Descrição *</Label>
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Ex: Projeto de logo" className="h-9" />
        </div>

        {/* Valor + Moeda + Vencimento */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2">
          <div>
            <Label className="text-xs font-medium">Valor *</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0,00" className="h-9" min={0} />
          </div>
          <div>
            <Label className="text-xs font-medium">Moeda</Label>
            <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BRL</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Vencimento *</Label>
            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="h-9" />
          </div>
        </div>

        {/* Modo de Pagamento */}
        <div>
          <Label className="text-xs font-medium">Modo de Pagamento</Label>
          <div className="flex gap-1 mt-1">
            {[
              { id: 'avista', label: '$ À Vista' },
              { id: 'parcelado', label: '⊕ Parcelado' },
              { id: 'recorrente', label: '↻ Recorrente' },
            ].map(opt => (
              <button key={opt.id}
                onClick={() => setForm(f => ({ ...f, payment_mode: opt.id as any }))}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                  form.payment_mode === opt.id
                    ? opt.id === 'avista' ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-pink-500 text-white border-pink-500'
                    : 'border-border text-foreground hover:bg-accent'
                )}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Parcelado */}
        {form.payment_mode === 'parcelado' && (
          <Card className="border-pink-500/20 bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-pink-400 flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                <strong>Parcelado:</strong> Divide o valor total em parcelas fixas com datas definidas.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Frequência</Label>
                  <Select value={form.installment_frequency} onValueChange={v => setForm(f => ({ ...f, installment_frequency: v }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quinzenal">Quinzenal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Nº de Parcelas</Label>
                  <Input type="number" min={2} max={48} value={form.installments} onChange={e => setForm(f => ({ ...f, installments: parseInt(e.target.value) || 2 }))} className="h-9" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Entrada (1º pagamento diferente)</p>
                <Switch checked={form.has_entry} onCheckedChange={v => setForm(f => ({ ...f, has_entry: v }))} />
              </div>
              <div>
                <Label className="text-xs">Valor por parcela</Label>
                <Input readOnly value={installmentValue.toFixed(2)} className="h-9 bg-muted" />
                <p className="text-[10px] text-muted-foreground mt-0.5">O sistema calcula automaticamente</p>
              </div>
              <Card className="bg-background">
                <CardContent className="p-3 space-y-1 text-sm">
                  <p className="font-semibold flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Resumo do parcelamento:</p>
                  <p className="text-muted-foreground">{form.installments}x parcela(s) {form.installment_frequency === 'mensal' ? 'mensais' : form.installment_frequency === 'quinzenal' ? 'quinzenais' : 'semanais'} <span className="float-right font-semibold">{formatBRL(installmentValue)}</span></p>
                  <p className="font-bold">Total <span className="float-right text-pink-500">{formatBRL(amount)}</span></p>
                </CardContent>
              </Card>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <p className="text-sm font-medium">Cobranças automáticas</p>
                  <p className="text-[10px] text-muted-foreground">Configure um gateway de pagamento</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1 text-xs"><Settings2 className="w-3 h-3" /> Configurar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recorrente */}
        {form.payment_mode === 'recorrente' && (
          <Card className="border-pink-500/20 bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-pink-400 flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                <strong>Recorrente:</strong> Cria uma assinatura com cobrança automática no ciclo escolhido.
              </p>
              <div>
                <Label className="text-xs">Ciclo</Label>
                <Select value={form.recurring_cycle} onValueChange={v => setForm(f => ({ ...f, recurring_cycle: v }))}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Duração da assinatura</Label>
                <div className="space-y-2">
                  <button onClick={() => setForm(f => ({ ...f, recurring_duration: 'until_cancel' }))}
                    className={cn('w-full text-left p-3 rounded-lg border transition-colors', form.recurring_duration === 'until_cancel' ? 'border-pink-500 bg-pink-500/10' : 'border-border hover:bg-accent')}>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <span className={cn('w-3 h-3 rounded-full border-2', form.recurring_duration === 'until_cancel' ? 'border-pink-500 bg-pink-500' : 'border-muted-foreground')} />
                      Até cancelar
                    </p>
                    <p className="text-[10px] text-muted-foreground ml-5">Cobra automaticamente a cada ciclo até cancelamento.</p>
                  </button>
                  <button onClick={() => setForm(f => ({ ...f, recurring_duration: 'fixed' }))}
                    className={cn('w-full text-left p-3 rounded-lg border transition-colors', form.recurring_duration === 'fixed' ? 'border-pink-500 bg-pink-500/10' : 'border-border hover:bg-accent')}>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <span className={cn('w-3 h-3 rounded-full border-2', form.recurring_duration === 'fixed' ? 'border-pink-500 bg-pink-500' : 'border-muted-foreground')} />
                      Quantidade fixa
                    </p>
                    <p className="text-[10px] text-muted-foreground ml-5">Define um número exato de cobranças.</p>
                  </button>
                </div>
                {form.recurring_duration === 'fixed' && (
                  <div className="mt-2">
                    <Label className="text-xs">Quantidade de cobranças</Label>
                    <Input type="number" min={2} value={form.recurring_fixed_count} onChange={e => setForm(f => ({ ...f, recurring_fixed_count: parseInt(e.target.value) || 2 }))} className="h-9" />
                  </div>
                )}
              </div>
              <Card className="bg-background">
                <CardContent className="p-3 space-y-1 text-xs">
                  <p>📅 1º vencimento: {form.due_date}</p>
                  <p>💳 Cobrança {form.recurring_cycle} de {formatBRL(amount)}</p>
                  <p>⊘ {form.recurring_duration === 'until_cancel' ? 'Até o cliente cancelar' : `${form.recurring_fixed_count} cobranças`}</p>
                </CardContent>
              </Card>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <div>
                  <p className="text-sm font-medium">Cobranças automáticas</p>
                  <p className="text-[10px] text-muted-foreground">Configure um gateway de pagamento</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1 text-xs"><Settings2 className="w-3 h-3" /> Configurar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <div>
          <Label className="text-xs font-medium">Status</Label>
          <div className="flex gap-1 mt-1">
            {[
              { id: 'pendente', label: '⊘ Pendente' },
              { id: 'parcial', label: '$ Parcial' },
              { id: 'pago', label: '⊕ Pago' },
            ].map(opt => (
              <button key={opt.id}
                onClick={() => setForm(f => ({ ...f, status: opt.id as any }))}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                  form.status === opt.id
                    ? opt.id === 'pendente' ? 'bg-pink-500 text-white border-pink-500' : 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-foreground hover:bg-accent'
                )}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categoria */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs font-medium">Categoria Financeira</Label>
            <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => setShowNewCategory(!showNewCategory)}>
              <Plus className="w-3 h-3" /> Nova
            </button>
          </div>
          {showNewCategory && (
            <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/30 mb-2">
              <Input placeholder="Nome da categoria..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="h-9" />
              <div>
                <Label className="text-xs mb-1 block">Cor</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_COLORS.map(c => (
                    <button key={c} onClick={() => setNewCategoryColor(c)}
                      className={cn('w-5 h-5 rounded-full border-2 transition-all', newCategoryColor === c ? 'border-foreground scale-125' : 'border-transparent')}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => setShowNewCategory(false)}>Cancelar</Button>
                <Button size="sm" className="flex-1 h-8" onClick={handleCreateCategory} disabled={createCategory.isPending}>
                  {createCategory.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Criar'}
                </Button>
              </div>
            </div>
          )}
          <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v === 'none' ? '' : v }))}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Sem categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sem categoria
                </span>
              </SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Observações */}
        <div>
          <Label className="text-xs font-medium">Observações (opcional)</Label>
          <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Adicione observações..." className="min-h-[60px]" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2 pb-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleSubmit} disabled={createTx.isPending}>
            {createTx.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Lançar
          </Button>
        </div>
      </div>

      {/* Scroll down button */}
      <button
        onClick={scrollToBottom}
        className="absolute bottom-20 right-6 w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-10"
        title="Rolar para baixo"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </>
  );
}
