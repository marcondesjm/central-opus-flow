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
          <div className="px-5 pt-3 pb-1">
            <TabsList className="bg-muted/50 h-10 p-1 gap-1 w-full rounded-xl">
              <TabsTrigger value="overview" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
                <Eye className="w-3.5 h-3.5" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
                <Layers className="w-3.5 h-3.5" />
                Versões
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
                <MessageCircle className="w-3.5 h-3.5" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
                <History className="w-3.5 h-3.5" />
                Atividade
              </TabsTrigger>
              <TabsTrigger value="keys" className="flex-1 rounded-lg text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
                <Key className="w-3.5 h-3.5" />
                Keys
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="border-b mx-5" />

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
