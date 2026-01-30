import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  UserPlus,
  FolderPlus,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  action?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

interface OnboardingChecklistProps {
  hasConnectedAccount: boolean;
  hasCreatedProject: boolean;
  onConnectAccount: () => void;
  onCreateProject: () => void;
  onDismiss: () => void;
}

export function OnboardingChecklist({
  hasConnectedAccount,
  hasCreatedProject,
  onConnectAccount,
  onCreateProject,
  onDismiss,
}: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const items: ChecklistItem[] = [
    {
      id: 'connect-account',
      label: 'Conectar conta Lovable',
      completed: hasConnectedAccount,
      action: onConnectAccount,
      icon: UserPlus,
    },
    {
      id: 'create-project',
      label: 'Criar primeiro projeto',
      completed: hasCreatedProject,
      action: onCreateProject,
      icon: FolderPlus,
    },
  ];

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;
  const allCompleted = completedCount === items.length;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  if (!isVisible) return null;

  // Auto-hide if all completed
  if (allCompleted) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-20 lg:bottom-6 right-4 z-50"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">
                  Parabéns! 🎉
                </p>
                <p className="text-xs text-muted-foreground">
                  Você completou o setup inicial
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-20 lg:bottom-6 right-4 z-50"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden w-72">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground text-sm">
                Primeiros passos
              </p>
              <p className="text-xs text-muted-foreground">
                {completedCount}/{items.length} concluídos
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Progress */}
        <div className="px-4 pb-2">
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={item.completed ? undefined : item.action}
                      disabled={item.completed}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left',
                        item.completed
                          ? 'bg-muted/50'
                          : 'bg-muted/30 hover:bg-muted cursor-pointer'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        item.completed
                          ? 'bg-emerald-500/20'
                          : 'bg-primary/10'
                      )}>
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Icon className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className={cn(
                        'text-sm flex-1',
                        item.completed
                          ? 'text-muted-foreground line-through'
                          : 'text-foreground'
                      )}>
                        {item.label}
                      </span>
                      {!item.completed && (
                        <span className="text-xs text-primary font-medium">
                          Fazer →
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
