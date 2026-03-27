import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Pencil, Trash2, Loader2, LayoutGrid, List,
  ShoppingCart, FileText, Eye, EyeOff, Repeat, X, Share2, Copy, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  useFinancialServices, useFinancialCategories,
  formatBRL,
} from '@/hooks/useFinancial';
import { useCreateServiceFull, useUpdateServiceFull, useDeleteServiceFull } from '@/hooks/useFinancialServices';

const SERVICE_SUGGESTIONS = [
  { group: 'Para Designers e Freelancers', items: [
    { name: 'Logo Design', description: 'Criação de identidade visual completa', price: 1500, is_recurring: false },
    { name: 'Social Media Pack', description: 'Pacote mensal de posts para redes sociais', price: 800, is_recurring: true, recurring_period: 'mensal' },
    { name: 'Landing Page', description: 'Design de página de vendas', price: 2500, is_recurring: false },
    { name: 'UI/UX Design', description: 'Interface completa para aplicativo ou sistema', price: 3500, is_recurring: false },
    { name: 'Branding Completo', description: 'Manual de marca, logo, aplicações', price: 5000, is_recurring: false },
  ]},
  { group: 'Para Gestores de Tráfego e Editores', items: [
    { name: 'Gestão de Tráfego Pago', description: 'Gerenciamento mensal de campanhas', price: 1500, is_recurring: true, recurring_period: 'mensal' },
    { name: 'Setup de Campanhas', description: 'Configuração inicial de campanhas', price: 800, is_recurring: false },
    { name: 'Consultoria de Estratégia', description: 'Planejamento estratégico de marketing', price: 1200, is_recurring: false },
    { name: 'Otimização de Conversão', description: 'Análise e otimização de funil de vendas', price: 2000, is_recurring: false },
    { name: 'Relatórios e Análises', description: 'Relatório mensal detalhado de resultados', price: 600, is_recurring: true, recurring_period: 'mensal' },
  ]},
];

interface ServiceForm {
  name: string;
  description: string;
  default_price: number;
  category_id: string;
  is_recurring: boolean;
  recurring_period: string;
  show_public: boolean;
  show_leads_form: boolean;
}

const emptyForm: ServiceForm = {
  name: '', description: '', default_price: 0, category_id: '',
  is_recurring: false, recurring_period: 'mensal',
  show_public: true, show_leads_form: true,
};

