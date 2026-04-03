import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CheckCircle2, XCircle, Clock, Plus, Trash2, Send, Instagram, Facebook,
  Linkedin, Twitter, Youtube, Video, User, ListChecks, Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SocialPost, ChecklistItem, SubTask, useUpdateSocialPost, useDeleteSocialPost, CONTENT_TYPE_OPTIONS } from '@/hooks/useSocialMedia';

const platformIcons: Record<string, any> = {
  instagram: Instagram, facebook: Facebook, linkedin: Linkedin,
  twitter: Twitter, youtube: Youtube, tiktok: Video,
};

interface Props {
  post: SocialPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailModal({ post, open, onOpenChange }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const updatePost = useUpdateSocialPost();
  const deletePost = useDeleteSocialPost();

  if (!post) return null;

  const Icon = platformIcons[post.platform] || Instagram;
  const typeLabel = CONTENT_TYPE_OPTIONS.find(t => t.value === post.content_type)?.label || post.content_type;

  // Checklist handlers
  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const item: ChecklistItem = { id: crypto.randomUUID(), text: newCheckItem.trim(), done: false };
    updatePost.mutate({ id: post.id, checklist: [...post.checklist, item] });
    setNewCheckItem('');
  };

  const toggleCheckItem = (itemId: string) => {
    updatePost.mutate({
      id: post.id,
      checklist: post.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c),
    });
  };

  const removeCheckItem = (itemId: string) => {
    updatePost.mutate({ id: post.id, checklist: post.checklist.filter(c => c.id !== itemId) });
  };

  // Subtask handlers
  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const task: SubTask = { id: crypto.randomUUID(), title: newSubtask.trim(), done: false };
    updatePost.mutate({ id: post.id, subtasks: [...post.subtasks, task] });
    setNewSubtask('');
  };

  const toggleSubtask = (taskId: string) => {
    updatePost.mutate({
      id: post.id,
      subtasks: post.subtasks.map(s => s.id === taskId ? { ...s, done: !s.done } : s),
    });
  };

  const removeSubtask = (taskId: string) => {
    updatePost.mutate({ id: post.id, subtasks: post.subtasks.filter(s => s.id !== taskId) });
  };

  // Approval
  const handleApproval = (status: 'approved' | 'rejected') => {
    updatePost.mutate({
      id: post.id,
      approval_status: status,
      client_approved: status === 'approved',
      client_approved_at: status === 'approved' ? new Date().toISOString() : null,
      approval_notes: approvalNotes || null,
    });
    setApprovalNotes('');
  };

  // Status change
  const handleStatusChange = (status: string) => {
    updatePost.mutate({
      id: post.id,
      status,
      ...(status === 'published' ? { published_at: new Date().toISOString() } : {}),
    });
  };

  const handleDelete = () => {
    deletePost.mutate(post.id, { onSuccess: () => onOpenChange(false) });
  };

  const checklistProgress = post.checklist.length > 0
    ? Math.round((post.checklist.filter(c => c.done).length / post.checklist.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'overflow-y-auto',
        isFullscreen ? 'max-w-[95vw] max-h-[95vh] w-full h-full' : 'max-w-2xl max-h-[90vh]'
      )}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {post.title || 'Conteúdo sem título'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className={cn('space-y-6', isFullscreen && 'grid grid-cols-2 gap-6 space-y-0')}>
          {/* Left / Main content */}
          <div className="space-y-4">
            {/* Info badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">{typeLabel}</Badge>
              <Badge variant="outline" className="capitalize">{post.platform}</Badge>
              <Badge variant="outline">{post.post_type}</Badge>
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status}</Badge>
              {post.financial_clients && (
                <Badge variant="secondary" className="gap-1">
                  <User className="w-3 h-3" /> {post.financial_clients.name}
                </Badge>
              )}
              {post.color && (
                <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: post.color }} />
              )}
            </div>

            {/* Content */}
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.hashtags.map((h, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-primary">{h}</Badge>
                ))}
              </div>
            )}

            {/* Schedule info */}
            {post.scheduled_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Agendado para {format(new Date(post.scheduled_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            )}

            {/* Notes */}
            {post.notes && (
              <div>
                <Label className="text-xs text-muted-foreground">Observações</Label>
                <p className="text-sm mt-1">{post.notes}</p>
              </div>
            )}

            {/* Status actions */}
            <div>
              <Label>Alterar Status</Label>
              <Select value={post.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right / Checklist & Subtasks */}
          <div className="space-y-4">
            {/* Approval */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <Label className="font-medium">Aprovação do Cliente</Label>
              <div className="flex items-center gap-2">
                {post.approval_status === 'pending' && <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pendente</Badge>}
                {post.approval_status === 'approved' && <Badge className="gap-1 bg-emerald-500"><CheckCircle2 className="w-3 h-3" /> Aprovado</Badge>}
                {post.approval_status === 'rejected' && <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejeitado</Badge>}
              </div>
              {post.approval_notes && <p className="text-xs text-muted-foreground">{post.approval_notes}</p>}
              <Textarea
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                placeholder="Observações da aprovação..."
                rows={2}
                className="text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-emerald-600" onClick={() => handleApproval('approved')}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-destructive" onClick={() => handleApproval('rejected')}>
                  <XCircle className="w-3.5 h-3.5" /> Rejeitar
                </Button>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium flex items-center gap-1.5"><ListChecks className="w-4 h-4" /> Checklist</Label>
                {post.checklist.length > 0 && (
                  <span className="text-xs text-muted-foreground">{checklistProgress}%</span>
                )}
              </div>
              {post.checklist.length > 0 && (
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${checklistProgress}%` }} />
                </div>
              )}
              <div className="space-y-1">
                {post.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <Checkbox checked={item.done} onCheckedChange={() => toggleCheckItem(item.id)} />
                    <span className={cn('text-sm flex-1', item.done && 'line-through text-muted-foreground')}>{item.text}</span>
                    <button onClick={() => removeCheckItem(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newCheckItem}
                  onChange={e => setNewCheckItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                  placeholder="Novo item..."
                  className="text-xs h-8"
                />
                <Button size="sm" variant="outline" onClick={addCheckItem} className="h-8 px-2">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-2">
              <Label className="font-medium">Subtarefas</Label>
              <div className="space-y-1">
                {post.subtasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 group">
                    <Checkbox checked={task.done} onCheckedChange={() => toggleSubtask(task.id)} />
                    <span className={cn('text-sm flex-1', task.done && 'line-through text-muted-foreground')}>{task.title}</span>
                    <button onClick={() => removeSubtask(task.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSubtask()}
                  placeholder="Nova subtarefa..."
                  className="text-xs h-8"
                />
                <Button size="sm" variant="outline" onClick={addSubtask} className="h-8 px-2">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Delete */}
            <Button variant="destructive" size="sm" className="w-full gap-2" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" /> Excluir Conteúdo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
