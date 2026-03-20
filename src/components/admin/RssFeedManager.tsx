import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Rss, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RssFeed {
  id: string;
  name: string;
  feed_url: string;
  is_active: boolean;
  created_at: string;
}

export function RssFeedManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [feedUrl, setFeedUrl] = useState('');

  const { data: feeds = [], isLoading } = useQuery({
    queryKey: ['rss-feeds-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RssFeed[];
    },
  });

  const addFeed = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('rss_feeds').insert({
        name: name.trim(),
        feed_url: feedUrl.trim(),
        created_by: user?.id || '',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds-admin'] });
      setName('');
      setFeedUrl('');
      toast.success('Feed adicionado!');
    },
    onError: (err: any) => toast.error(err.message || 'Erro ao adicionar feed.'),
  });

  const toggleFeed = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('rss_feeds').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rss-feeds-admin'] }),
  });

  const deleteFeed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rss_feeds').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-feeds-admin'] });
      toast.success('Feed removido!');
    },
  });

  const canAdd = name.trim().length > 0 && feedUrl.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
        <div>
          <Label className="text-xs">Nome</Label>
          <Input
            placeholder="Ex: G1 Tecnologia"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <Label className="text-xs">URL do Feed RSS</Label>
          <Input
            placeholder="https://g1.globo.com/rss/g1/tecnologia/"
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Use a URL do feed RSS (ex: /rss/), não a URL do site
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => addFeed.mutate()}
          disabled={!canAdd || addFeed.isPending}
          className="gap-1"
        >
          {addFeed.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-4 text-center">Carregando feeds...</div>
      ) : feeds.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Rss className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum feed RSS configurado</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione URLs de feeds RSS acima</p>
        </div>
      ) : (
        <div className="space-y-2">
          {feeds.map((feed) => (
            <Card key={feed.id} className="bg-muted/30">
              <CardContent className="p-3 flex items-center gap-3">
                <Rss className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{feed.name}</span>
                    <Badge variant={feed.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {feed.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <a
                    href={feed.feed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
                  >
                    {feed.feed_url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <Switch
                  checked={feed.is_active}
                  onCheckedChange={(checked) => toggleFeed.mutate({ id: feed.id, is_active: checked })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteFeed.mutate(feed.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