export function ServicesManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: services, isLoading } = useFinancialServices();
  const { data: categories } = useFinancialCategories();
  const createService = useCreateServiceFull();
  const updateService = useUpdateServiceFull();
  const deleteService = useDeleteServiceFull();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [activeTab, setActiveTab] = useState('servicos');
  const [showQuoteWizard, setShowQuoteWizard] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Auto-open quote wizard from URL param
  useEffect(() => {
    if (searchParams.get('action') === 'quote') {
      setShowQuoteWizard(true);
      // Clean up the param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  const filtered = (services || []).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.name.trim() || form.default_price <= 0) return;
    createService.mutate({
      name: form.name, description: form.description || null,
      default_price: form.default_price,
      category_id: form.category_id || null,
      is_recurring: form.is_recurring,
      recurring_period: form.is_recurring ? form.recurring_period : null,
      show_public: form.show_public,
      show_leads_form: form.show_leads_form,
    }, {
      onSuccess: () => { setShowCreate(false); setForm(emptyForm); setEditingId(null); },
    });
  };

  const handleUpdate = () => {
    if (!editingId || !form.name.trim()) return;
    updateService.mutate({
      id: editingId, name: form.name, description: form.description || null,
      default_price: form.default_price,
      category_id: form.category_id || null,
      is_recurring: form.is_recurring,
      recurring_period: form.is_recurring ? form.recurring_period : null,
      show_public: form.show_public,
      show_leads_form: form.show_leads_form,
    }, {
      onSuccess: () => { setShowCreate(false); setForm(emptyForm); setEditingId(null); },
    });
  };

  const openEdit = (svc: any) => {
    setForm({
      name: svc.name, description: svc.description || '',
      default_price: Number(svc.default_price),
      category_id: svc.category_id || '',
      is_recurring: svc.is_recurring || false,
      recurring_period: svc.recurring_period || 'mensal',
      show_public: svc.show_public ?? true,
      show_leads_form: svc.show_leads_form ?? true,
    });
    setEditingId(svc.id);
    setShowCreate(true);
  };

  const openFromSuggestion = (s: any) => {
    setForm({
      ...emptyForm,
      name: s.name, description: s.description,
      default_price: s.price,
      is_recurring: s.is_recurring || false,
      recurring_period: s.recurring_period || 'mensal',
    });
    setShowSuggestions(false);
    setShowCreate(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este serviço?')) deleteService.mutate(id);
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return null;
    return categories?.find(c => c.id === catId)?.name || null;
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Meus Serviços</h2>
        <p className="text-sm text-muted-foreground">Gerencie seu catálogo de serviços e preços</p>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="servicos" className="gap-1.5"><Eye className="w-3.5 h-3.5" /> Serviços</TabsTrigger>
          <TabsTrigger value="checkout" className="gap-1.5"><ShoppingCart className="w-3.5 h-3.5" /> Checkout</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="mt-4 space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
              <FileText className="w-3.5 h-3.5" /> Gerenciar Categorias
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-pink-500/50 text-pink-500 hover:bg-pink-500/10" onClick={() => setShowQuoteWizard(true)}>
              <FileText className="w-3.5 h-3.5" /> Novo Orçamento
            </Button>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white" onClick={() => {
              setForm(emptyForm); setEditingId(null); setShowSuggestions(true);
            }}>
              <Plus className="w-3.5 h-3.5" /> Novo Serviço
            </Button>
          </div>

          {/* Search + View Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome, descrição ou categoria..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Services Grid/List */}
          {filtered.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(svc => {
                  const catName = getCategoryName(svc.category_id);
                  return (
                    <Card key={svc.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-base">{svc.name}</h3>
                            <p className="text-sm text-muted-foreground">{svc.description || 'Sem descrição'}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-pink-500 text-pink-500">
                            {svc.status === 'active' ? 'Status' : svc.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {svc.show_public && (
                            <Badge variant="secondary" className="text-[10px] gap-1"><FileText className="w-2.5 h-2.5" /> Portfólio</Badge>
                          )}
                          {svc.show_leads_form && (
                            <Badge variant="secondary" className="text-[10px] gap-1"><FileText className="w-2.5 h-2.5" /> Formulário</Badge>
                          )}
                          {svc.is_recurring && (
                            <Badge variant="secondary" className="text-[10px] gap-1 border-blue-500/30 text-blue-500"><Repeat className="w-2.5 h-2.5" /> {svc.recurring_period || 'mensal'}</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Categoria:</span>
                          {catName ? <Badge variant="outline" className="text-[10px]">{catName}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Preço:</span>
                          <span className="font-bold text-pink-500">
                            {formatBRL(Number(svc.default_price))}
                            {svc.is_recurring && <span className="text-xs font-normal text-muted-foreground"> /{svc.recurring_period === 'mensal' ? 'mês' : svc.recurring_period === 'trimestral' ? 'tri' : 'ano'}</span>}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(svc)}>
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(svc.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                {filtered.map(svc => {
                  const catName = getCategoryName(svc.category_id);
                  return (
                    <div key={svc.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/30">
                      <div className="flex-1">
                        <span className="font-medium">{svc.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{svc.description}</span>
                      </div>
                      {catName && <Badge variant="outline" className="text-[10px]">{catName}</Badge>}
                      {svc.is_recurring && <Badge variant="secondary" className="text-[10px]"><Repeat className="w-2.5 h-2.5 mr-1" />{svc.recurring_period}</Badge>}
                      <span className="font-bold text-pink-500 w-28 text-right">{formatBRL(Number(svc.default_price))}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(svc)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(svc.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCart className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado</p>
                <Button size="sm" className="mt-3 gap-1.5" onClick={() => setShowSuggestions(true)}>
                  <Plus className="w-3.5 h-3.5" /> Ver Sugestões
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="checkout" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Checkout em breve</p>
              <p className="text-xs text-muted-foreground">Gere links de pagamento para seus clientes</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ CREATE/EDIT MODAL ═══ */}
      <Dialog open={showCreate} onOpenChange={(v) => { setShowCreate(v); if (!v) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Serviço</Label>
              <Input placeholder="Ex: Landing Page" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva o serviço..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" min={0} step={0.01} value={form.default_price || ''} onChange={e => setForm(f => ({ ...f, default_price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione</SelectItem>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Toggles */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Serviço Recorrente</p>
                  <p className="text-xs text-muted-foreground">Cobrança mensal, trimestral ou anual</p>
                </div>
                <Switch checked={form.is_recurring} onCheckedChange={v => setForm(f => ({ ...f, is_recurring: v }))} />
              </CardContent>
            </Card>

            {form.is_recurring && (
              <div>
                <Label>Período</Label>
                <Select value={form.recurring_period} onValueChange={v => setForm(f => ({ ...f, recurring_period: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="trimestral">Trimestral</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Card className="bg-muted/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Exibir na Página Pública</p>
                  <p className="text-xs text-muted-foreground">Mostrar este serviço na sua landing page/portfólio</p>
                </div>
                <Switch checked={form.show_public} onCheckedChange={v => setForm(f => ({ ...f, show_public: v }))} />
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Exibir no Formulário de Leads</p>
                  <p className="text-xs text-muted-foreground">Disponibilizar como opção no formulário de captação</p>
                </div>
                <Switch checked={form.show_leads_form} onCheckedChange={v => setForm(f => ({ ...f, show_leads_form: v }))} />
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { if (!editingId) setShowSuggestions(true); setShowCreate(false); }}>
              {editingId ? 'Cancelar' : 'Ver Sugestões'}
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white" onClick={editingId ? handleUpdate : handleCreate}
              disabled={createService.isPending || updateService.isPending || !form.name.trim() || form.default_price <= 0}>
              {(createService.isPending || updateService.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? 'Salvar Alterações' : 'Cadastrar Novo Serviço'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ SUGGESTIONS MODAL ═══ */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
            <p className="text-sm text-pink-500 flex items-center gap-1">💡 Sugestões de Serviços</p>
          </DialogHeader>
          <div className="space-y-4">
            {SERVICE_SUGGESTIONS.map(group => (
              <div key={group.group}>
                <h4 className="font-semibold text-sm mb-2">{group.group}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map(item => (
                    <button key={item.name} onClick={() => openFromSuggestion(item)}
                      className="text-left p-3 border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <p className="text-sm font-bold text-pink-500 mt-1">
                        {formatBRL(item.price)}
                        {item.is_recurring && <span className="text-xs font-normal text-muted-foreground"> /mês</span>}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={() => {
            setShowSuggestions(false);
            setForm(emptyForm);
            setEditingId(null);
            setShowCreate(true);
          }}>
            Ou criar serviço personalizado
          </Button>
        </DialogContent>
      </Dialog>

      {/* ═══ QUOTE WIZARD ═══ */}
      <Dialog open={showQuoteWizard} onOpenChange={setShowQuoteWizard}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <QuoteWizardLazy
            onClose={() => setShowQuoteWizard(false)}
            onCreated={(token) => {
              setShowQuoteWizard(false);
              setShareToken(token);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ═══ SHARE DIALOG ═══ */}
      <Dialog open={!!shareToken} onOpenChange={() => setShareToken(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Share2 className="w-5 h-5" /> Orçamento Criado!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Compartilhe o link abaixo com o cliente para que ele possa visualizar e assinar o orçamento.</p>
            <div className="flex items-center gap-2">
              <Input readOnly value={`${window.location.origin}/orcamento/${shareToken}`} className="flex-1 text-xs" />
              <Button size="icon" variant="outline" onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/orcamento/${shareToken}`);
                toast({ title: 'Link copiado!' });
              }}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => {
                window.open(`${window.location.origin}/orcamento/${shareToken}`, '_blank');
              }}>
                <ExternalLink className="w-4 h-4" /> Abrir para o Cliente
              </Button>
              <Button className="flex-1 gap-1.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white" onClick={() => setShareToken(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Lazy import to avoid circular deps
import { QuoteWizard as QuoteWizardLazy } from '@/components/billing/QuoteWizard';
