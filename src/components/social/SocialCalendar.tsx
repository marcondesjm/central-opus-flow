import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Instagram, Facebook, Linkedin, Twitter, Youtube, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SocialPost } from '@/hooks/useSocialMedia';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Video,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
  facebook: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  linkedin: 'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  twitter: 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
  youtube: 'bg-red-500/20 text-red-600 dark:text-red-400',
  tiktok: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-primary/20 text-primary',
  published: 'bg-emerald-500/20 text-emerald-600',
  failed: 'bg-destructive/20 text-destructive',
};

interface Props {
  posts: SocialPost[];
  onPostClick?: (post: SocialPost) => void;
}

export function SocialCalendar({ posts, onPostClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, SocialPost[]>();
    posts.forEach(post => {
      const d = post.scheduled_at || post.created_at;
      if (!d) return;
      const key = format(new Date(d), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    });
    return map;
  }, [posts]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDay.get(key) || [];
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={i}
              className={cn(
                'min-h-[100px] border-b border-r border-border p-1.5 transition-colors',
                !isCurrentMonth && 'bg-muted/30',
                isToday && 'bg-primary/5'
              )}
            >
              <div className={cn(
                'text-xs font-medium mb-1',
                isToday ? 'text-primary font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map(post => {
                  const Icon = platformIcons[post.platform] || Instagram;
                  return (
                    <Tooltip key={post.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onPostClick?.(post)}
                          className={cn(
                            'w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] truncate transition-colors hover:opacity-80',
                            statusColors[post.status]
                          )}
                        >
                          <Icon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{post.title || post.content.slice(0, 20)}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">{post.title || 'Sem título'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{post.content.slice(0, 100)}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{post.platform}</Badge>
                          <Badge variant="outline" className="text-[10px]">{post.status}</Badge>
                          {post.scheduled_at && (
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(post.scheduled_at), 'HH:mm')}
                            </span>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {dayPosts.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{dayPosts.length - 3} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
