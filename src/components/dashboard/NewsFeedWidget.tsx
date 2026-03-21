import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Rss, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

export function NewsFeedWidget() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['rss-feed-items'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-rss');
      if (error) throw error;
      return data as { success: boolean; items: RssItem[] };
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 3 * 60 * 1000,
  });

  const items = data?.items || [];

  // Group items by source, max 4 per source
  const groupedFeeds = useMemo(() => {
    const groups: Record<string, RssItem[]> = {};
    for (const item of items) {
      const source = item.source || 'Sem fonte';
      if (!groups[source]) groups[source] = [];
      if (groups[source].length < 4) {
        groups[source].push(item);
      }
    }
    return Object.entries(groups);
  }, [items]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Rss className="w-4 h-4" />
            Feed de Notícias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Rss className="w-4 h-4" />
            Feed de Notícias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Rss className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notícia disponível
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure feeds RSS no painel administrativo
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Rss className="w-4 h-4" />
          Feed de Notícias
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {groupedFeeds.map(([source, sourceItems]) => (
          <Card key={source} className="overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs font-semibold flex items-center gap-2">
                <Rss className="w-3.5 h-3.5 text-primary" />
                {source}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
                  {sourceItems.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[240px]">
                <div className="px-3 pb-3 space-y-0.5">
                  {sourceItems.map((item, idx) => (
                    <a
                      key={`${item.link}-${idx}`}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block py-2 px-2 border-b border-border/30 last:border-0 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {item.pubDate && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(item.pubDate), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors ml-auto shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
