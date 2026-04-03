import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Hash, Send, Save, Palette, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useCreateSocialPost, useSocialAccounts, CONTENT_TYPE_OPTIONS } from '@/hooks/useSocialMedia';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#14b8a6'];

export function CreatePostModal({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('post');
  const [platform, setPlatform] = useState('instagram');
  const [postType, setPostType] = useState('feed');
  const [accountId, setAccountId] = useState('');
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('12:00');
  const [hashtags, setHashtags] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const { data: accounts } = useSocialAccounts();
  const { data: clients } = useClients();
  const createPost = useCreateSocialPost();

  // Auto-set platform when content type changes
  const selectedType = CONTENT_TYPE_OPTIONS.find(t => t.value === contentType);
  useEffect(() => {
    if (selectedType?.platforms?.length) {
      setPlatform(selectedType.platforms[0]);
    }
  }, [contentType]);

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => {
      const url = URL.createObjectURL(f);
      setMediaPreviews(prev => [...prev, url]);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (idx: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
    setMediaPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (status: 'draft' | 'scheduled') => {
    setUploading(true);
    try {
      let scheduledAt: string | undefined;
      if (status === 'scheduled' && date) {
        const [h, m] = time.split(':').map(Number);
        const d = new Date(date);
        d.setHours(h, m, 0, 0);
        scheduledAt = d.toISOString();
      }

      // Upload media files
      const mediaUrls: string[] = [];
      if (user && mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const ext = file.name.split('.').pop();
          const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage.from('social-media').upload(path, file);
          if (error) throw error;
          const { data: urlData } = supabase.storage.from('social-media').getPublicUrl(path);
          mediaUrls.push(urlData.publicUrl);
        }
      }

      createPost.mutate({
        title: title || undefined,
        content,
        content_type: contentType,
        platform,
        post_type: postType,
        social_account_id: accountId || undefined,
        client_id: clientId || undefined,
        scheduled_at: scheduledAt,
        hashtags: hashtags ? hashtags.split(/[\s,]+/).filter(Boolean).map(h => h.startsWith('#') ? h : `#${h}`) : [],
        status,
        notes: notes || undefined,
        color,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      }, {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setContent(''); setContentType('post'); setPlatform('instagram'); setPostType('feed');
    setAccountId(''); setClientId(''); setDate(undefined); setTime('12:00'); setHashtags(''); setNotes(''); setColor('#6366f1');
    setMediaFiles([]); setMediaPreviews([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Novo Conteúdo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content type selector */}
          <div>
            <Label>Tipo de Conteúdo</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {CONTENT_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setContentType(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    contentType === opt.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested platforms */}
          {selectedType && selectedType.platforms.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Plataformas sugeridas para {selectedType.label}</Label>
              <div className="flex gap-1.5 mt-1">
                {selectedType.platforms.map(p => (
                  <Badge
                    key={p}
                    variant={platform === p ? 'default' : 'outline'}
                    className="cursor-pointer capitalize text-xs"
                    onClick={() => setPlatform(p)}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Client selector */}
          {clients && clients.length > 0 && (
            <div>
              <Label>Cliente</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Vincular a um cliente..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Título (opcional)</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do conteúdo..." />
          </div>

          <div>
            <Label>Conteúdo / Legenda *</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Escreva a legenda ou descrição..." rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Plataforma</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formato</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="stories">Stories</SelectItem>
                  <SelectItem value="reels">Reels</SelectItem>
                  <SelectItem value="carousel">Carrossel</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="shorts">Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {accounts && accounts.length > 0 && (
            <div>
              <Label>Conta</Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger><SelectValue placeholder="Selecione a conta..." /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.account_name} ({a.platform})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data de publicação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left', !date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="p-3 pointer-events-auto" locale={ptBR} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="pl-10" />
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <Label className="flex items-center gap-1"><Palette className="w-3 h-3" /> Cor</Label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn('w-6 h-6 rounded-full border-2 transition-all', color === c ? 'border-foreground scale-110' : 'border-transparent')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Media upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Upload className="w-3 h-3" /> Mídia</Label>
            {mediaPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {mediaPreviews.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeMedia(i)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleMediaAdd} className="hidden" />
            <Button type="button" variant="outline" size="sm" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> Adicionar arquivos
            </Button>
          </div>

          <div>
            <Label className="flex items-center gap-1"><Hash className="w-3 h-3" /> Hashtags</Label>
            <Input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#marketing #social #design" />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas internas..." rows={2} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => handleSubmit('draft')} disabled={!content || createPost.isPending || uploading}>
              <Save className="w-4 h-4" /> Rascunho
            </Button>
            <Button className="flex-1 gap-2" onClick={() => handleSubmit('scheduled')} disabled={!content || !date || createPost.isPending || uploading}>
              <Send className="w-4 h-4" /> {uploading ? 'Enviando...' : 'Agendar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
