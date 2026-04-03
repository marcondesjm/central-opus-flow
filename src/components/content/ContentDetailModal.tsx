import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type ContentItem, ALL_CONTENT_TYPES, useUpdateContentItem } from '@/hooks/useContentItems';
import { useCreateContentApproval, useContentApprovals } from '@/hooks/useContentApprovals';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, FolderOpen, ExternalLink, CheckCircle2, Circle, Send, Copy, Check, Loader2, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentItem;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho', scheduled: 'Agendado', published: 'Publicado', approved: 'Aprovado', rejected: 'Rejeitado',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/20 text-blue-600',
  published: 'bg-green-500/20 text-green-600',
  approved: 'bg-emerald-500/20 text-emerald-600',
  rejected: 'bg-red-500/20 text-red-600',
};

export function ContentDetailModal({ open, onOpenChange, item }: Props) {
  const typeInfo = ALL_CONTENT_TYPES.find(t => t.value === item.content_type);
  const { user } = useAuth();
  const createApproval = useCreateContentApproval();
  const { data: approvals } = useContentApprovals();
  const { data: clients } = useClients();
  const { toast } = useToast();
  const [status, setStatus] = useState(item.status);
  const [copied, setCopied] = useState(false);

  // Find existing approval for this content item
  const existingApproval = approvals?.find((a: any) => a.content_item_id === item.id);
  const approvalLink = existingApproval?.share_token
    ? `${window.location.origin}/aprovacao/${(existingApproval as any).share_token}`
    : null;

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateMutation.mutate({ id: item.id, status: newStatus });
  };

  const handleSendApproval = () => {
    const clientName = item.financial_clients?.name || 'Cliente';
    const contentText = item.description || item.title || 'Conteúdo sem descrição';
    createApproval.mutate({
      client_name: clientName,
      content: contentText,
      client_id: item.client_id || undefined,
      content_item_id: item.id,
    });
  };

  const handleCopyLink = () => {
    if (approvalLink) {
      navigator.clipboard.writeText(approvalLink);
      setCopied(true);
      toast({ title: 'Link copiado!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChecklistToggle = (idx: number) => {
    const updated = item.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c);
    updateMutation.mutate({ id: item.id, checklist: updated });
  };

  const checkDone = item.checklist.filter(c => c.done).length;
  const checkTotal = item.checklist.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0 bg-card border-border">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-xl">
            {typeInfo?.icon || '📄'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">{item.title || 'Sem título'}</h2>
            <p className="text-xs text-muted-foreground">{typeInfo?.label} · Criado em {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main content */}
          <div className="flex-1 p-6 space-y-5">
            {/* Media */}
            {item.media_urls.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">MÍDIA</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {item.media_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border border-border hover:ring-2 hover:ring-primary transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {item.cover_url && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">CAPA</p>
                <img src={item.cover_url} alt="Capa" className="w-32 h-32 object-cover rounded-lg border border-border" />
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">DESCRIÇÃO / LEGENDA</p>
                <div className="p-3 rounded-lg bg-accent/50 text-sm text-foreground whitespace-pre-wrap">{item.description}</div>
              </div>
            )}

            {/* Briefing */}
            {item.briefing && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">BRIEFING / REFERÊNCIAS</p>
                <div className="p-3 rounded-lg bg-accent/50 text-sm text-foreground whitespace-pre-wrap">{item.briefing}</div>
              </div>
            )}

            {/* Video link */}
            {item.video_link && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">LINK DO VÍDEO</p>
                <a href={item.video_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  {item.video_link} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Platforms */}
            {item.platforms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">PLATAFORMAS</p>
                <div className="flex gap-2 flex-wrap">
                  {item.platforms.map(p => (
                    <span key={p} className="px-3 py-1 text-xs rounded-full border border-primary/30 text-primary bg-primary/10">{p}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            {checkTotal > 0 && (
              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Checklist</p>
                  <span className="text-xs text-muted-foreground">{checkDone}/{checkTotal}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-3">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${checkTotal > 0 ? (checkDone / checkTotal) * 100 : 0}%` }} />
                </div>
                <div className="space-y-2">
                  {item.checklist.map((c, i) => (
                    <button key={c.id} onClick={() => handleChecklistToggle(i)} className="w-full flex items-center gap-2 text-left hover:bg-accent/50 rounded-lg p-1.5 transition-colors">
                      {c.done ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                      <span className={`text-sm ${c.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{c.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">📝 NOTAS INTERNAS</p>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-foreground whitespace-pre-wrap">{item.notes}</div>
              </div>
            )}
          </div>

          {/* Right info panel */}
          <div className="w-full lg:w-56 border-t lg:border-t-0 lg:border-l border-border p-5 space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Prioridade</p>
              <Badge variant="outline" className="text-xs">
                {{ urgent: '🔴 Urgente', high: '🟠 Alta', normal: '🔵 Normal', low: '🟢 Baixa' }[item.priority] || item.priority}
              </Badge>
            </div>

            {item.category && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Categoria</p>
                <p className="font-medium">{item.category}</p>
              </div>
            )}

            {item.content_subtype && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                <p className="font-medium">{item.content_subtype}</p>
              </div>
            )}

            {item.due_date && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Data de Entrega</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(item.due_date), 'dd/MM/yyyy')}
                  {item.due_time && ` · ${item.due_time}`}
                </p>
              </div>
            )}

            {item.scheduled_at && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Data de Publicação</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(item.scheduled_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            )}

            {item.financial_clients && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="font-medium flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.financial_clients.name}</p>
              </div>
            )}

            {item.projects && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Projeto</p>
                <p className="font-medium flex items-center gap-1"><FolderOpen className="w-3.5 h-3.5" /> {item.projects.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Approval section */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3">APROVAÇÃO DO CLIENTE</p>
          {existingApproval ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={
                  existingApproval.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600' :
                  existingApproval.status === 'rejected' ? 'bg-red-500/20 text-red-600' :
                  'bg-amber-500/20 text-amber-600'
                }>
                  {existingApproval.status === 'approved' ? '✅ Aprovado' : existingApproval.status === 'rejected' ? '❌ Rejeitado' : '⏳ Aguardando aprovação'}
                </Badge>
                {existingApproval.rejection_reason && (
                  <span className="text-xs text-muted-foreground">Motivo: {existingApproval.rejection_reason}</span>
                )}
              </div>
              {approvalLink && (
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2 text-xs">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado!' : 'Copiar link de aprovação'}
                </Button>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleSendApproval} disabled={createApproval.isPending} className="gap-2">
              {createApproval.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar para aprovação do cliente
            </Button>
          )}
        </div>

        <div className="flex justify-end px-6 py-3 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
