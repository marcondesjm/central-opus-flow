import { AlertTriangle, Clock, Star, CheckCircle2, ArrowRight, Send, Plus, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActionProject {
  id: string;
  name: string;
  status: string;
  deadline?: Date | null;
  isFavorite: boolean;
  progress: number;
  accountName?: string;
}

interface ActionCenterProps {
  projects: ActionProject[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onSendVersion: () => void;
  onViewApprovals: () => void;
}

export function ActionCenter({ projects, onOpenProject, onNewProject }: ActionCenterProps) {
  const now = new Date();

  const overdueProjects = projects.filter(
    p => p.deadline && new Date(p.deadline) < now && p.status !== 'published' && p.status !== 'archived' && p.status !== 'approved'
  );

  const reviewProjects = projects.filter(p => p.status === 'review');
  const changesProjects = projects.filter(p => p.status === 'changes');
  const approvalProjects = projects.filter(p => p.isFavorite); // favorites = approvals
  const approvedProjects = projects.filter(p => p.status === 'approved');

  const hasActions = overdueProjects.length > 0 || reviewProjects.length > 0 || changesProjects.length > 0;

  // "Seu dia" stats
  const dayStats = [
    { label: 'Em revisão', count: reviewProjects.length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
    { label: 'Aguardando cliente', count: approvalProjects.length, color: 'text-primary', bg: 'bg-primary/10', icon: Star },
    { label: 'Atrasados', count: overdueProjects.length, color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
    { label: 'Aprovados', count: approvedProjects.length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Seu dia - summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {dayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.bg)}>
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
              </div>
              <p className={cn('text-3xl font-bold tabular-nums', stat.color)}>{stat.count}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Ações necessárias */}
      {hasActions && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            🚨 Ações necessárias
          </h3>
          <div className="space-y-1.5">
            {reviewProjects.length > 0 && (
              <button
                onClick={() => reviewProjects[0] && onOpenProject(reviewProjects[0].id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-background/60 transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="flex-1">
                  <strong>{reviewProjects.length}</strong> {reviewProjects.length === 1 ? 'projeto aguardando aprovação' : 'projetos aguardando aprovação'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {changesProjects.length > 0 && (
              <button
                onClick={() => changesProjects[0] && onOpenProject(changesProjects[0].id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-background/60 transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                <span className="flex-1">
                  <strong>{changesProjects.length}</strong> {changesProjects.length === 1 ? 'projeto precisa de ajustes' : 'projetos precisam de ajustes'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {overdueProjects.length > 0 && (
              <button
                onClick={() => overdueProjects[0] && onOpenProject(overdueProjects[0].id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-background/60 transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                <span className="flex-1">
                  <strong>{overdueProjects.length}</strong> {overdueProjects.length === 1 ? 'projeto atrasado' : 'projetos atrasados'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Aprovações pendentes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-primary fill-primary" />
          📩 Aprovações pendentes
        </h3>
        {approvalProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Nenhuma aprovação pendente 🎉</p>
            <p className="text-xs text-muted-foreground">Envie uma versão para seu cliente revisar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {approvalProjects.slice(0, 4).map((project) => {
              const statusColor = project.status === 'review'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : project.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-primary/10 text-primary border-primary/20';
              const statusLabel = project.status === 'review'
                ? '🟡 Aguardando aprovação'
                : project.status === 'approved'
                  ? '🟢 Aprovado'
                  : '📋 Em análise';

              return (
                <button
                  key={project.id}
                  onClick={() => onOpenProject(project.id)}
                  className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98] group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {project.name}
                    </h4>
                    <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                  </div>
                  {project.accountName && (
                    <p className="text-xs text-muted-foreground mb-2">Cliente: {project.accountName}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn('text-[10px]', statusColor)}>
                      {statusLabel}
                    </Badge>
                    {project.deadline && (
                      <span className={cn(
                        'text-[10px] font-medium',
                        new Date(project.deadline) < now ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        Prazo: {formatDistanceToNow(new Date(project.deadline), { locale: ptBR, addSuffix: true })}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onNewProject} size="sm" className="rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Nova Landing Page
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => {}}>
          <Send className="w-4 h-4" />
          Enviar nova versão
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => {}}>
          <Star className="w-4 h-4" />
          Ver aprovações
        </Button>
      </div>
    </div>
  );
}
