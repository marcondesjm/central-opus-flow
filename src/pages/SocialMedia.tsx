import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, CalendarDays, BarChart3, Users, Trash2, Instagram, Facebook, Linkedin, Twitter, Youtube, Video, BarChart, Filter, User, List, Calendar } from 'lucide-react';
import { useSocialPosts, useSocialAccounts, useDeleteSocialAccount, SocialPost } from '@/hooks/useSocialMedia';
import { useClients } from '@/hooks/useClients';
import { SocialCalendar } from '@/components/social/SocialCalendar';
import { SocialMetricsDashboard } from '@/components/social/SocialMetricsDashboard';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { AddAccountModal } from '@/components/social/AddAccountModal';
import { AddMetricModal } from '@/components/social/AddMetricModal';
import { PostDetailModal } from '@/components/social/PostDetailModal';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const platformIcons: Record<string, any> = {
  instagram: Instagram, facebook: Facebook, linkedin: Linkedin,
  twitter: Twitter, youtube: Youtube, tiktok: Video,
};

const platformColors: Record<string, string> = {
  instagram: 'from-pink-500 to-purple-500',
  facebook: 'from-blue-600 to-blue-400',
  linkedin: 'from-sky-600 to-sky-400',
  twitter: 'from-slate-700 to-slate-500',
  youtube: 'from-red-600 to-red-400',
  tiktok: 'from-purple-600 to-pink-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  published: 'Publicado',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-primary/20 text-primary',
  published: 'bg-emerald-500/20 text-emerald-600',
};

