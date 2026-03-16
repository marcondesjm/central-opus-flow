import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  FileText,
  Download,
  Share2,
  Eye,
  Trash2,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Send,
  Pencil,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

import { ProposalForm } from '@/components/proposals/ProposalForm';
import { ProposalPreview } from '@/components/proposals/ProposalPreview';
import {
  useProposals,
  useCreateProposal,
  useUpdateProposal,
  useDeleteProposal,
  type Proposal,
} from '@/hooks/useProposals';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Enviada', color: 'bg-blue-500/10 text-blue-600' },
  viewed: { label: 'Visualizada', color: 'bg-amber-500/10 text-amber-600' },
  accepted: { label: 'Aceita', color: 'bg-emerald-500/10 text-emerald-600' },
  rejected: { label: 'Rejeitada', color: 'bg-rose-500/10 text-rose-600' },
};

export default function Proposals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: proposals = [], isLoading } = useProposals();
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();

  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [currentProposal, setCurrentProposal] = useState<Partial<Proposal>>({
    proposal_title: 'Proposta Comercial',
    brand_color: '#3b82f6',
    brand_secondary_color: '#1e293b',
    services: [],
    discount: 0,
    deadline_days: 30,
    validity_days: 15,
    status: 'draft',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!currentProposal.client_name?.trim()) {
      toast({ title: 'Preencha o nome do cliente', variant: 'destructive' });
      return;
    }
    try {
      if (selectedId) {
        await updateProposal.mutateAsync({ id: selectedId, ...currentProposal } as any);
        toast({ title: 'Proposta atualizada!' });
      } else {
        const result = await createProposal.mutateAsync(currentProposal);
        setSelectedId(result.id);
        toast({ title: 'Proposta criada!' });
      }
      setMode('list');
      resetForm();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateProposal.mutateAsync({ id, status: 'sent' });
      toast({ title: 'Proposta publicada e pronta para compartilhar!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProposal.mutateAsync(id);
      toast({ title: 'Proposta excluída!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleEdit = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setSelectedId(proposal.id);
    setMode('edit');
  };

  const handlePreview = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setSelectedId(proposal.id);
    setPreviewOpen(true);
  };

  const resetForm = () => {
    setCurrentProposal({
      proposal_title: 'Proposta Comercial',
      brand_color: '#3b82f6',
      brand_secondary_color: '#1e293b',
      services: [],
      discount: 0,
      deadline_days: 30,
      validity_days: 15,
      status: 'draft',
    });
    setSelectedId(null);
  };

  const createExampleProposal = async () => {
    const example: Partial<Proposal> = {
      proposal_title: 'Desenvolvimento de Landing Page',
      client_name: 'Maria Silva',
      client_email: 'maria@empresaexemplo.com.br',
      client_phone: '5548999887766',
      client_company: 'Empresa Exemplo LTDA',
      company_name: 'Central Opus Flow',
      company_email: 'contato@centralopus.com',
      company_phone: '(48) 99602-9392',
      company_address: 'Florianópolis, SC',
      brand_color: '#6366f1',
      brand_secondary_color: '#1e1b4b',
      description: 'Desenvolvimento de uma landing page moderna e responsiva para captação de leads, com design personalizado, integração com formulários e otimização para SEO.',
      services: [
        { name: 'Design UI/UX', description: 'Criação de layout responsivo e wireframes', quantity: 1, unit_price: 2500 },
        { name: 'Desenvolvimento Front-end', description: 'Codificação em React + Tailwind CSS', quantity: 1, unit_price: 3500 },
        { name: 'Integração de Formulários', description: 'Setup de captura de leads e automação', quantity: 1, unit_price: 800 },
        { name: 'Otimização SEO', description: 'Meta tags, performance e acessibilidade', quantity: 1, unit_price: 700 },
      ],
      total_value: 7500,
      discount: 500,
      deadline_days: 21,
      validity_days: 10,
      payment_conditions: '50% na aprovação do projeto\n50% na entrega final\n\nFormas aceitas: PIX, transferência bancária ou cartão de crédito.',
      notes: '• O prazo começa a contar após a aprovação do briefing.\n• Inclui até 2 rodadas de revisão no design.\n• Hospedagem e domínio não estão inclusos.\n• Suporte técnico gratuito por 30 dias após a entrega.',
      status: 'draft',
    };
    try {
      await createProposal.mutateAsync(example);
      toast({ title: 'Proposta de exemplo criada!', description: 'Você pode editá-la como quiser.' });
    } catch (err: any) {
      toast({ title: 'Erro ao criar exemplo', description: err.message, variant: 'destructive' });
    }
  };

  const sendWhatsApp = (proposal: Partial<Proposal>) => {
    const phone = proposal.client_phone?.replace(/\D/g, '');
    if (!phone) {
      toast({ title: 'Cliente sem WhatsApp', description: 'Adicione o telefone do cliente na proposta.', variant: 'destructive' });
      return;
    }
    const total = (proposal.services || []).reduce((sum, s) => sum + s.quantity * s.unit_price, 0) - (proposal.discount || 0);
    const shareUrl = proposal.share_token && proposal.status !== 'draft'
      ? `${window.location.origin}/proposal/${proposal.share_token}`
      : null;
    const message = [
      `Olá ${proposal.client_name}! 👋`,
      '',
      `Segue a proposta *${proposal.proposal_title}* no valor de *R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*.`,
      '',
      proposal.deadline_days ? `⏰ Prazo de entrega: *${proposal.deadline_days} dias*` : '',
      proposal.validity_days ? `📅 Validade: *${proposal.validity_days} dias*` : '',
      '',
      shareUrl ? `📄 Visualize a proposta completa:\n${shareUrl}` : '',
      '',
      'Fico no aguardo do seu retorno! 🤝',
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/proposal/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: 'Link copiado!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPDF = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`proposta-${currentProposal.client_name || 'cliente'}.pdf`);
      toast({ title: 'PDF exportado com sucesso!' });
    } catch (err) {
      toast({ title: 'Erro ao exportar PDF', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="min-h-screen bg-background">
      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => { setMode('list'); resetForm(); }}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">{mode === 'edit' ? 'Editar Proposta' : 'Nova Proposta'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Visualizar</span>
              </Button>
              <Button onClick={handleSave} disabled={createProposal.isPending || updateProposal.isPending}>
                {(createProposal.isPending || updateProposal.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Salvar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="order-2 lg:order-1">
              <ProposalForm proposal={currentProposal} onChange={setCurrentProposal} />
            </div>
            <div className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">PREVIEW</span>
                  <Button size="sm" variant="ghost" onClick={() => setPreviewOpen(true)}>
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Expandir
                  </Button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  <div className="transform scale-[0.5] origin-top-left w-[200%]">
                    <ProposalPreview proposal={currentProposal} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Preview da Proposta
                <Button size="sm" onClick={exportPDF} disabled={exporting}>
                  {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Exportar PDF
                </Button>
              </DialogTitle>
            </DialogHeader>
            <ProposalPreview ref={previewRef} proposal={currentProposal} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Propostas Comerciais</h1>
              <p className="text-sm text-muted-foreground">Crie e gerencie suas propostas com identidade visual</p>
            </div>
          </div>
          <Button onClick={() => setMode('create')}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : proposals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma proposta criada</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Crie propostas profissionais com sua identidade visual, logo do cliente e exporte em PDF ou compartilhe via link.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Button onClick={() => setMode('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Proposta
                </Button>
                <Button variant="outline" onClick={createExampleProposal} disabled={createProposal.isPending}>
                  {createProposal.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Ver Exemplo Preenchido
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((proposal) => {
              const status = statusMap[proposal.status] || statusMap.draft;
              const total = (proposal.services || []).reduce(
                (sum, s) => sum + s.quantity * s.unit_price, 0
              ) - (proposal.discount || 0);

              return (
                <Card key={proposal.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
                  {/* Color bar */}
                  <div className="h-1.5" style={{ backgroundColor: proposal.brand_color }} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {proposal.client_logo_url ? (
                          <img
                            src={proposal.client_logo_url}
                            alt=""
                            className="w-10 h-10 rounded-lg object-contain border border-border p-0.5 flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold"
                            style={{ backgroundColor: proposal.brand_color }}
                          >
                            {(proposal.client_name || 'C').charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{proposal.client_name}</p>
                          {proposal.client_company && (
                            <p className="text-xs text-muted-foreground truncate">{proposal.client_company}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px] flex-shrink-0', status.color)}>
                        {status.label}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium truncate mb-1">{proposal.proposal_title}</p>
                    <p className="text-lg font-bold" style={{ color: proposal.brand_color }}>
                      R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
                      <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs" onClick={() => handlePreview(proposal)}>
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs" onClick={() => handleEdit(proposal)}>
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                      {proposal.status === 'draft' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-8 text-xs text-blue-600"
                          onClick={() => handlePublish(proposal.id)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Publicar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-8 text-xs"
                          onClick={() => copyShareLink(proposal.share_token!)}
                        >
                          {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          Link
                        </Button>
                      )}
                      {proposal.client_phone && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-600"
                          onClick={() => sendWhatsApp(proposal)}
                          title="Enviar via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(proposal.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Dialog for list mode */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Preview da Proposta
              <div className="flex items-center gap-2">
                {currentProposal.status !== 'draft' && currentProposal.share_token && (
                  <Button size="sm" variant="outline" onClick={() => copyShareLink(currentProposal.share_token!)}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                    Copiar Link
                  </Button>
                )}
                <Button size="sm" onClick={exportPDF} disabled={exporting}>
                  {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ProposalPreview ref={previewRef} proposal={currentProposal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
