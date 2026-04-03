import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useBriefings, BRIEFING_TYPES, DEFAULT_QUESTIONS, type BriefingQuestion } from '@/hooks/useBriefings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, Search, FileText, Clock, CheckCircle, LayoutGrid, 
  Copy, ExternalLink, Trash2, Eye, ChevronRight, ChevronLeft,
  Send, Link2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  answered: { label: 'Respondido', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground border-border', icon: FileText },
};

export default function Briefings() {
  const { briefings, isLoading, stats, createBriefing, deleteBriefing } = useBriefings();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState(0);

  // Create form state
  const [selectedType, setSelectedType] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [briefingTitle, setBriefingTitle] = useState('');
  const [briefingDesc, setBriefingDesc] = useState('');

  const filtered = briefings.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.client_name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedBriefing = briefings.find(b => b.id === showDetail);

  const resetCreate = () => {
    setSelectedType('');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientCompany('');
    setBriefingTitle('');
    setBriefingDesc('');
    setCreateStep(0);
    setShowCreate(false);
  };

  const handleCreate = async () => {
    if (!clientName || !selectedType) return;
    const typeLabel = BRIEFING_TYPES.find(t => t.value === selectedType)?.label || selectedType;
    await createBriefing.mutateAsync({
      title: briefingTitle || `Briefing ${typeLabel} - ${clientName}`,
      briefing_type: selectedType,
      client_name: clientName,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      client_company: clientCompany || null,
      description: briefingDesc || null,
      status: 'pending',
    });
    resetCreate();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/briefing/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!' });
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: FileText, color: 'text-primary' },
    { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-amber-500' },
    { label: 'Respondidos', value: stats.answered, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Tipos', value: stats.types, icon: LayoutGrid, color: 'text-violet-500' },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 lg:pb-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Briefings</h1>
            <p className="text-sm text-muted-foreground">Colete informações dos seus clientes de forma organizada</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Briefing
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3 bg-card border-border">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar briefings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum briefing encontrado</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro briefing
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((b) => {
              const typeInfo = BRIEFING_TYPES.find(t => t.value === b.briefing_type);
              const status = statusConfig[b.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Card
                  key={b.id}
                  className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border"
                  onClick={() => setShowDetail(b.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: (typeInfo?.color || '#6b7280') + '20' }}
                    >
                      {typeInfo?.icon || '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{b.title}</p>
                        <Badge variant="outline" className={`${status.color} text-xs shrink-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {b.client_name} {b.client_company && `• ${b.client_company}`} • {typeInfo?.label}
                      </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(b.created_at), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); copyLink(b.share_token || ''); }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); deleteBriefing.mutate(b.id); }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={(o) => { if (!o) resetCreate(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {createStep === 0 ? 'Selecione o tipo de briefing' : createStep === 1 ? 'Dados do cliente' : 'Revisão'}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {createStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-2 gap-3 py-2"
              >
                {BRIEFING_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => { setSelectedType(type.value); setCreateStep(1); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                      selectedType === type.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <p className="text-sm font-medium mt-2 text-foreground">{type.label}</p>
                  </button>
                ))}
              </motion.div>
            )}

            {createStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 py-2"
              >
                <div><Label>Nome do cliente *</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome do cliente" /></div>
                <div><Label>Email</Label><Input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="email@exemplo.com" type="email" /></div>
                <div><Label>Telefone</Label><Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="(00) 00000-0000" /></div>
                <div><Label>Empresa</Label><Input value={clientCompany} onChange={e => setClientCompany(e.target.value)} placeholder="Nome da empresa" /></div>
                <div><Label>Título do briefing</Label><Input value={briefingTitle} onChange={e => setBriefingTitle(e.target.value)} placeholder="Opcional - gerado automaticamente" /></div>
                <div><Label>Descrição</Label><Textarea value={briefingDesc} onChange={e => setBriefingDesc(e.target.value)} placeholder="Observações gerais..." rows={3} /></div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreateStep(0)} className="gap-1"><ChevronLeft className="w-4 h-4" />Voltar</Button>
                  <Button className="flex-1 gap-1" disabled={!clientName} onClick={() => setCreateStep(2)}>Revisar<ChevronRight className="w-4 h-4" /></Button>
                </div>
              </motion.div>
            )}

            {createStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 py-2"
              >
                <Card className="p-4 space-y-2 bg-muted/50">
                  <p className="text-sm"><span className="text-muted-foreground">Tipo:</span> <strong>{BRIEFING_TYPES.find(t => t.value === selectedType)?.label}</strong></p>
                  <p className="text-sm"><span className="text-muted-foreground">Cliente:</span> <strong>{clientName}</strong></p>
                  {clientEmail && <p className="text-sm"><span className="text-muted-foreground">Email:</span> {clientEmail}</p>}
                  {clientCompany && <p className="text-sm"><span className="text-muted-foreground">Empresa:</span> {clientCompany}</p>}
                  <p className="text-sm"><span className="text-muted-foreground">Perguntas:</span> {DEFAULT_QUESTIONS[selectedType]?.length || 0} perguntas</p>
                </Card>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCreateStep(1)} className="gap-1"><ChevronLeft className="w-4 h-4" />Voltar</Button>
                  <Button className="flex-1 gap-2" onClick={handleCreate} disabled={createBriefing.isPending}>
                    <Send className="w-4 h-4" />
                    {createBriefing.isPending ? 'Criando...' : 'Criar e gerar link'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBriefing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">{BRIEFING_TYPES.find(t => t.value === selectedBriefing.briefing_type)?.icon}</span>
                  {selectedBriefing.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Info */}
                <Card className="p-4 space-y-2 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={statusConfig[selectedBriefing.status]?.color}>
                      {statusConfig[selectedBriefing.status]?.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(selectedBriefing.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm"><strong>Cliente:</strong> {selectedBriefing.client_name}</p>
                  {selectedBriefing.client_email && <p className="text-sm"><strong>Email:</strong> {selectedBriefing.client_email}</p>}
                  {selectedBriefing.client_phone && <p className="text-sm"><strong>Telefone:</strong> {selectedBriefing.client_phone}</p>}
                  {selectedBriefing.client_company && <p className="text-sm"><strong>Empresa:</strong> {selectedBriefing.client_company}</p>}
                </Card>

                {/* Public link */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">Link público do briefing</p>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/briefing/${selectedBriefing.share_token}`}
                      className="text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={() => copyLink(selectedBriefing.share_token || '')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(`/briefing/${selectedBriefing.share_token}`, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Responses */}
                {selectedBriefing.status === 'answered' && selectedBriefing.responses && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Respostas do cliente
                    </h3>
                    {(selectedBriefing.responses as any[]).map((r: any, i: number) => (
                      <Card key={i} className="p-3">
                        <p className="text-xs text-muted-foreground mb-1">{r.question}</p>
                        <p className="text-sm text-foreground">
                          {Array.isArray(r.answer) ? r.answer.join(', ') : r.answer || '—'}
                        </p>
                      </Card>
                    ))}
                    {selectedBriefing.responded_at && (
                      <p className="text-xs text-muted-foreground text-right">
                        Respondido em {format(new Date(selectedBriefing.responded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}

                {selectedBriefing.status === 'pending' && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aguardando resposta do cliente</p>
                    <p className="text-xs mt-1">Envie o link acima para o cliente preencher</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
