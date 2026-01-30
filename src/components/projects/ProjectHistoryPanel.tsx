import { useEffect } from 'react';
import { History, Calendar, Tag, FileEdit, Star, Archive, CheckCircle, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjectHistory, ProjectHistoryEntry } from '@/hooks/useProjectHistory';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProjectHistoryPanelProps {
  projectId: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  created: <CheckCircle className="h-4 w-4 text-green-500" />,
  updated: <FileEdit className="h-4 w-4 text-blue-500" />,
  status_changed: <Archive className="h-4 w-4 text-amber-500" />,
  deadline_changed: <Calendar className="h-4 w-4 text-purple-500" />,
  tags_changed: <Tag className="h-4 w-4 text-pink-500" />,
  favorite_toggled: <Star className="h-4 w-4 text-yellow-500" />,
  progress_changed: <Eye className="h-4 w-4 text-cyan-500" />,
};

const actionLabels: Record<string, string> = {
  created: 'criou o projeto',
  updated: 'atualizou',
  status_changed: 'alterou o status',
  deadline_changed: 'alterou o prazo',
  tags_changed: 'alterou as tags',
  favorite_toggled: 'alterou favorito',
  progress_changed: 'alterou o progresso',
};

function HistoryItem({ entry }: { entry: ProjectHistoryEntry }) {
  const icon = actionIcons[entry.action] || <FileEdit className="h-4 w-4 text-muted-foreground" />;
  const label = actionLabels[entry.action] || entry.action;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarImage src={entry.user_avatar || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {entry.user_name?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground">
            {entry.user_name || 'Usuário'}
          </span>
          <span className="text-sm text-muted-foreground">
            {label}
          </span>
        </div>
        
        {entry.field_name && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="font-medium">{entry.field_name}</span>
            {entry.old_value && entry.new_value && (
              <>
                : <span className="line-through text-destructive/70">{entry.old_value}</span>
                {' → '}
                <span className="text-green-600 dark:text-green-400">{entry.new_value}</span>
              </>
            )}
            {!entry.old_value && entry.new_value && (
              <>: <span className="text-green-600 dark:text-green-400">{entry.new_value}</span></>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
    </div>
  );
}

export function ProjectHistoryPanel({ projectId }: ProjectHistoryPanelProps) {
  const { history, loading, fetchHistory } = useProjectHistory(projectId);

  useEffect(() => {
    if (projectId) {
      fetchHistory();
    }
  }, [projectId, fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhum histórico registrado ainda
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-1 pr-4">
        {history.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  );
}
