import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, FolderKanban } from 'lucide-react';

interface DashboardActivitySectionProps {
  hasProjects: boolean;
  onNewProject: () => void;
}

export function DashboardActivitySection({ hasProjects, onNewProject }: DashboardActivitySectionProps) {
  if (!hasProjects) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-border/60 bg-card/50 p-8 sm:p-12 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <FolderKanban className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Comece criando seu primeiro projeto
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Organize seus projetos, acompanhe o progresso e colabore com sua equipe em um só lugar.
        </p>
        <Button onClick={onNewProject} className="rounded-xl gap-2 px-6">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <ActivityFeed limit={10} compact />
    </div>
  );
}
