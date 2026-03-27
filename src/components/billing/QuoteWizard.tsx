import { useState, useMemo } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Plus, Minus, Trash2,
  Loader2, Share2, FileText, Clock, CreditCard, Repeat, Calendar,
  Package, ChevronRight, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useFinancialClients, useCreateClient, useFinancialServices, formatBRL } from '@/hooks/useFinancial';
import { useCreateQuote, QuoteItem } from '@/hooks/useFinancialQuotes';
import { useToast } from '@/hooks/use-toast';
import { usePortfolioPage } from '@/hooks/usePortfolio';

const STEPS = [
  { label: 'Informações Básicas', desc: 'Escolha o cliente e defina o título do orçamento' },
  { label: 'Selecione os Serviços', desc: 'Adicione os serviços que serão prestados' },
  { label: 'Condições de Pagamento', desc: 'Defina forma de pagamento e prazos' },
  { label: 'Revisão Final', desc: 'Revise todas as informações antes de enviar' },
];

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto Bancário' },
  { value: 'cartao', label: 'Cartão de Crédito' },
  { value: 'transferencia', label: 'Transferência Bancária' },
  { value: 'parcelado', label: 'Parcelado' },
];

const PAYMENT_CONDITIONS = [
  { value: 'avista', label: 'À Vista' },
  { value: '7dias', label: '7 dias' },
  { value: '15dias', label: '15 dias' },
  { value: '30dias', label: '30 dias' },
  { value: '2x', label: '2x sem juros' },
  { value: '3x', label: '3x sem juros' },
  { value: 'personalizado', label: 'Personalizado' },
];

interface QuoteWizardProps {
  onClose: () => void;
  onCreated?: (shareToken: string) => void;
}

