import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  UserPlus,
  FolderPlus,
  X,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

interface OnboardingSidebarProps {
  hasConnectedAccount: boolean;
  hasCreatedProject: boolean;
  onConnectAccount: () => void;
  onCreateProject: () => void;
  onDismiss: () => void;
}

export function OnboardingSidebar({
  hasConnectedAccount,
  hasCreatedProject,
  onConnectAccount,
  onCreateProject,
  onDismiss,
}: OnboardingSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items: ChecklistItem[] = [
    {
      id: 'connect-account',
      label: 'Conectar conta',
      description: 'Adicione sua primeira conta Lovable',
      completed: hasConnectedAccount,
      action: onConnectAccount,
      icon: UserPlus,
    },
    {
      id: 'create-project',
      label: 'Criar projeto',
      description: 'Registre seu primeiro projeto',
      completed: hasCreatedProject,
      action: onCreateProject,
      icon: FolderPlus,
    },
  ];

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;
  const allCompleted = completedCount === items.length;

  if (allCompleted) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-20 right-4 z-40 hidden lg:block"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Tudo pronto! 🎉
                </p>
                <p className="text-xs text-muted-foreground">
                  Setup inicial concluído
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className={cn(
        "fixed top-20 right-0 z-40 hidden lg:flex transition-all duration-300",
        isCollapsed ? "translate-x-[calc(100%-40px)]" : ""
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-4 w-6 h-12 bg-card border border-border rounded-l-lg flex items-center justify-center hover:bg-muted transition-colors shadow-sm"
        aria-label={isCollapsed ? "Expandir checklist" : "Recolher checklist"}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <div className="bg-card border border-border rounded-l-xl shadow-lg overflow-hidden w-72">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Primeiros Passos
                </p>
                <p className="text-xs text-muted-foreground">
                  {completedCount}/{items.length} concluídos
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Items */}
        <div className="p-3 space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={item.completed ? undefined : item.action}
                  disabled={item.completed}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group',
                    item.completed
                      ? 'bg-muted/30'
                      : 'bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-sm'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                    item.completed
                      ? 'bg-primary/20'
                      : 'bg-primary/10 group-hover:bg-primary/20'
                  )}>
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Icon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      item.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    )}>
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                    {!item.completed && (
                      <span className="inline-flex items-center text-xs text-primary font-medium mt-2 group-hover:underline">
                        Fazer agora →
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 pt-0">
          <p className="text-[10px] text-muted-foreground text-center">
            Dica: Complete estes passos para desbloquear todo o potencial
          </p>
        </div>
      </div>
    </motion.div>
  );
}
