import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, DollarSign, Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancialClients, useFinancialCategories, useCreateTransaction } from '@/hooks/useFinancial';
import { useFinancialServices } from '@/hooks/useFinancial';
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
      <DialogContent className={cn("max-w-md", mode === 'quick' && 'max-w-lg')}>
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
  });

  const handleSubmit = () => {
    if (!form.description.trim() || !form.amount) {
      toast({ title: 'Preencha descrição e valor', variant: 'destructive' });
      return;
    }

    createTx.mutate({
      type: 'receita',
      description: form.description,
      amount: Number(form.amount),
      currency: form.currency,
      due_date: form.due_date,
      payment_mode: form.payment_mode,
      status: form.status === 'pago' ? 'pago' : 'pendente',
      paid_date: form.status === 'pago' ? form.due_date : null,
      client_id: form.client_id || null,
      category_id: form.category_id || null,
      notes: form.notes || null,
    } as any, {
      onSuccess: () => {
        toast({ title: 'Venda registrada com sucesso!' });
        onClose();
      },
    });
  };

  const revenueCategories = categories.filter(c => c.type === 'receita');

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          Nova Venda Rápida
        </DialogTitle>
        <p className="text-sm text-muted-foreground">Registre uma venda de forma rápida e prática</p>
      </DialogHeader>

      <div className="space-y-3 mt-2">
        {/* Cliente */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1">👤 Cliente</Label>
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Novo
          </button>
        </div>
        <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
          <SelectContent>
            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Serviços */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1">⚙️ Serviços</Label>
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Novo
          </button>
        </div>
        <Select onValueChange={v => {
          const svc = services.find(s => s.id === v);
          if (svc) {
            setForm(f => ({
              ...f,
              service_ids: [...f.service_ids, v],
              description: f.description || svc.name,
              amount: f.amount || String(svc.default_price),
            }));
          }
        }}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Buscar e adicionar serviço..." /></SelectTrigger>
          <SelectContent>
            {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - R$ {s.default_price}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Descrição */}
        <div>
          <Label className="text-xs font-medium">Descrição *</Label>
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Ex: Projeto de logo" className="h-9" />
        </div>

        {/* Valor + Moeda + Vencimento */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs font-medium">Valor *</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0,00" className="h-9" />
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
              { id: 'avista', label: '$ À Vista', color: 'bg-emerald-500' },
              { id: 'parcelado', label: '⊕ Parcelado', color: '' },
              { id: 'recorrente', label: '↻ Recorrente', color: '' },
            ].map(opt => (
              <button key={opt.id}
                onClick={() => setForm(f => ({ ...f, payment_mode: opt.id as any }))}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                  form.payment_mode === opt.id
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'border-border text-foreground hover:bg-accent'
                )}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <Label className="text-xs font-medium">Status</Label>
          <div className="flex gap-1 mt-1">
            {[
              { id: 'pendente', label: '⊘ Pendente', color: 'bg-pink-500' },
              { id: 'parcial', label: '$ Parcial', color: '' },
              { id: 'pago', label: '⊕ Pago', color: '' },
            ].map(opt => (
              <button key={opt.id}
                onClick={() => setForm(f => ({ ...f, status: opt.id as any }))}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                  form.status === opt.id
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'border-border text-foreground hover:bg-accent'
                )}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categoria */}
        <div>
          <Label className="text-xs font-medium">Categoria Financeira</Label>
          <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Sem categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem categoria</SelectItem>
              {revenueCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleSubmit} disabled={createTx.isPending}>
            {createTx.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Lançar
          </Button>
        </div>
      </div>
    </>
  );
}
