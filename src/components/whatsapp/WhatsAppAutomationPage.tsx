import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus, Trash2, Zap, Clock, MessageSquare, Edit2, Bot,
  CheckCircle2, AlertTriangle, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useWhatsAppAutomations,
  useCreateWhatsAppAutomation,
  useUpdateWhatsAppAutomation,
  useDeleteWhatsAppAutomation,
  TRIGGER_OPTIONS,
  MESSAGE_VARIABLES,
  WhatsAppAutomation,
} from '@/hooks/useWhatsAppAutomations';
import { useToast } from '@/hooks/use-toast';

export function WhatsAppAutomationPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editAutomation, setEditAutomation] = useState<WhatsAppAutomation | null>(null);

  const { data: automations = [], isLoading } = useWhatsAppAutomations();
  const createMutation = useCreateWhatsAppAutomation();
  const updateMutation = useUpdateWhatsAppAutomation();
  const deleteMutation = useDeleteWhatsAppAutomation();
  const { toast } = useToast();

  const activeCount = automations.filter(a => a.is_active).length;

  const handleToggle = (automation: WhatsAppAutomation) => {
    updateMutation.mutate({ id: automation.id, is_active: !automation.is_active });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Automações WhatsApp</h2>
            <p className="text-sm text-muted-foreground">
              Configure respostas automáticas e gatilhos inteligentes
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Nova Automação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{automations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ativas</p>
              <p className="text-lg font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Inativas</p>
              <p className="text-lg font-bold">{automations.length - activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gatilhos</p>
              <p className="text-lg font-bold">{new Set(automations.map(a => a.trigger_type)).size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automations list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : automations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bot className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma automação criada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie automações para enviar mensagens automáticas via WhatsApp quando eventos acontecerem
            </p>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Criar primeira automação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {automations.map(automation => {
            const trigger = TRIGGER_OPTIONS.find(t => t.value === automation.trigger_type);
            return (
              <Card key={automation.id} className={cn(
                'transition-all',
                !automation.is_active && 'opacity-60'
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg flex-shrink-0">
                      {trigger?.icon || '⚡'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{trigger?.label || automation.trigger_type}</h4>
                        <Badge variant={automation.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {automation.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                        {automation.delay_minutes > 0 && (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Clock className="w-2.5 h-2.5" /> {automation.delay_minutes}min
                          </Badge>
                      )}
                      {automation.tag && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          🏷️ {automation.tag}
                        </Badge>
                      )}
                      </div>
                      {automation.description && (
                        <p className="text-xs text-muted-foreground mb-1">{automation.description}</p>
                      )}
                      <div className="bg-muted/50 rounded-lg p-2.5 mt-2">
                        <p className="text-xs font-mono whitespace-pre-wrap">{automation.message_template}</p>
                      </div>
                      {automation.target_phase && (
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          Fase alvo: <span className="font-medium">{automation.target_phase}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={automation.is_active}
                        onCheckedChange={() => handleToggle(automation)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditAutomation(automation)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(automation.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AutomationFormModal
        open={createOpen || !!editAutomation}
        onOpenChange={(open) => {
          if (!open) { setCreateOpen(false); setEditAutomation(null); }
        }}
        automation={editAutomation}
        onSave={(data) => {
          if (editAutomation) {
            updateMutation.mutate({ id: editAutomation.id, ...data }, {
              onSuccess: () => { setEditAutomation(null); toast({ title: 'Automação atualizada!' }); },
            });
          } else {
            createMutation.mutate(data, {
              onSuccess: () => setCreateOpen(false),
            });
          }
        }}
      />
    </div>
  );
}

// ─── Form Modal ───
function AutomationFormModal({
  open, onOpenChange, automation, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  automation: WhatsAppAutomation | null;
  onSave: (data: { trigger_type: string; message_template: string; delay_minutes?: number; target_phase?: string; description?: string; tag?: string }) => void;
}) {
  const [trigger, setTrigger] = useState(automation?.trigger_type || '');
  const [message, setMessage] = useState(automation?.message_template || '');
  const [delay, setDelay] = useState(String(automation?.delay_minutes || 0));
  const [phase, setPhase] = useState(automation?.target_phase || '');
  const [description, setDescription] = useState(automation?.description || '');
  const [tag, setTag] = useState(automation?.tag || '');

  const { toast } = useToast();

  const resetForm = () => {
    setTrigger(automation?.trigger_type || '');
    setMessage(automation?.message_template || '');
    setDelay(String(automation?.delay_minutes || 0));
    setPhase(automation?.target_phase || '');
    setDescription(automation?.description || '');
    setTag(automation?.tag || '');
  };

  const handleSubmit = () => {
    if (!trigger || !message.trim()) return;
    onSave({
      trigger_type: trigger,
      message_template: message.trim(),
      delay_minutes: parseInt(delay) || 0,
      target_phase: phase || undefined,
      description: description.trim() || undefined,
    });
  };

  const insertVariable = (varName: string) => {
    setMessage(prev => prev + varName);
    toast({ title: 'Variável inserida', description: varName });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            {automation ? 'Editar Automação' : 'Nova Automação'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trigger selector */}
          <div>
            <Label>Gatilho *</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {TRIGGER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTrigger(opt.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border text-left transition-all text-sm',
                    trigger === opt.value
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-muted/30 border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <div>
                    <p className="font-medium text-xs">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phase target (only for phase_change trigger) */}
          {trigger === 'phase_change' && (
            <div>
              <Label>Fase alvo</Label>
              <Input
                value={phase}
                onChange={e => setPhase(e.target.value)}
                placeholder="Ex: Aprovado, Em produção..."
              />
            </div>
          )}

          {/* Description */}
          <div>
            <Label>Descrição (opcional)</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Boas-vindas para novos leads"
            />
          </div>

          {/* Message */}
          <div>
            <Label>Mensagem *</Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Olá {{nome}}, tudo bem? 😊&#10;&#10;Recebemos seu contato e vamos..."
              rows={5}
              className="font-mono text-sm"
            />
          </div>

          {/* Variables */}
          <div>
            <Label className="text-xs text-muted-foreground">Variáveis disponíveis</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {MESSAGE_VARIABLES.map(v => (
                <button
                  key={v.var}
                  onClick={() => insertVariable(v.var)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border text-xs hover:bg-accent transition-colors"
                  title={v.desc}
                >
                  <Copy className="w-2.5 h-2.5" />
                  <code>{v.var}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Delay */}
          <div>
            <Label className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Atraso antes do envio (minutos)
            </Label>
            <Input
              type="number"
              min="0"
              value={delay}
              onChange={e => setDelay(e.target.value)}
              placeholder="0"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              0 = enviar imediatamente
            </p>
          </div>

          {/* Preview */}
          {message.trim() && (
            <div>
              <Label className="text-xs text-muted-foreground">Preview da mensagem</Label>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mt-1">
                <p className="text-sm whitespace-pre-wrap">
                  {message
                    .replace(/\{\{nome\}\}/g, 'João Silva')
                    .replace(/\{\{empresa\}\}/g, 'Acme Inc')
                    .replace(/\{\{projeto\}\}/g, 'Site Institucional')
                    .replace(/\{\{etapa\}\}/g, 'Em produção')
                    .replace(/\{\{valor\}\}/g, 'R$ 2.500,00')
                    .replace(/\{\{data\}\}/g, new Date().toLocaleDateString('pt-BR'))
                  }
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full gap-2"
            onClick={handleSubmit}
            disabled={!trigger || !message.trim()}
          >
            <Zap className="w-4 h-4" />
            {automation ? 'Salvar Alterações' : 'Criar Automação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