export default function SocialMedia() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addMetricOpen, setAddMetricOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Always derive selectedPost from fresh query data
  const selectedPost = useMemo(() => {
    if (!selectedPostId || !allPosts) return null;
    return allPosts.find(p => p.id === selectedPostId) || null;
  }, [selectedPostId, allPosts]);
  const [tab, setTab] = useState('calendar');
  const [filterClient, setFilterClient] = useState<string>('all');

  const { data: allPosts = [] } = useSocialPosts();
  const filteredPosts = filterClient !== 'all' ? allPosts.filter(p => p.client_id === filterClient) : allPosts;
  const { data: accounts = [] } = useSocialAccounts();
  const { data: clients = [] } = useClients();
  const deleteAccount = useDeleteSocialAccount();

  const statusCounts = {
    draft: allPosts.filter(p => p.status === 'draft').length,
    scheduled: allPosts.filter(p => p.status === 'scheduled').length,
    published: allPosts.filter(p => p.status === 'published').length,
    pending_approval: allPosts.filter(p => p.approval_status === 'pending' && p.status !== 'draft').length,
  };

  // Group posts by client for the accordion view
  const postsByClient = useMemo(() => {
    const groups: Record<string, { clientName: string; clientId: string; posts: SocialPost[] }> = {};
    
    allPosts.forEach(post => {
      const clientKey = post.client_id || '__no_client__';
      const clientName = post.financial_clients?.name || 'Sem cliente';
      if (!groups[clientKey]) {
        groups[clientKey] = { clientName, clientId: clientKey, posts: [] };
      }
      groups[clientKey].posts.push(post);
    });

    // Sort: named clients first, "Sem cliente" last
    return Object.values(groups).sort((a, b) => {
      if (a.clientId === '__no_client__') return 1;
      if (b.clientId === '__no_client__') return -1;
      return a.clientName.localeCompare(b.clientName);
    });
  }, [allPosts]);

  const handlePostClick = (post: SocialPost) => {
    setSelectedPostId(post.id);
    setDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 lg:pb-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Conteúdos</h1>
            <p className="text-sm text-muted-foreground">Gerencie conteúdos, agendamentos e relatórios das redes sociais</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setAddAccountOpen(true)}>
              <Users className="w-4 h-4" /> Conta
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setAddMetricOpen(true)}>
              <BarChart className="w-4 h-4" /> Métricas
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setCreatePostOpen(true)}>
              <Plus className="w-4 h-4" /> Novo Conteúdo
            </Button>
          </div>
        </div>

        {/* Quick stats + Client filter */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className="gap-1.5 py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" /> {statusCounts.draft} Rascunhos
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-primary" /> {statusCounts.scheduled} Agendados
            </Badge>
            <Badge variant="outline" className="gap-1.5 py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {statusCounts.published} Publicados
            </Badge>
            {statusCounts.pending_approval > 0 && (
              <Badge variant="outline" className="gap-1.5 py-1 px-3 border-amber-500/50">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {statusCounts.pending_approval} Aguardando aprovação
              </Badge>
            )}
          </div>

          {clients.length > 0 && (
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Accounts */}
        {accounts.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {accounts.map(account => {
              const Icon = platformIcons[account.platform] || Instagram;
              return (
                <Card key={account.id} className="flex-shrink-0 min-w-[180px]">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white', platformColors[account.platform] || 'from-gray-500 to-gray-400')}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{account.account_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{account.platform}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteAccount.mutate(account.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="w-4 h-4" /> Calendário
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <User className="w-4 h-4" /> Por Cliente
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            <SocialCalendar posts={filteredPosts} onPostClick={handlePostClick} />
          </TabsContent>

          <TabsContent value="clients" className="mt-4">
            {postsByClient.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
                <p className="text-lg font-medium text-muted-foreground mb-2">Nenhum conteúdo cadastrado</p>
                <p className="text-sm text-muted-foreground mb-4">Crie seu primeiro conteúdo para começar</p>
                <Button onClick={() => setCreatePostOpen(true)} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Novo Conteúdo
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {postsByClient.map(group => {
                  const draftCount = group.posts.filter(p => p.status === 'draft').length;
                  const scheduledCount = group.posts.filter(p => p.status === 'scheduled').length;
                  const publishedCount = group.posts.filter(p => p.status === 'published').length;

                  return (
                    <AccordionItem key={group.clientId} value={group.clientId} className="border border-border rounded-xl overflow-hidden bg-card">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/30">
                        <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{group.clientName}</p>
                            <p className="text-xs text-muted-foreground">{group.posts.length} conteúdo{group.posts.length !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex gap-2 mr-2 flex-shrink-0">
                            {draftCount > 0 && (
                              <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">{draftCount} rascunho{draftCount > 1 ? 's' : ''}</Badge>
                            )}
                            {scheduledCount > 0 && (
                              <Badge variant="secondary" className="text-[10px] bg-primary/20 text-primary">{scheduledCount} agendado{scheduledCount > 1 ? 's' : ''}</Badge>
                            )}
                            {publishedCount > 0 && (
                              <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-600">{publishedCount} publicado{publishedCount > 1 ? 's' : ''}</Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <div className="space-y-2 pt-1">
                          {group.posts.map(post => {
                            const PlatformIcon = platformIcons[post.platform] || Instagram;
                            return (
                              <div
                                key={post.id}
                                onClick={() => handlePostClick(post)}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors cursor-pointer group"
                              >
                                <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white flex-shrink-0', platformColors[post.platform] || 'from-gray-500 to-gray-400')}>
                                  <PlatformIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{post.title || post.content.slice(0, 40) || 'Sem título'}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="capitalize">{post.platform}</span>
                                    <span>· {post.content_type}</span>
                                    {post.scheduled_at && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(post.scheduled_at), 'dd/MM/yyyy HH:mm')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="secondary" className={cn('text-[10px] flex-shrink-0', statusColors[post.status] || '')}>
                                  {statusLabels[post.status] || post.status}
                                </Badge>
                                {post.approval_status === 'pending' && (
                                  <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-500 flex-shrink-0">Aprovação</Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            <SocialMetricsDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <CreatePostModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
      <AddAccountModal open={addAccountOpen} onOpenChange={setAddAccountOpen} />
      <AddMetricModal open={addMetricOpen} onOpenChange={setAddMetricOpen} />
      <PostDetailModal post={selectedPost} open={detailOpen} onOpenChange={setDetailOpen} />
    </AppLayout>
  );
}
