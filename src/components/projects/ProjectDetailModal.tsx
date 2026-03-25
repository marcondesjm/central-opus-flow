import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { ProjectVersionsTab } from './ProjectVersionsTab';
import { ProjectFeedbackTab } from './ProjectFeedbackTab';
import { ProjectHistoryPanel } from './ProjectHistoryPanel';
import { ProjectKeysPanel } from './ProjectKeysPanel';
import { cn } from '@/lib/utils';
import { Eye, Layers, MessageCircle, History, Key, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  published: { label: 'Aprovado', className: 'bg-emerald-500/10 text-emerald-600' },
  review: { label: 'Em revisão', className: 'bg-amber-500/10 text-amber-600' },
  approved: { label: 'Aprovado', className: 'bg-emerald-500/10 text-emerald-600' },
  changes: { label: 'Ajustes', className: 'bg-destructive/10 text-destructive' },
  archived: { label: 'Arquivado', className: 'bg-muted text-muted-foreground' },
};

export function ProjectDetailModal({ project, open, onOpenChange }: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) return null;

  const status = statusLabels[project.status] || statusLabels.draft;
  const maxRevisions = (project as any).max_revisions || 3;

  const handleSendVersion = () => {
    setActiveTab('versions');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden max-h-[92vh]">
        <DialogTitle className="sr-only">{project.name}</DialogTitle>
        
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b">
          <h2 className="font-bold text-lg text-foreground pr-8">{project.name}</h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {(project as any).client_name && <span>{(project as any).client_name}</span>}
            </span>
            <span>—</span>
            <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', status.className)}>
              {status.label}
            </Badge>
            {project.deadline && (
              <>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Prazo: {format(new Date(project.deadline), "dd MMM", { locale: ptBR })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-4 pt-3 pb-0">
            <div className="flex gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border/50">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                  activeTab === 'overview'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Eye className="w-3.5 h-3.5" />
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                  activeTab === 'versions'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                Versões
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                  activeTab === 'feedback'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Feedback
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                  activeTab === 'activity'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <History className="w-3.5 h-3.5" />
                Atividade
              </button>
              <button
                onClick={() => setActiveTab('keys')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                  activeTab === 'keys'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Key className="w-3.5 h-3.5" />
                Keys
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(92vh-140px)] px-5 pb-5">
            <TabsContent value="overview" className="mt-0">
              <ProjectOverviewTab 
                project={{
                  id: project.id,
                  status: project.status,
                  description: project.description,
                  notes: project.notes,
                  max_revisions: maxRevisions,
                }} 
                onSendVersion={handleSendVersion} 
              />
            </TabsContent>
            <TabsContent value="versions" className="mt-0">
              <ProjectVersionsTab projectId={project.id} maxRevisions={maxRevisions} />
            </TabsContent>
            <TabsContent value="feedback" className="mt-0">
              <ProjectFeedbackTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="activity" className="mt-0 mt-4">
              <ProjectHistoryPanel projectId={project.id} />
            </TabsContent>
            <TabsContent value="keys" className="mt-0 mt-4">
              <ProjectKeysPanel projectId={project.id} projectName={project.name} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
