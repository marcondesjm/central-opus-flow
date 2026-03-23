import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Globe, Smartphone, ShoppingCart, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProjectTemplate } from '@/components/projects/AddProjectModal';

interface DashboardActivitySectionProps {
  hasProjects: boolean;
  onNewProject: (template?: ProjectTemplate) => void;
}

const exampleProjects: (ProjectTemplate & {
  icon: typeof Globe;
  progress: number;
  status: string;
  statusColor: string;
})[] = [
  {
    name: 'Site Institucional',
    description: 'Landing page para empresa com formulário de contato e blog integrado.',
    type: 'website',
    icon: Globe,
    progress: 72,
    status: 'Em progresso',
    statusColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  {
    name: 'App de Delivery',
    description: 'Aplicativo mobile para restaurante com cardápio digital e pedidos online.',
    type: 'app',
    icon: Smartphone,
    progress: 45,
    status: 'Em progresso',
    statusColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  {
    name: 'Loja Virtual',
    description: 'E-commerce completo com catálogo de produtos, carrinho e checkout.',
    type: 'other',
    icon: ShoppingCart,
    progress: 90,
    status: 'Quase pronto',
    statusColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
];

export function DashboardActivitySection({ hasProjects, onNewProject }: DashboardActivitySectionProps) {
  if (!hasProjects) {
    return (
      <div className="mb-6 space-y-6">
        <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-8 sm:p-12 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <FolderKanban className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Comece criando seu primeiro projeto
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Organize seus projetos, acompanhe o progresso e colabore com sua equipe em um só lugar.
          </p>
          <Button onClick={() => onNewProject()} className="rounded-xl gap-2 px-6">
            <Plus className="w-4 h-4" />
            Nova Landing Page
          </Button>
        </div>

        {/* Example projects */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Clique para criar um projeto baseado nestes exemplos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exampleProjects.map((project) => {
              const Icon = project.icon;
              return (
                <button
                  key={project.name}
                  onClick={() => onNewProject({ name: project.name, description: project.description, type: project.type })}
                  className="group rounded-xl border border-border/60 bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{project.name}</h4>
                      <Badge variant="outline" className={`text-[10px] mt-0.5 ${project.statusColor}`}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{project.progress}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <ActivityFeed limit={10} compact />
    </div>
  );
}
