import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSocialMetric, useSocialAccounts, useSocialPosts } from '@/hooks/useSocialMedia';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMetricModal({ open, onOpenChange }: Props) {
  const [postId, setPostId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [likes, setLikes] = useState('0');
  const [comments, setComments] = useState('0');
  const [shares, setShares] = useState('0');
  const [reach, setReach] = useState('0');
  const [impressions, setImpressions] = useState('0');
  const [saves, setSaves] = useState('0');
  const [clicks, setClicks] = useState('0');
  const [engagementRate, setEngagementRate] = useState('0');
  const [followers, setFollowers] = useState('0');

  const { data: accounts } = useSocialAccounts();
  const { data: posts } = useSocialPosts();
  const createMetric = useCreateSocialMetric();

  const handleSubmit = () => {
    createMetric.mutate({
      post_id: postId || undefined,
      social_account_id: accountId || undefined,
      likes: parseInt(likes) || 0,
      comments: parseInt(comments) || 0,
      shares: parseInt(shares) || 0,
      reach: parseInt(reach) || 0,
      impressions: parseInt(impressions) || 0,
      saves: parseInt(saves) || 0,
      clicks: parseInt(clicks) || 0,
      engagement_rate: parseFloat(engagementRate) || 0,
      followers_count: parseInt(followers) || 0,
    }, {
      onSuccess: () => { onOpenChange(false); resetForm(); },
    });
  };

  const resetForm = () => {
    setPostId(''); setAccountId(''); setLikes('0'); setComments('0');
    setShares('0'); setReach('0'); setImpressions('0'); setSaves('0');
    setClicks('0'); setEngagementRate('0'); setFollowers('0');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Métricas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {accounts && accounts.length > 0 && (
            <div>
              <Label>Conta</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="Selecionar conta..." /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.account_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {posts && posts.length > 0 && (
            <div>
              <Label>Post (opcional)</Label>
              <Select value={postId} onValueChange={setPostId}>
                <SelectTrigger><SelectValue placeholder="Vincular a um post..." /></SelectTrigger>
                <SelectContent>
                  {posts.map(p => <SelectItem key={p.id} value={p.id}>{p.title || p.content.slice(0, 30)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Curtidas</Label><Input type="number" value={likes} onChange={e => setLikes(e.target.value)} /></div>
            <div><Label>Comentários</Label><Input type="number" value={comments} onChange={e => setComments(e.target.value)} /></div>
            <div><Label>Compartilhamentos</Label><Input type="number" value={shares} onChange={e => setShares(e.target.value)} /></div>
            <div><Label>Alcance</Label><Input type="number" value={reach} onChange={e => setReach(e.target.value)} /></div>
            <div><Label>Impressões</Label><Input type="number" value={impressions} onChange={e => setImpressions(e.target.value)} /></div>
            <div><Label>Salvamentos</Label><Input type="number" value={saves} onChange={e => setSaves(e.target.value)} /></div>
            <div><Label>Cliques</Label><Input type="number" value={clicks} onChange={e => setClicks(e.target.value)} /></div>
            <div><Label>Engajamento (%)</Label><Input type="number" step="0.1" value={engagementRate} onChange={e => setEngagementRate(e.target.value)} /></div>
          </div>
          <div>
            <Label>Seguidores atuais</Label>
            <Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={createMetric.isPending}>
            Salvar Métricas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
