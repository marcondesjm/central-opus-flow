import { useActivityLogs, formatActivityAction } from '@/hooks/useActivityLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Plus, 
  Pencil, 
  Trash2, 
  Archive, 
  RotateCcw, 
  Star, 
  LogIn, 
  LogOut,
  Eye,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityFeedProps {
  limit?: number;
  compact?: boolean;
}

const actionIcons: Record<string, React.ReactNode> = {
  create: <Plus className="w-3 h-3" />,
  update: <Pencil className="w-3 h-3" />,
  delete: <Trash2 className="w-3 h-3" />,
  archive: <Archive className="w-3 h-3" />,
  restore: <RotateCcw className="w-3 h-3" />,
  favorite: <Star className="w-3 h-3" />,
  unfavorite: <Star className="w-3 h-3" />,
  login: <LogIn className="w-3 h-3" />,
  logout: <LogOut className="w-3 h-3" />,
  view: <Eye className="w-3 h-3" />,
};

const actionColors: Record<string, string> = {
  create: 'bg-emerald-500/10 text-emerald-500',
  update: 'bg-blue-500/10 text-blue-500',
  delete: 'bg-red-500/10 text-red-500',
  archive: 'bg-amber-500/10 text-amber-500',
  restore: 'bg-violet-500/10 text-violet-500',
  favorite: 'bg-yellow-500/10 text-yellow-500',
  unfavorite: 'bg-muted text-muted-foreground',
  login: 'bg-emerald-500/10 text-emerald-500',
  logout: 'bg-muted text-muted-foreground',
  view: 'bg-blue-500/10 text-blue-500',
};

export function ActivityFeed({ limit = 20, compact = false }: ActivityFeedProps) {
  const { data: logs = [], isLoading } = useActivityLogs(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade registrada ainda
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className={compact ? 'h-[200px]' : 'h-[300px]'}>
          <div className="px-4 pb-4 space-y-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
              >
                <div className={`p-1.5 rounded-full shrink-0 ${actionColors[log.action] || 'bg-muted'}`}>
                  {actionIcons[log.action] || <Activity className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {formatActivityAction(log.action, log.entity_type, log.entity_name)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { 
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
