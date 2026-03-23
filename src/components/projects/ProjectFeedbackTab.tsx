import { useState } from 'react';
import { useProjectFeedback, useResolveFeedback, ProjectFeedback } from '@/hooks/useProjectFeedback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const PER_PAGE = 3;

const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+\.(?:png|jpe?g|webp|gif|svg)(?:\?[^\s]*)?)/gi;

interface ProjectFeedbackTabProps {
  projectId: string;
}

function PaginatedList({ items, renderItem }: { items: any[]; renderItem: (item: any) => React.ReactNode }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / PER_PAGE);
  const paged = items.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div className="space-y-2">
      {paged.map(renderItem)}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProjectFeedbackTab({ projectId }: ProjectFeedbackTabProps) {
  const { data: feedback = [], isLoading } = useProjectFeedback(projectId);
  const resolveFeedback = useResolveFeedback();

  const handleResolve = async (id: string) => {
    try {
      await resolveFeedback.mutateAsync({ id, projectId });
      toast.success('Feedback resolvido!');
    } catch {
      toast.error('Erro ao resolver feedback');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-12 mt-4">
        <MessageCircle className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum feedback recebido ainda.</p>
        <p className="text-xs text-muted-foreground mt-1">Os comentários do cliente aparecerão aqui.</p>
      </div>
    );
  }

  const pending = feedback.filter(f => !f.is_resolved);
  const resolved = feedback.filter(f => f.is_resolved);

  return (
    <div className="space-y-4 mt-4">
      {pending.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Pendentes</h4>
          <PaginatedList items={pending} renderItem={(f) => (
            <FeedbackItem key={f.id} feedback={f} onResolve={handleResolve} />
          )} />
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Resolvidos</h4>
          <PaginatedList items={resolved} renderItem={(f) => (
            <FeedbackItem key={f.id} feedback={f} resolved />
          )} />
        </div>
      )}
    </div>
  );
}

function FeedbackItem({ feedback, onResolve, resolved }: { feedback: ProjectFeedback; onResolve?: (id: string) => void; resolved?: boolean }) {
  const imageUrls = Array.from(new Set(feedback.comment.match(IMAGE_URL_REGEX) ?? []));
  const commentText = feedback.comment.replace(IMAGE_URL_REGEX, '').replace(/\n{2,}/g, '\n').trim();

  return (
    <div className={cn(
      'p-3 rounded-lg border text-sm',
      resolved ? 'bg-muted/30 opacity-60' : 'bg-card'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-xs">{feedback.author_name}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {feedback.author_type === 'client' ? 'Cliente' : 'Equipe'}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {format(new Date(feedback.created_at), "dd MMM HH:mm", { locale: ptBR })}
            </span>
          </div>
          {commentText ? (
            <p className="text-muted-foreground text-xs whitespace-pre-line">"{commentText}"</p>
          ) : null}

          {imageUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imageUrls.map((url, index) => (
                <Button key={url} variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" asChild>
                  <a href={url} download target="_blank" rel="noreferrer">
                    <Download className="w-3 h-3" />
                    Baixar imagem {imageUrls.length > 1 ? index + 1 : ''}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
        {!resolved && onResolve && (
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1"
            onClick={() => onResolve(feedback.id)}>
            <CheckCircle2 className="w-3 h-3" />
            Resolver
          </Button>
        )}
        {resolved && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      </div>
    </div>
  );
}