export function QuoteWizard({ onClose, onCreated }: QuoteWizardProps) {
  const { data: clients } = useFinancialClients();
  const { data: services } = useFinancialServices();
  const { data: portfolioPage } = usePortfolioPage();
  const createClient = useCreateClient();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  // Step 1
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validityDays, setValidityDays] = useState(30);

  // Step 2
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showNewServiceInline, setShowNewServiceInline] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({ name: '', description: '', price: 0 });

  // Step 3
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState(12);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentConditions, setPaymentConditions] = useState('');
  const [projectStartType, setProjectStartType] = useState('days_after_approval');
  const [projectStartDays, setProjectStartDays] = useState(3);
  const [deliveryDays, setDeliveryDays] = useState(30);
  const [proposalValidityDays, setProposalValidityDays] = useState(30);
  const [firstPaymentType, setFirstPaymentType] = useState('days_after_signature');
  const [firstPaymentDays, setFirstPaymentDays] = useState(30);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.total, 0), [items]);
  const total = useMemo(() => {
    if (isRecurring && recurringMonths > 0) {
      return (subtotal - discount);
    }
    return subtotal - discount;
  }, [subtotal, discount, isRecurring, recurringMonths]);
  const recurringTotal = isRecurring && recurringMonths ? total * recurringMonths : total;

  const addService = (svcId: string) => {
    const svc = services?.find(s => s.id === svcId);
    if (!svc) return;
    setItems(prev => [...prev, {
      name: svc.name,
      description: svc.description || '',
      quantity: 1,
      unit_price: Number(svc.default_price),
      total: Number(svc.default_price),
    }]);
  };

  const addCustomService = () => {
    if (!newServiceForm.name.trim() || newServiceForm.price <= 0) return;
    setItems(prev => [...prev, {
      name: newServiceForm.name.trim(),
      description: newServiceForm.description,
      quantity: 1,
      unit_price: newServiceForm.price,
      total: newServiceForm.price,
    }]);
    setNewServiceForm({ name: '', description: '', price: 0 });
    setShowNewServiceInline(false);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        updated.total = updated.quantity * updated.unit_price;
      }
      return updated;
    }));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const selectedClient = clients?.find(c => c.id === clientId);

  const canProceed = () => {
    if (step === 0) return !!title.trim() && (!!clientId || (showNewClient && !!newClientName.trim()));
    if (step === 1) return items.length > 0;
    if (step === 2) return true;
    return true;
  };

  const handleCreate = async () => {
    let cId = clientId || null;
    if (showNewClient && newClientName.trim()) {
      const r = await createClient.mutateAsync({ name: newClientName.trim() });
      cId = r.id;
    }

    createQuote.mutate({
      client_id: cId,
      title,
      description: description || null,
      validity_days: validityDays,
      items: items as any,
      subtotal,
      discount,
      total,
      is_recurring: isRecurring,
      recurring_months: isRecurring ? recurringMonths : null,
      payment_method: paymentMethod || null,
      payment_conditions: paymentConditions || null,
      project_start_type: projectStartType,
      project_start_days: projectStartType === 'days_after_approval' ? projectStartDays : null,
      delivery_days: deliveryDays,
      proposal_validity_days: proposalValidityDays,
      first_payment_type: firstPaymentType,
      first_payment_days: firstPaymentType === 'days_after_signature' ? firstPaymentDays : null,
      status: 'sent',
    } as any, {
      onSuccess: (data: any) => {
        const token = data?.share_token;
        if (token && onCreated) onCreated(token);
        else onClose();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Novo Orçamento</h1>
        <p className="text-sm text-muted-foreground">Crie um orçamento profissional para enviar ao cliente</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
              i < step ? 'bg-pink-500 text-white' : i === step ? 'bg-pink-500 text-white ring-4 ring-pink-500/20' : 'bg-muted text-muted-foreground'
            )}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('w-12 h-0.5', i < step ? 'bg-pink-500' : 'bg-muted')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {/* ═══ STEP 1: Info ═══ */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Informações Básicas</h3>
                <p className="text-sm text-muted-foreground">{STEPS[0].desc}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Cliente *</Label>
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setShowNewClient(!showNewClient)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                {showNewClient ? (
                  <Input placeholder="Nome do novo cliente..." value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                ) : (
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
                    <SelectContent>
                      {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label>Título do Orçamento *</Label>
                <Input placeholder="Ex: Identidade Visual Completa" value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea placeholder="Descreva os detalhes do projeto..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>

              <div>
                <Label>Validade (dias)</Label>
                <Input type="number" min={1} value={validityDays} onChange={e => setValidityDays(parseInt(e.target.value) || 30)} />
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Services ═══ */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Selecione os Serviços</h3>
                <p className="text-sm text-muted-foreground">{STEPS[1].desc}</p>
              </div>

              <div className="flex items-center gap-2">
                <Select onValueChange={addService}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar serviço..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} — {formatBRL(Number(s.default_price))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowNewServiceInline(!showNewServiceInline)}>
                  <Plus className="w-3.5 h-3.5" /> Novo
                </Button>
              </div>

              {showNewServiceInline && (
                <Card className="border-pink-500/30">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold">Adicionar serviço personalizado</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nome *</Label>
                        <Input placeholder="Ex: Consultoria" value={newServiceForm.name} onChange={e => setNewServiceForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <Label className="text-xs">Preço unitário (R$) *</Label>
                        <Input type="number" min={0} step={0.01} placeholder="0,00" value={newServiceForm.price || ''} onChange={e => setNewServiceForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Descrição</Label>
                      <Input placeholder="Descrição opcional..." value={newServiceForm.description} onChange={e => setNewServiceForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowNewServiceInline(false)}>Cancelar</Button>
                      <Button size="sm" className="flex-1 bg-pink-500 hover:bg-pink-600 text-white" onClick={addCustomService} disabled={!newServiceForm.name.trim() || newServiceForm.price <= 0}>Adicionar</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <Card key={idx} className="bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{idx + 1}. {item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => removeItem(idx)}>
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">Qtd:</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="w-16 h-7 text-center" />
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateItem(idx, 'quantity', item.quantity + 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                          <span className="text-muted-foreground ml-2">Valor unit.:</span>
                          <span className="text-muted-foreground">R$</span>
                          <Input type="number" min={0} step={0.01} value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)} className="w-28 h-7" />
                          <span className="ml-auto font-semibold text-pink-500">= {formatBRL(item.total)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Discount + totals */}
                  <div>
                    <Label>Desconto (R$)</Label>
                    <Input type="number" min={0} step={0.01} value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>{formatBRL(subtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Desconto:</span><span className="text-rose-500">- {formatBRL(discount)}</span></div>}
                    <div className="flex justify-between pt-1 border-t font-bold text-lg">
                      <span>Total:</span><span className="text-pink-500">{formatBRL(total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed rounded-lg py-12 text-center">
                  <Package className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum serviço adicionado</p>
                  <p className="text-xs text-muted-foreground">Use o campo acima para buscar e adicionar serviços</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 3: Payment ═══ */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Condições de Pagamento</h3>
                <p className="text-sm text-muted-foreground">{STEPS[2].desc}</p>
              </div>

              {/* Recurring toggle */}
              <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/30">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-pink-500" />
                    <div>
                      <p className="font-semibold text-sm">Recorrente / Mensalidade</p>
                      <p className="text-xs text-muted-foreground">Ative para cobranças mensais recorrentes</p>
                    </div>
                  </div>
                  <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                </CardContent>
              </Card>

              {isRecurring ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1"><Repeat className="w-3.5 h-3.5" /> Quantidade de meses *</Label>
                    <Input type="number" min={1} value={recurringMonths} onChange={e => setRecurringMonths(parseInt(e.target.value) || 1)} />
                    <p className="text-xs text-muted-foreground mt-1">{recurringMonths} lançamentos · Total: {formatBRL(recurringTotal)}</p>
                  </div>
                  <div>
                    <Label className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Primeiro Vencimento</Label>
                    <RadioGroup value={firstPaymentType} onValueChange={setFirstPaymentType} className="mt-2 space-y-1">
                      <div className="flex items-center gap-2"><RadioGroupItem value="days_after_signature" id="fp1" /><Label htmlFor="fp1" className="text-sm">X dias após assinatura</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="specific_date" id="fp2" /><Label htmlFor="fp2" className="text-sm">Data específica</Label></div>
                    </RadioGroup>
                    {firstPaymentType === 'days_after_signature' && (
                      <>
                        <Input type="number" min={1} value={firstPaymentDays} onChange={e => setFirstPaymentDays(parseInt(e.target.value) || 30)} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">1º vencimento {firstPaymentDays} dias após aprovação</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Forma de Pagamento *</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Condições de Pagamento *</Label>
                    <Select value={paymentConditions} onValueChange={setPaymentConditions}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Project start, delivery, validity */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Início do Projeto</p>
                    <RadioGroup value={projectStartType} onValueChange={setProjectStartType} className="space-y-1">
                      <div className="flex items-center gap-2"><RadioGroupItem value="days_after_approval" id="ps1" /><Label htmlFor="ps1" className="text-xs">Dias após aprovação</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="specific_date" id="ps2" /><Label htmlFor="ps2" className="text-xs">Data específica</Label></div>
                    </RadioGroup>
                    {projectStartType === 'days_after_approval' && (
                      <>
                        <Input type="number" min={1} value={projectStartDays} onChange={e => setProjectStartDays(parseInt(e.target.value) || 3)} className="h-8" />
                        <p className="text-[10px] text-muted-foreground">Início do projeto após aprovação</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Prazo de Entrega</p>
                    <Input type="number" min={1} value={deliveryDays} onChange={e => setDeliveryDays(parseInt(e.target.value) || 30)} placeholder="Ex: 30 dias corridos" className="h-8" />
                    <p className="text-[10px] text-muted-foreground">Prazo estimado para conclusão</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold text-sm flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Validade da Proposta (dias)</p>
                    <Input type="number" min={1} value={proposalValidityDays} onChange={e => setProposalValidityDays(parseInt(e.target.value) || 30)} className="h-8" />
                    <p className="text-[10px] text-muted-foreground">Tempo que o cliente tem para aprovar</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Review ═══ */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">Revisão Final</h3>
                <p className="text-sm text-muted-foreground">Revise todas as informações antes de enviar</p>
              </div>

              {/* Client info */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm flex items-center gap-1 mb-2"><FileText className="w-3.5 h-3.5" /> Informações do Cliente</p>
                  <p className="font-bold">{showNewClient ? newClientName : selectedClient?.name || '—'}</p>
                  {selectedClient?.email && <p className="text-sm text-primary">{selectedClient.email}</p>}
                  {selectedClient?.company && <p className="text-sm text-muted-foreground">{selectedClient.company}</p>}
                </CardContent>
              </Card>

              {/* Quote details */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm flex items-center gap-1 mb-2"><FileText className="w-3.5 h-3.5" /> Detalhes da Proposta</p>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-muted-foreground">Título:</span><p className="font-medium">{title}</p></div>
                    {description && <div><span className="text-muted-foreground">Descrição:</span><p>{description}</p></div>}
                    <div><span className="text-muted-foreground">Validade:</span><p>📅 {validityDays} dias</p></div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial summary */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm flex items-center gap-1 mb-2"><CreditCard className="w-3.5 h-3.5" /> Resumo Financeiro</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Desconto</span><span className="text-rose-500">-{formatBRL(discount)}</span></div>}
                    <div className="flex justify-between pt-2 border-t font-bold text-lg"><span>Total</span><span className="text-pink-500">{formatBRL(isRecurring ? recurringTotal : total)}</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment conditions */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm flex items-center gap-1 mb-2"><CreditCard className="w-3.5 h-3.5" /> Condições de Pagamento</p>
                  <div className="space-y-1 text-sm">
                    {paymentMethod && (
                      <div><span className="text-muted-foreground">Forma de Pagamento</span><p className="font-medium">{PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label}</p></div>
                    )}
                    {paymentConditions && (
                      <div><span className="text-muted-foreground">Condições</span><p className="font-medium">{PAYMENT_CONDITIONS.find(c => c.value === paymentConditions)?.label}</p></div>
                    )}
                    {isRecurring && <div><span className="text-muted-foreground">Recorrente:</span><p>{recurringMonths} meses · {formatBRL(total)}/mês</p></div>}
                    <div><span className="text-muted-foreground">Início do Projeto</span><p>📅 {projectStartDays} dias após aprovação</p></div>
                    <div><span className="text-muted-foreground">Prazo de Entrega</span><p>⏱ {deliveryDays}</p></div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio link */}
              <Button variant="outline" className="w-full gap-2 text-muted-foreground">
                <ExternalLink className="w-4 h-4" /> Ver meu portfólio completo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={step === 0 ? onClose : () => setStep(s => s - 1)} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
            className="gap-1.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
            Próximo <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={createQuote.isPending}
            className="gap-1.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
            {createQuote.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <Share2 className="w-4 h-4" /> Criar e Compartilhar
          </Button>
        )}
      </div>
    </div>
  );
}
