import { useMemo, useState, useCallback } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth,
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Instagram, Facebook, Linkedin, Twitter, Youtube, Video, User, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SocialPost, CONTENT_TYPE_OPTIONS, useUpdateSocialPost } from '@/hooks/useSocialMedia';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ViewMode = 'day' | 'week' | 'month';

const platformIcons: Record<string, any> = {
  instagram: Instagram, facebook: Facebook, linkedin: Linkedin,
  twitter: Twitter, youtube: Youtube, tiktok: Video,
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-primary/20 text-primary',
  published: 'bg-emerald-500/20 text-emerald-600',
  failed: 'bg-destructive/20 text-destructive',
};

const approvalColors: Record<string, string> = {
  pending: 'border-l-amber-500',
  approved: 'border-l-emerald-500',
  rejected: 'border-l-red-500',
};

interface Props {
  posts: SocialPost[];
  onPostClick?: (post: SocialPost) => void;
}

export function SocialCalendar({ posts, onPostClick }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [draggedPost, setDraggedPost] = useState<SocialPost | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const updatePost = useUpdateSocialPost();

  const getPostDate = (post: SocialPost) => new Date(post.scheduled_at || post.created_at);

  const navigate = (dir: 'prev' | 'next') => {
    const fn = dir === 'prev'
      ? viewMode === 'month' ? subMonths : viewMode === 'week' ? subWeeks : subDays
      : viewMode === 'month' ? addMonths : viewMode === 'week' ? addWeeks : addDays;
    setCurrentDate(fn(currentDate, 1));
  };

  const headerLabel = useMemo(() => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    if (viewMode === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
      const we = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(ws, 'dd MMM', { locale: ptBR })} – ${format(we, 'dd MMM yyyy', { locale: ptBR })}`;
    }
    return format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
  }, [currentDate, viewMode]);

  // Drag & Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, post: SocialPost) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', post.id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, dayKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(dayKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverDay(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dayKey: string) => {
    e.preventDefault();
    setDragOverDay(null);
    if (!draggedPost) return;

    const oldDate = getPostDate(draggedPost);
    const [year, month, day] = dayKey.split('-').map(Number);
    const newDate = new Date(year, month - 1, day, oldDate.getHours(), oldDate.getMinutes());

    updatePost.mutate({
      id: draggedPost.id,
      scheduled_at: newDate.toISOString(),
      status: draggedPost.status === 'draft' ? 'scheduled' : draggedPost.status,
    });
    setDraggedPost(null);
  }, [draggedPost, updatePost]);

  // Views data
  const dayPosts = useMemo(() => {
    if (viewMode !== 'day') return [];
    return posts.filter(p => isSameDay(getPostDate(p), currentDate))
      .sort((a, b) => getPostDate(a).getTime() - getPostDate(b).getTime());
  }, [posts, currentDate, viewMode]);

  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return [];
    const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: ws, end: endOfWeek(currentDate, { weekStartsOn: 0 }) });
  }, [currentDate, viewMode]);

  const weekPostsByDay = useMemo(() => {
    if (viewMode !== 'week') return new Map();
    const map = new Map<string, SocialPost[]>();
    weekDays.forEach(d => map.set(format(d, 'yyyy-MM-dd'), []));
    posts.forEach(p => {
      const key = format(getPostDate(p), 'yyyy-MM-dd');
      if (map.has(key)) map.get(key)!.push(p);
    });
    return map;
  }, [posts, weekDays, viewMode]);

  const monthDays = useMemo(() => {
    if (viewMode !== 'month') return [];
    const ms = startOfMonth(currentDate);
    const me = endOfMonth(currentDate);
    return eachDayOfInterval({ start: startOfWeek(ms, { weekStartsOn: 0 }), end: endOfWeek(me, { weekStartsOn: 0 }) });
  }, [currentDate, viewMode]);

  const monthPostsByDay = useMemo(() => {
    if (viewMode !== 'month') return new Map();
    const map = new Map<string, SocialPost[]>();
    posts.forEach(p => {
      const key = format(getPostDate(p), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [posts, viewMode]);

  const PostCard = ({ post, compact = false }: { post: SocialPost; compact?: boolean }) => {
    const PIcon = platformIcons[post.platform] || Instagram;
    const tLabel = CONTENT_TYPE_OPTIONS.find(t => t.value === post.content_type)?.label || post.content_type;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={e => handleDragStart(e, post)}
            onClick={() => onPostClick?.(post)}
            className={cn(
              'w-full flex items-center gap-1.5 rounded text-left transition-colors hover:opacity-80 border-l-2 cursor-grab active:cursor-grabbing',
              compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1.5 text-xs',
              statusColors[post.status],
              approvalColors[post.approval_status] || 'border-l-transparent'
            )}
            style={post.color ? { borderLeftColor: post.color } : undefined}
          >
            <GripVertical className={cn('flex-shrink-0 text-muted-foreground/50', compact ? 'w-2.5 h-2.5' : 'w-3 h-3')} />
            <PIcon className={cn('flex-shrink-0', compact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
            <span className="truncate flex-1">{post.title || post.content.slice(0, 25)}</span>
            {!compact && post.financial_clients && (
              <span className="flex items-center gap-0.5 text-muted-foreground text-[10px]">
                <User className="w-2.5 h-2.5" />
                {post.financial_clients.name.split(' ')[0]}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{post.title || 'Sem título'}</p>
          <p className="text-xs text-muted-foreground mt-1">{post.content.slice(0, 100)}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] capitalize">{tLabel}</Badge>
            <Badge variant="outline" className="text-[10px]">{post.platform}</Badge>
            <Badge variant="outline" className="text-[10px]">{post.status}</Badge>
            {post.approval_status !== 'pending' && (
              <Badge variant={post.approval_status === 'approved' ? 'default' : 'destructive'} className="text-[10px]">
                {post.approval_status === 'approved' ? '✓ Aprovado' : '✗ Rejeitado'}
              </Badge>
            )}
          </div>
          {post.scheduled_at && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {format(new Date(post.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground mt-1 italic">Arraste para reagendar</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const wdLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const DayCell = ({ day, dayPosts: dayP, className }: { day: Date; dayPosts: SocialPost[]; className?: string }) => {
    const key = format(day, 'yyyy-MM-dd');
    const isToday = isSameDay(day, new Date());
    const isCurrent = isSameMonth(day, currentDate);
    const isDragOver = dragOverDay === key;

    return (
      <div
        className={cn(
          'min-h-[100px] border-b border-r border-border p-1.5 transition-colors',
          !isCurrent && 'bg-muted/30',
          isToday && 'bg-primary/5',
          isDragOver && 'bg-primary/10 ring-1 ring-primary/30',
          className
        )}
        onDragOver={e => handleDragOver(e, key)}
        onDragLeave={handleDragLeave}
        onDrop={e => handleDrop(e, key)}
      >
        <div className={cn('text-xs font-medium mb-1', isToday ? 'text-primary font-bold' : isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
          {format(day, 'd')}
        </div>
        <div className="space-y-0.5">
          {dayP.slice(0, 3).map(post => <PostCard key={post.id} post={post} compact />)}
          {dayP.length > 3 && (
            <span className="text-[10px] text-muted-foreground px-1">+{dayP.length - 3} mais</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold capitalize min-w-[200px] text-center">{headerLabel}</h3>
          <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-all',
                viewMode === v ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div
          className={cn('p-4 space-y-2 min-h-[400px]', dragOverDay === format(currentDate, 'yyyy-MM-dd') && 'bg-primary/10')}
          onDragOver={e => handleDragOver(e, format(currentDate, 'yyyy-MM-dd'))}
          onDragLeave={handleDragLeave}
          onDrop={e => handleDrop(e, format(currentDate, 'yyyy-MM-dd'))}
        >
          {dayPosts.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
              Nenhum conteúdo para este dia
            </div>
          ) : (
            <div className="space-y-2">
              {dayPosts.map(post => (
                <div key={post.id} className="bg-muted/30 rounded-lg p-3">
                  <PostCard post={post} />
                  {post.scheduled_at && (
                    <p className="text-xs text-muted-foreground mt-1 ml-5">
                      {format(new Date(post.scheduled_at), 'HH:mm')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <>
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((d, i) => (
              <div key={i} className={cn('text-center py-2 border-r border-border last:border-r-0', isSameDay(d, new Date()) && 'bg-primary/5')}>
                <p className="text-[10px] text-muted-foreground">{wdLabels[i]}</p>
                <p className={cn('text-sm font-medium', isSameDay(d, new Date()) ? 'text-primary' : 'text-foreground')}>{format(d, 'd')}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDays.map((d, i) => {
              const key = format(d, 'yyyy-MM-dd');
              const dayP = weekPostsByDay.get(key) || [];
              const isDragOver = dragOverDay === key;
              return (
                <div
                  key={i}
                  className={cn(
                    'border-r border-border last:border-r-0 p-1.5 space-y-1 transition-colors',
                    isSameDay(d, new Date()) && 'bg-primary/5',
                    isDragOver && 'bg-primary/10 ring-1 ring-primary/30'
                  )}
                  onDragOver={e => handleDragOver(e, key)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, key)}
                >
                  {dayP.map(p => <PostCard key={p.id} post={p} />)}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <>
          <div className="grid grid-cols-7 border-b border-border">
            {wdLabels.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayP = monthPostsByDay.get(key) || [];
              return <DayCell key={i} day={day} dayPosts={dayP} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
