import { useState } from 'react';
import { DollarSign, Plus, Pencil, Trash2, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useKanbanPayments, useCreatePayment, useUpdatePayment, useDeletePayment, KanbanPayment } from '@/hooks/useKanbanPayments';
import { KanbanDeal } from '@/hooks/useKanban';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_OPTIONS = [
  { value: 'pago', label: 'Pago', icon: CheckCircle, className: 'text-emerald-600 bg-emerald-50' },
  { value: 'pendente', label: 'Pendente', icon: Clock, className: 'text-amber-600 bg-amber-50' },
  { value: 'cancelado', label: 'Cancelado', icon: XCircle, className: 'text-destructive bg-destructive/10' },
];

function PaymentForm({ open, onOpenChange, dealId, editPayment }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dealId: string;
  editPayment?: KanbanPayment | null;
}) {
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const [form, setForm] = useState({
    amount: editPayment?.amount || 0,
    payment_date: editPayment?.payment_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    status: editPayment?.status || 'pendente',
    description: editPayment?.description || '',
  });

  const handleSubmit = () => {
    if (form.amount <= 0) return;
    if (editPayment) {
      updatePayment.mutate({ id: editPayment.id, ...form }, { onSuccess: () => onOpenChange(false) });
    } else {
      createPayment.mutate({ deal_id: dealId, ...form }, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editPayment ? 'Editar Pagamento' : 'Novo Pagamento'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Valor (R$)</Label>
            <Input type="number" min={0} step={0.01} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição (opcional)</Label>
            <Input placeholder="Ex: Parcela 1/3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createPayment.isPending || updatePayment.isPending}>
            {(createPayment.isPending || updatePayment.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editPayment ? 'Salvar' : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DealPaymentsModal({ open, onOpenChange, deal }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  deal: KanbanDeal;
}) {
  const { data: payments, isLoading } = useKanbanPayments(deal.id);
  const deletePayment = useDeletePayment();
  const [showForm, setShowForm] = useState(false);
  const [editPayment, setEditPayment] = useState<KanbanPayment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPago = payments?.filter(p => p.status === 'pago').reduce((s, p) => s + Number(p.amount), 0) || 0;
  const totalPendente = payments?.filter(p => p.status === 'pendente').reduce((s, p) => s + Number(p.amount), 0) || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Faturamento - {deal.company_name}
            </DialogTitle>
          </DialogHeader>

          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Total Pago</p>
                <p className="text-lg font-bold text-emerald-600">
                  R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="text-lg font-bold text-amber-600">
                  R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de pagamentos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Pagamentos</h4>
              <Button size="sm" variant="outline" onClick={() => { setEditPayment(null); setShowForm(true); }}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Novo
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map(payment => {
                  const statusInfo = STATUS_OPTIONS.find(s => s.value === payment.status) || STATUS_OPTIONS[1];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={payment.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-card group">
                      <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusInfo.className.split(' ')[0]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${statusInfo.className}`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          {payment.description && <span>· {payment.description}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditPayment(payment); setShowForm(true); }} className="p-1 rounded hover:bg-muted">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletingId(payment.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum pagamento registrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showForm && (
        <PaymentForm
          open={showForm}
          onOpenChange={v => { setShowForm(v); if (!v) setEditPayment(null); }}
          dealId={deal.id}
          editPayment={editPayment}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pagamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingId) deletePayment.mutate(deletingId); setDeletingId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
