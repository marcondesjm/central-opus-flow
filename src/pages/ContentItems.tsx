import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useContentItems, useDeleteContentItem, ALL_CONTENT_TYPES } from '@/hooks/useContentItems';
import { ContentTypeSelectorModal } from '@/components/content/ContentTypeSelectorModal';
import { ContentCreationModal } from '@/components/content/ContentCreationModal';
import { ContentDetailModal } from '@/components/content/ContentDetailModal';
import { AddMetricModal } from '@/components/social/AddMetricModal';
import { SocialMetricsDashboard } from '@/components/social/SocialMetricsDashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Calendar, User, FolderOpen, Search, Filter, BarChart3, BarChart, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import type { ContentItem } from '@/hooks/useContentItems';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/20 text-blue-600',
  published: 'bg-green-500/20 text-green-600',
  approved: 'bg-emerald-500/20 text-emerald-600',
  rejected: 'bg-red-500/20 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  published: 'Publicado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-600',
  high: 'bg-orange-500/20 text-orange-600',
  normal: 'bg-blue-500/20 text-blue-600',
  low: 'bg-green-500/20 text-green-600',
};

export default function ContentItems() {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [creationOpen, setCreationOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [addMetricOpen, setAddMetricOpen] = useState(false);
  const [tab, setTab] = useState('list');
  const { data: items, isLoading } = useContentItems({ status: statusFilter || undefined });
  const deleteMutation = useDeleteContentItem();

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    setCreationOpen(true);
  };

  const filteredItems = items?.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.content_type.toLowerCase().includes(q);
  });

  const getTypeInfo = (type: string) => ALL_CONTENT_TYPES.find(t => t.value === type);

  // Status counts
  const statusCounts = {
    draft: items?.filter(i => i.status === 'draft').length || 0,
    scheduled: items?.filter(i => i.status === 'scheduled').length || 0,
    published: items?.filter(i => i.status === 'published').length || 0,
    approved: items?.filter(i => i.status === 'approved').length || 0,
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 lg:pb-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conteúdos</h1>
            <p className="text-sm text-muted-foreground">Gerencie todos os seus conteúdos e entregas</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setAddMetricOpen(true)}>
              <BarChart className="w-4 h-4" /> Métricas
            </Button>
            <Button size="sm" onClick={() => setSelectorOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Conteúdo
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3 flex-wrap">
          <Badge variant="outline" className="gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" /> {statusCounts.draft} Rascunhos
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-primary" /> {statusCounts.scheduled} Agendados
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {statusCounts.published} Publicados
          </Badge>
          <Badge variant="outline" className="gap-1.5 py-1 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> {statusCounts.approved} Aprovados
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" /> Conteúdos
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conteúdos..." className="pl-9 h-9" />
              </div>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-40 h-9">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content list */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : !filteredItems?.length ? (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum conteúdo encontrado</p>
                <p className="text-sm text-muted-foreground mb-4">Crie seu primeiro conteúdo para começar</p>
                <Button onClick={() => setSelectorOpen(true)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Criar conteúdo
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredItems.map(item => {
                  const typeInfo = getTypeInfo(item.content_type);
                  return (
                    <div key={item.id} onClick={() => setDetailItem(item)} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors group cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-lg flex-shrink-0">
                        {typeInfo?.icon || '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground truncate">{item.title || 'Sem título'}</p>
                          <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[item.status] || ''}`}>
                            {STATUS_LABELS[item.status] || item.status}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[item.priority] || ''}`}>
                            {{ urgent: 'Urgente', high: 'Alta', normal: 'Normal', low: 'Baixa' }[item.priority] || item.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">{typeInfo?.label || item.content_type}</span>
                          {item.category && <span>· {item.category}</span>}
                          {item.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(item.due_date), 'dd/MM/yyyy')}
                            </span>
                          )}
                          {item.financial_clients && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {item.financial_clients.name}
                            </span>
                          )}
                          {item.projects && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              {item.projects.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.platforms.length > 0 && (
                        <div className="hidden md:flex gap-1">
                          {item.platforms.map(p => (
                            <span key={p} className="px-2 py-0.5 text-[10px] rounded-full border border-border text-muted-foreground">{p}</span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            <SocialMetricsDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <ContentTypeSelectorModal open={selectorOpen} onOpenChange={setSelectorOpen} onSelect={handleSelectType} />
      {creationOpen && (
        <ContentCreationModal
          open={creationOpen}
          onOpenChange={setCreationOpen}
          contentType={selectedType}
          onBack={() => { setCreationOpen(false); setSelectorOpen(true); }}
        />
      )}
      {detailItem && (
        <ContentDetailModal
          open={!!detailItem}
          onOpenChange={(open) => { if (!open) setDetailItem(null); }}
          item={detailItem}
        />
      )}
      <AddMetricModal open={addMetricOpen} onOpenChange={setAddMetricOpen} />
    </AppLayout>
  );
}
