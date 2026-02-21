import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, ArrowLeft,
  Building2, User, FileText, DollarSign, Loader2, BarChart3,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Slider } from '@/components/ui/slider';
import { useKanbanDeals, useCreateDeal, useUpdateDeal, useDeleteDeal, KANBAN_PHASES, KanbanDeal } from '@/hooks/useKanban';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function AddDealModal({ open, onOpenChange, editDeal }: { open: boolean; onOpenChange: (v: boolean) => void; editDeal?: KanbanDeal | null }) {
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const [form, setForm] = useState({
    company_name: editDeal?.company_name || '',
    client_name: editDeal?.client_name || '',
    description: editDeal?.description || '',
    phase: editDeal?.phase || 'prospeccao',
    progress: editDeal?.progress || 0,
    revenue: editDeal?.revenue || 0,
  });

  const handleSubmit = () => {
    if (!form.company_name.trim() || !form.client_name.trim()) return;
    if (editDeal) {
      updateDeal.mutate({ id: editDeal.id, ...form }, { onSuccess: () => onOpenChange(false) });
    } else {
      createDeal.mutate(form, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editDeal ? 'Editar Deal' : 'Novo Deal'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Empresa</Label>
            <Input placeholder="Nome da empresa" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
          </div>
          <div>
            <Label>Cliente</Label>
            <Input placeholder="Nome do cliente" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea placeholder="Ex: Desenvolvendo site institucional" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <Label>Fase</Label>
            <Select value={form.phase} onValueChange={v => setForm(f => ({ ...f, phase: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KANBAN_PHASES.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Progresso: {form.progress}%</Label>
            <Slider value={[form.progress]} onValueChange={v => setForm(f => ({ ...f, progress: v[0] }))} max={100} step={5} className="mt-2" />
          </div>
          <div>
            <Label>Valor Faturado (R$)</Label>
            <Input type="number" min={0} step={0.01} value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: parseFloat(e.target.value) || 0 }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createDeal.isPending || updateDeal.isPending}>
            {(createDeal.isPending || updateDeal.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editDeal ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DealCard({ deal, onEdit, onDelete }: { deal: KanbanDeal; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="group hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: `var(--deal-${deal.phase})` }}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              {deal.company_name}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <User className="w-3 h-3 flex-shrink-0" />
              {deal.client_name}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 rounded hover:bg-muted"><Pencil className="w-3.5 h-3.5" /></button>
            <button onClick={onDelete} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {deal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1.5">
            <FileText className="w-3 h-3 flex-shrink-0 mt-0.5" />
            {deal.description}
          </p>
        )}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{deal.progress}%</span>
          </div>
          <Progress value={deal.progress} className="h-1.5" />
        </div>
        {deal.revenue > 0 && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <DollarSign className="w-3 h-3" />
            R$ {Number(deal.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RevenueChart({ deals }: { deals: KanbanDeal[] }) {
  const chartData = useMemo(() => {
    const monthMap: Record<string, Record<string, number>> = {};
    deals.filter(d => d.revenue > 0).forEach(deal => {
      const month = format(new Date(deal.created_at), 'MMM/yy', { locale: ptBR });
      if (!monthMap[month]) monthMap[month] = {};
      const key = deal.company_name.slice(0, 15);
      monthMap[month][key] = (monthMap[month][key] || 0) + Number(deal.revenue);
    });
    const companies = [...new Set(deals.filter(d => d.revenue > 0).map(d => d.company_name.slice(0, 15)))];
    return { data: Object.entries(monthMap).map(([month, revenues]) => ({ month, ...revenues })), companies };
  }, [deals]);

  if (chartData.data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nenhum faturamento registrado ainda.</p>;
  }

  const colors = ['#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#ec4899'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData.data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R$${v}`} />
        <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <Legend />
        {chartData.companies.map((company, i) => (
          <Bar key={company} dataKey={company} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function KanbanPage() {
  const { data: deals, isLoading } = useKanbanDeals();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDeal, setEditDeal] = useState<KanbanDeal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);

  const dealsByPhase = useMemo(() => {
    const map: Record<string, KanbanDeal[]> = {};
    KANBAN_PHASES.forEach(p => { map[p.id] = []; });
    deals?.forEach(d => {
      if (map[d.phase]) map[d.phase].push(d);
      else map['prospeccao'].push(d);
    });
    return map;
  }, [deals]);

  const totalRevenue = useMemo(() => deals?.reduce((s, d) => s + Number(d.revenue), 0) || 0, [deals]);

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newPhase = destination.droppableId;
    const deal = deals?.find(d => d.id === draggableId);
    if (!deal || deal.phase === newPhase) return;

    updateDeal.mutate({
      id: deal.id,
      phase: newPhase,
      ...(newPhase === 'concluido' ? { progress: 100 } : {}),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Kanban de Clientes</h1>
              <p className="text-xs text-muted-foreground">
                {deals?.length || 0} deals · Faturamento total: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowChart(v => !v)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico'}
            </Button>
            <Button size="sm" onClick={() => { setEditDeal(null); setShowAddModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Deal
            </Button>
          </div>
        </div>
      </header>

      {showChart && (
        <div className="max-w-[1800px] mx-auto px-4 pt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Faturamento por Cliente / Mês
              </h3>
              <RevenueChart deals={deals || []} />
            </CardContent>
          </Card>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="max-w-[1800px] mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {KANBAN_PHASES.map(phase => (
              <div key={phase.id} className="w-72 flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg text-white text-sm font-medium ${phase.color}`}>
                  <span>{phase.label}</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white text-xs">
                    {dealsByPhase[phase.id]?.length || 0}
                  </Badge>
                </div>
                <Droppable droppableId={phase.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-b-lg p-2 space-y-2 min-h-[200px] border border-t-0 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                      }`}
                    >
                      {dealsByPhase[phase.id]?.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'opacity-90 rotate-1' : ''}
                            >
                              <DealCard
                                deal={deal}
                                onEdit={() => { setEditDeal(deal); setShowAddModal(true); }}
                                onDelete={() => setDeletingId(deal.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {dealsByPhase[phase.id]?.length === 0 && !snapshot.isDraggingOver && (
                        <p className="text-xs text-muted-foreground text-center py-8">Nenhum deal</p>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      {showAddModal && (
        <AddDealModal
          open={showAddModal}
          onOpenChange={v => { setShowAddModal(v); if (!v) setEditDeal(null); }}
          editDeal={editDeal}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir deal?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingId) deleteDeal.mutate(deletingId); setDeletingId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
