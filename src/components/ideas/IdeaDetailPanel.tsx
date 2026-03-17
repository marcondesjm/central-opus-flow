import { useState } from 'react';
import { Idea, ROADMAP_OPTIONS, THEME_PRESETS, useUpdateIdea, useDeleteIdea } from '@/hooks/useIdeas';
import { DotRating } from './DotRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, Trash2, Lightbulb, FlaskConical, CheckCircle2, Paperclip, Link2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface IdeaDetailPanelProps {
  idea: Idea;
  onClose: () => void;
}

export function IdeaDetailPanel({ idea, onClose }: IdeaDetailPanelProps) {
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const theme = THEME_PRESETS.find(t => t.id === idea.theme) || THEME_PRESETS[5];
  const roadmap = ROADMAP_OPTIONS.find(r => r.id === idea.roadmap);

  const handleFieldUpdate = (field: string, value: unknown) => {
    updateIdea.mutate({ id: idea.id, [field]: value } as any);
  };

  return (
    <div className="h-full flex flex-col bg-card border-l overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg">{theme.icon}</span>
          <span className="text-xs text-muted-foreground truncate">{theme.label}</span>
          {roadmap && (
            <Badge variant="outline" className={cn('text-[10px]', roadmap.textColor, roadmap.bgLight)}>
              {roadmap.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="px-3 md:px-4 pt-3">
        <Input
          defaultValue={idea.title}
          className="text-base md:text-lg font-semibold border-none px-0 h-auto focus-visible:ring-0 shadow-none"
          onBlur={(e) => {
            if (e.target.value !== idea.title) handleFieldUpdate('title', e.target.value);
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 md:mx-4 mt-2 justify-start bg-transparent border-b rounded-none h-auto p-0 gap-4">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-xs md:text-sm">
            Visão geral
          </TabsTrigger>
          <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-xs md:text-sm">
            Detalhes
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overview" className="m-0 p-3 md:p-4 space-y-5">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Impacto</label>
                <DotRating value={idea.impact} color="bg-blue-500" onChange={(v) => handleFieldUpdate('impact', v)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Esforço</label>
                <DotRating value={idea.effort} color="bg-amber-500" onChange={(v) => handleFieldUpdate('effort', v)} />
              </div>
            </div>

            {/* Roadmap */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Roteiro</label>
              <Select value={idea.roadmap} onValueChange={(v) => handleFieldUpdate('roadmap', v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROADMAP_OPTIONS.map(o => (
                    <SelectItem key={o.id} value={o.id} className="text-xs">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tema</label>
              <Select value={idea.theme} onValueChange={(v) => {
                const preset = THEME_PRESETS.find(t => t.id === v);
                updateIdea.mutate({ id: idea.id, theme: v, theme_color: preset?.color || '#6b7280' });
              }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEME_PRESETS.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      <span className="flex items-center gap-2">{t.icon} {t.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Progresso da entrega ({idea.progress}%)</label>
              <Slider
                value={[idea.progress]}
                max={100}
                step={5}
                onValueCommit={(v) => handleFieldUpdate('progress', v[0])}
                className="w-full"
              />
            </div>

            {/* Hypothesis */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold">Hipótese</span>
              </div>
              <Textarea
                defaultValue={idea.hypothesis || ''}
                placeholder="Descreva a hipótese da ideia..."
                className="min-h-[80px] text-sm resize-none"
                onBlur={(e) => handleFieldUpdate('hypothesis', e.target.value)}
              />
            </div>

            {/* Validation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold">Validação</span>
              </div>
              <Textarea
                defaultValue={idea.validation || ''}
                placeholder="Resultados da validação..."
                className="min-h-[80px] text-sm resize-none"
                onBlur={(e) => handleFieldUpdate('validation', e.target.value)}
              />
            </div>

            {/* Decision */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Decisão</span>
              </div>
              <Textarea
                defaultValue={idea.decision || ''}
                placeholder="Qual a decisão tomada..."
                className="min-h-[80px] text-sm resize-none"
                onBlur={(e) => handleFieldUpdate('decision', e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="m-0 p-3 md:p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Descrição</label>
              <Textarea
                defaultValue={idea.description || ''}
                placeholder="Detalhes adicionais..."
                className="min-h-[120px] text-sm resize-none"
                onBlur={(e) => handleFieldUpdate('description', e.target.value)}
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Criada em: {new Date(idea.created_at).toLocaleDateString('pt-BR')}</p>
              <p>Atualizada em: {new Date(idea.updated_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ideia?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteIdea.mutate(idea.id); onClose(); }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
