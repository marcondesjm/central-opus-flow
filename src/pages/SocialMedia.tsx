import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CalendarDays, BarChart3, Users, Trash2, Instagram, Facebook, Linkedin, Twitter, Youtube, Video, BarChart, Filter } from 'lucide-react';
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

export default function SocialMedia() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addMetricOpen, setAddMetricOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [tab, setTab] = useState('calendar');
  const [filterClient, setFilterClient] = useState<string>('all');

  const { data: posts = [] } = useSocialPosts(filterClient !== 'all' ? { clientId: filterClient } : undefined);
  const { data: accounts = [] } = useSocialAccounts();
  const { data: clients = [] } = useClients();
  const deleteAccount = useDeleteSocialAccount();

  const statusCounts = {
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
    pending_approval: posts.filter(p => p.approval_status === 'pending' && p.status !== 'draft').length,
  };

  const handlePostClick = (post: SocialPost) => {
    setSelectedPost(post);
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
            <TabsTrigger value="metrics" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            <SocialCalendar posts={posts} onPostClick={handlePostClick} />
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
