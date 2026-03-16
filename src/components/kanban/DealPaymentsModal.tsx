import { useState } from 'react';
import { DollarSign, Plus, Pencil, Trash2, Loader2, CheckCircle, Clock, XCircle, MessageCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKanbanPayments, useCreatePayment, useUpdatePayment, useDeletePayment, KanbanPayment, PAYMENT_METHODS, PAYMENT_CATEGORIES } from '@/hooks/useKanbanPayments';
import { KanbanDeal } from '@/hooks/useKanban';
import { format, isBefore, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'pago', label: 'Pago', icon: CheckCircle, className: 'text-emerald-600 bg-emerald-50' },
  { value: 'pendente', label: 'Pendente', icon: Clock, className: 'text-amber-600 bg-amber-50' },
  { value: 'cancelado', label: 'Cancelado', icon: XCircle, className: 'text-destructive bg-destructive/10' },
];

function getPaymentUrgency(payment: KanbanPayment) {
  if (payment.status !== 'pendente') return null;
  const today = new Date();
  const payDate = new Date(payment.payment_date);
  const daysUntil = differenceInDays(payDate, today);

  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 2) return 'urgent';
  if (daysUntil <= 5) return 'approaching';
  return null;
}

function buildWhatsAppMessage(deal: KanbanDeal, payment: KanbanPayment, style: 'profissional' | 'amigavel' | 'direta') {
  const valor = `R$ ${Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const vencimento = format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: ptBR });
  const desc = payment.description ? ` referente a "${payment.description}"` : '';

  const messages = {
    profissional: `Olá, ${deal.client_name}! Tudo bem? 👋\n\nEstou entrando em contato para lembrar sobre o pagamento${desc} no valor de *${valor}*, com vencimento em *${vencimento}*. 💰\n\nPoderia verificar para mim, por gentileza? 🙏\n\nCaso já tenha realizado o pagamento, desconsidere esta mensagem. ✅ Obrigado!`,
    amigavel: `Oi, ${deal.client_name}! Tudo bem? 😊\n\nPassando para lembrar do pagamento${desc} de *${valor}* que vence em *${vencimento}*. 📅\n\nQuando puder, dá uma olhadinha, por favor! 🙏\n\nQualquer dúvida estou à disposição 🤝`,
    direta: `Olá, ${deal.client_name}. 👋\n\nVerifiquei que consta um pagamento pendente${desc} no valor de *${valor}*, vencimento *${vencimento}*. 💳\n\nPoderia me informar quando será possível realizar o pagamento? ⏰\n\nAgradeço! 🙏`,
  };
  return messages[style];
}

function WhatsAppBillingButton({ deal, payment }: { deal: KanbanDeal; payment: KanbanPayment }) {
  if (!deal.client_whatsapp || payment.status !== 'pendente') return null;

  const phone = deal.client_whatsapp.replace(/\D/g, '');
  const sendMsg = (msg: string) => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  const urgency = getPaymentUrgency(payment);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={e => e.stopPropagation()}
                className={cn(
                  'p-1 rounded transition-all',
                  urgency === 'overdue' && 'animate-pulse bg-destructive/10 text-destructive',
                  urgency === 'urgent' && 'animate-[pulse_1.5s_ease-in-out_infinite] bg-amber-100 text-amber-600',
                  urgency === 'approaching' && 'animate-[pulse_3s_ease-in-out_infinite] bg-yellow-50 text-yellow-600',
                  !urgency && 'hover:bg-emerald-50 text-emerald-600 opacity-0 group-hover:opacity-100'
                )}
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => sendMsg(buildWhatsAppMessage(deal, payment, 'profissional'))}>
                🏢 Profissional
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sendMsg(buildWhatsAppMessage(deal, payment, 'amigavel'))}>
                😊 Amigável
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => sendMsg(buildWhatsAppMessage(deal, payment, 'direta'))}>
                ⚡ Direta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          {urgency === 'overdue' ? 'Pagamento vencido! Cobrar agora' :
           urgency === 'urgent' ? 'Vence em breve! Cobrar via WhatsApp' :
           urgency === 'approaching' ? 'Pagamento se aproximando' :
           'Cobrar via WhatsApp'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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
    payment_method: editPayment?.payment_method || 'pix',
    category: editPayment?.category || 'projeto',
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
            <Label>Método de Pagamento</Label>
            <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
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

  // Count urgent payments
  const urgentPayments = payments?.filter(p => {
    const u = getPaymentUrgency(p);
    return u === 'overdue' || u === 'urgent';
  }).length || 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Faturamento - {deal.company_name}
              {urgentPayments > 0 && (
                <Badge variant="destructive" className="animate-pulse text-[10px] ml-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {urgentPayments} {urgentPayments === 1 ? 'vencendo' : 'vencendo'}
                </Badge>
              )}
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
                <p className={cn("text-lg font-bold", urgentPayments > 0 ? "text-destructive animate-pulse" : "text-amber-600")}>
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
                  const urgency = getPaymentUrgency(payment);
                  const daysUntil = differenceInDays(new Date(payment.payment_date), new Date());

                    return (
                      <div
                        key={payment.id}
                        className={cn(
                          "p-2.5 rounded-lg border bg-card group transition-all",
                          urgency === 'overdue' && "border-destructive/50 bg-destructive/5 animate-[pulse_2s_ease-in-out_infinite]",
                          urgency === 'urgent' && "border-amber-400/50 bg-amber-50/50 animate-[pulse_3s_ease-in-out_infinite]",
                          urgency === 'approaching' && "border-yellow-300/50 bg-yellow-50/30"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <StatusIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${statusInfo.className.split(' ')[0]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-sm">
                                R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <Badge variant="outline" className={`text-[10px] ${statusInfo.className}`}>
                                {statusInfo.label}
                              </Badge>
                              {urgency === 'overdue' && (
                                <Badge variant="destructive" className="text-[10px] animate-pulse">
                                  Vencido há {Math.abs(daysUntil)}d
                                </Badge>
                              )}
                              {urgency === 'urgent' && (
                                <Badge className="text-[10px] bg-amber-500 text-white animate-bounce">
                                  {daysUntil === 0 ? 'Vence hoje!' : `Vence em ${daysUntil}d`}
                                </Badge>
                              )}
                              {urgency === 'approaching' && (
                                <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-400">
                                  Em {daysUntil}d
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground mt-1">
                              <span>{format(new Date(payment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                              {payment.payment_method && (
                                <span>· {PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label || payment.payment_method}</span>
                              )}
                              {payment.category && (
                                <span>· {PAYMENT_CATEGORIES.find(c => c.value === payment.category)?.label || payment.category}</span>
                              )}
                              {payment.description && <span className="truncate max-w-[120px] sm:max-w-none">· {payment.description}</span>}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <WhatsAppBillingButton deal={deal} payment={payment} />
                            <button onClick={() => { setEditPayment(payment); setShowForm(true); }} className="p-1 rounded hover:bg-muted sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeletingId(payment.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
