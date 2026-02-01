import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChangelogByVersion, ChangelogEntry } from '@/hooks/useChangelog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Sparkles, 
  Bug, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  History,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<ChangelogEntry['type'], { icon: typeof Sparkles; label: string; color: string }> = {
  feature: { icon: Sparkles, label: 'Nova funcionalidade', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  fix: { icon: Bug, label: 'Correção', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  improvement: { icon: TrendingUp, label: 'Melhoria', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  security: { icon: Shield, label: 'Segurança', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  breaking: { icon: AlertTriangle, label: 'Breaking Change', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  const { data: changelog, isLoading } = useChangelogByVersion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico de Atualizações
          </DialogTitle>
          <DialogDescription>
            Confira todas as alterações e melhorias do sistema.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !changelog || changelog.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhuma atualização registrada</p>
            </div>
          ) : (
            <div className="space-y-8">
              {changelog.map(({ version, entries, date }) => (
                <div key={version} className="relative">
                  {/* Version header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="default" className="text-sm font-mono">
                      v{version}
                    </Badge>
                    {date && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    )}
                  </div>

                  {/* Entries */}
                  <div className="space-y-3 ml-2 border-l-2 border-border pl-4">
                    {entries.map((entry) => {
                      const config = typeConfig[entry.type];
                      const Icon = config.icon;

                      return (
                        <div key={entry.id} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                          
                          <div className="flex items-start gap-3">
                            <Badge 
                              variant="outline" 
                              className={cn("gap-1 text-xs shrink-0", config.color)}
                            >
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{entry.title}</p>
                              {entry.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {entry.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
