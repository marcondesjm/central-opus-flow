import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUpdateProject, useAccounts, Project } from '@/hooks/useProjects';
import { useProjectVersions } from '@/hooks/useProjectVersions';
import { Eye, Layers, MessageCircle, History, Clock, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProjectEditForm } from './ProjectEditForm';
import { ProjectVersionsTab } from './ProjectVersionsTab';
import { ProjectFeedbackTab } from './ProjectFeedbackTab';
import { ProjectHistoryPanel } from './ProjectHistoryPanel';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  initialTab?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Rascunho', color: 'text-muted-foreground', icon: Clock },
  published: { label: 'Aprovado', color: 'text-emerald-600', icon: CheckCircle2 },
  review: { label: 'Em revisão', color: 'text-amber-600', icon: Clock },
  approved: { label: 'Aprovado', color: 'text-emerald-600', icon: CheckCircle2 },
  changes: { label: 'Ajustes solicitados', color: 'text-red-600', icon: AlertTriangle },
  archived: { label: 'Arquivado', color: 'text-muted-foreground', icon: Clock },
};

export function EditProjectModal({ open, onOpenChange, project, initialTab = 'versions' }: EditProjectModalProps) {
  const { data: accounts = [] } = useAccounts();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localStatus, setLocalStatus] = useState(project?.status || 'draft');

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (project) setLocalStatus(project.status);
  }, [project?.status, project?.id]);

  if (!project) return null;

  const account = accounts.find(a => a.id === project.account_id);
  const config = statusConfig[localStatus] || statusConfig.draft;
  const StatusIcon = config.icon;
  const maxRevisions = (project as any).max_revisions || 3;
  const clientName = (project as any).client_name || account?.name || '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Project Header */}
        <div className="p-6 pb-4 border-b bg-muted/30">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-lg font-bold">{project.name}</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {clientName}
            </span>
            <Badge variant="outline" className={cn('text-xs gap-1 py-0', config.color)}>
              <StatusIcon className="w-3 h-3" />
              {config.label}
            </Badge>
            {project.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Prazo: {format(new Date(project.deadline), "dd MMM", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mt-4">
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="gap-1.5 text-xs">
                <Layers className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Versões</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-1.5 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5 text-xs">
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Atividade</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ProjectEditForm 
                project={project} 
                onSaved={() => {
                  // Refresh local status from query cache
                  onOpenChange(false);
                }} 
                onStatusChange={(s) => setLocalStatus(s)}
              />
            </TabsContent>

            <TabsContent value="versions">
              <ProjectVersionsTab projectId={project.id} maxRevisions={maxRevisions} />
            </TabsContent>

            <TabsContent value="feedback">
              <ProjectFeedbackTab projectId={project.id} />
            </TabsContent>

            <TabsContent value="activity">
              <div className="mt-4">
                <ProjectHistoryPanel projectId={project.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
