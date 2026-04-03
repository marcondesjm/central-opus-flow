import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Upload, X, Clock } from 'lucide-react';
import { useCreateContentItem, ALL_CONTENT_TYPES, VIDEO_TYPES, IMAGE_TYPES, GENERIC_TYPES, CONTENT_CATEGORIES, type ContentChecklistItem } from '@/hooks/useContentItems';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
  onBack: () => void;
}

const PLATFORM_OPTIONS = ['Instagram', 'Facebook', 'Twitter/X', 'YouTube', 'TikTok', 'LinkedIn'];

const SUBTYPE_OPTIONS: Record<string, string[]> = {
  reels: ['Reels'],
  imagem_unica: ['Feed', 'Post'],
  carrossel: ['Carrossel'],
  stories: ['Story'],
  tiktok: ['TikTok'],
  youtube: ['Vídeo'],
  shorts: ['Shorts'],
  linkedin: ['Post', 'Artigo'],
  arte_design: ['Logo', 'Banner', 'Flyer', 'Card', 'Social Media'],
  branding: ['Manual de Marca', 'Identidade Visual', 'Papelaria'],
  copy_texto: ['Roteiro', 'Legenda', 'Blog', 'E-mail Marketing'],
  apresentacao: ['Pitch Deck', 'Institucional', 'Comercial'],
  servico: ['Entrega', 'Revisão', 'Suporte'],
  landing_page: ['One Page', 'Multi Page', 'Squeeze Page'],
  fotografia: ['Produto', 'Evento', 'Retrato', 'Institucional'],
};

export function ContentCreationModal({ open, onOpenChange, contentType, onBack }: Props) {
  const typeInfo = ALL_CONTENT_TYPES.find(t => t.value === contentType);
  const isVideo = VIDEO_TYPES.includes(contentType);
  const isImage = IMAGE_TYPES.includes(contentType);
  const isGeneric = GENERIC_TYPES.includes(contentType);
  const isCarousel = contentType === 'carrossel';
  const isStory = contentType === 'stories';

  const { user } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateContentItem();
  const { data: clients } = useClients();
  const { data: projects } = useProjects();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [briefing, setBriefing] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(contentType === 'stories' ? ['Instagram'] : []);
  const [scheduledDate, setScheduledDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [scheduledTime, setScheduledTime] = useState('00:00');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState('00:00');
  const [status, setStatus] = useState('draft');
  const [priority, setPriority] = useState('normal');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState(CONTENT_CATEGORIES[contentType] || '');
  const [subtype, setSubtype] = useState('');
  const [notes, setNotes] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [checklist, setChecklist] = useState<ContentChecklistItem[]>([]);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [uploading, setUploading] = useState(false);

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('social-media').upload(path, file);
      if (!error) {
        const { data: pub } = supabase.storage.from('social-media').getPublicUrl(path);
        urls.push(pub.publicUrl);
      }
    }
    setMediaUrls(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const addCheckItem = () => {
    if (!newCheckItem.trim()) return;
    setChecklist(prev => [...prev, { id: crypto.randomUUID(), text: newCheckItem.trim(), done: false }]);
    setNewCheckItem('');
  };

  const handleCreate = (asDraft: boolean) => {
    const cleanId = (v: string) => (!v || v === 'none') ? null : v;
    createMutation.mutate({
      content_type: contentType,
      title: title || null,
      description: description || null,
      briefing: briefing || null,
      media_urls: mediaUrls,
      cover_url: coverUrl || null,
      video_link: videoLink || null,
      platforms,
      scheduled_at: scheduledDate ? `${scheduledDate}T${scheduledTime}:00` : null,
      due_date: dueDate || null,
      due_time: dueTime || '00:00',
      status: asDraft ? 'draft' : status,
      priority,
      client_id: cleanId(clientId),
      project_id: cleanId(projectId),
      category: category || null,
      content_subtype: subtype || null,
      checklist,
      notes: notes || null,
    } as any, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const statusLabel: Record<string, string> = {
    draft: 'Rascunho', scheduled: 'Agendado', published: 'Publicado', approved: 'Aprovado', rejected: 'Rejeitado',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-card border-border">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <button onClick={onBack} className="p-1 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-primary">{typeInfo?.label}</span>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título do conteúdo..."
            className="flex-1 border-none bg-transparent text-lg font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0"
          />
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Left: Content area */}
          <div className="flex-1 p-6 space-y-5">
            {/* Video types */}
            {isVideo && (
              <>
                <div className="flex gap-4">
                  <div className="w-36">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">VÍDEO</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-[9/16] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-background"
                    >
                      {mediaUrls.length > 0 ? (
                        <div className="text-xs text-primary font-medium">✓ Enviado</div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">9:16 · Até 100MB</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="w-28">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">CAPA</p>
                    <button className="w-full aspect-[9/16] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-background">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Imagem de capa</span>
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">ROTEIRO / LEGENDA</p>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Gancho inicial, desenvolvimento, CTA final..." rows={4} className="resize-none" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">BRIEFING / REFERÊNCIAS</p>
                      <Textarea value={briefing} onChange={e => setBriefing(e.target.value)} placeholder="Links de referência, inspirações, observações..." rows={3} className="resize-none" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>🔗 ou cole o link do vídeo</span>
                  <Input value={videoLink} onChange={e => setVideoLink(e.target.value)} placeholder="https://drive.google.co" className="max-w-xs h-8 text-xs" />
                </div>
              </>
            )}

            {/* Story */}
            {isStory && (
              <>
                <div className="flex gap-4">
                  <div className="w-28">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">STORY</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-[9/16] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-background"
                    >
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Envie o story (9:16)</span>
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">TEXTO DO STORY</p>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Texto, enquete, CTA..." rows={3} className="resize-none" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">BRIEFING</p>
                      <Textarea value={briefing} onChange={e => setBriefing(e.target.value)} placeholder="Observações, referências..." rows={3} className="resize-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Single image */}
            {contentType === 'imagem_unica' && (
              <>
                <div className="flex gap-4">
                  <div className="w-36">
                    <div className="flex items-center gap-1 mb-2">
                      <p className="text-xs font-semibold text-muted-foreground">IMAGEM</p>
                      <div className="flex gap-1 ml-2">
                        {['4:5', '1:1', '16:9', '9:16'].map(r => (
                          <span key={r} className="px-1.5 py-0.5 text-[9px] rounded bg-muted text-muted-foreground">{r}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-background"
                    >
                      {mediaUrls.length > 0 ? (
                        <img src={mediaUrls[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Envie a imagem</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">LEGENDA</p>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Escreva a legenda do post..." rows={4} className="resize-none" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">BRIEFING / REFERÊNCIAS</p>
                      <Textarea value={briefing} onChange={e => setBriefing(e.target.value)} placeholder="Detalhes, referências, observações..." rows={3} className="resize-none" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Carousel */}
            {isCarousel && (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">PÁGINAS DO CARROSSEL ({mediaUrls.length})</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-background"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Envie as páginas</span>
                  </button>
                  {mediaUrls.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                      {mediaUrls.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">LEGENDA</p>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Escreva a legenda do carrossel..." rows={4} className="resize-none" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">BRIEFING / REFERÊNCIAS</p>
                  <Textarea value={briefing} onChange={e => setBriefing(e.target.value)} placeholder="Detalhes, referências..." rows={3} className="resize-none" />
                </div>
              </>
            )}

            {/* Generic types (arte, branding, copy, etc.) */}
            {isGeneric && (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">DESCRIÇÃO</p>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes do conteúdo, briefing, referências..." rows={4} className="resize-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">ANEXOS ({mediaUrls.length})</p>
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Adicionar
                    </button>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-background"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Arraste ou clique para adicionar</span>
                  </button>
                </div>
              </>
            )}

            {/* Platform selection (for social types) */}
            {!isGeneric && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">PUBLICAR EM</span>
                {PLATFORM_OPTIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      platforms.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Schedule */}
            {!isGeneric && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">📅 Data de Publicação</span>
                  <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="h-8 w-36 text-xs" />
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Horário</span>
                  <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="h-8 w-24 text-xs" />
                </div>
              </div>
            )}

            {/* Checklist */}
            <div className="border border-border rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Checklist</p>
              {checklist.map((item, i) => (
                <div key={item.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => setChecklist(prev => prev.map((c, idx) => idx === i ? { ...c, done: !c.done } : c))}
                    className="rounded"
                  />
                  <span className={`text-sm flex-1 ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
                  <button onClick={() => setChecklist(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newCheckItem}
                  onChange={e => setNewCheckItem(e.target.value)}
                  placeholder="Adicionar item..."
                  className="flex-1 h-8 text-sm"
                  onKeyDown={e => e.key === 'Enter' && addCheckItem()}
                />
                <button onClick={addCheckItem} className="p-1 hover:bg-accent rounded transition-colors">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-border p-5 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">⚙️ Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabel).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">👤 Cliente</label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">📁 Projeto</label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projects?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">🏷️ Prioridade</label>
              <div className="flex gap-1">
                {['urgent', 'high', 'normal', 'low'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      priority === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {{ urgent: 'Urgente', high: 'Alta', normal: 'Normal', low: 'Baixa' }[p]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">📅 Data de Entrega</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-9 text-sm" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">🕐 Horário</label>
              <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="h-9 text-sm" />
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">📂 Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Social Media', 'Vídeo', 'Arte / Design', 'Branding', 'Copy / Texto', 'Apresentação', 'Serviço', 'Landing Page', 'Fotografia'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">🔖 Tipo</label>
              <Select value={subtype} onValueChange={setSubtype}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {(SUBTYPE_OPTIONS[contentType] || []).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">📝 Notas Internas</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas visíveis apenas para a equipe..." rows={3} className="resize-none text-sm" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="outline" onClick={() => handleCreate(true)} disabled={createMutation.isPending}>Salvar Rascunho</Button>
          <Button onClick={() => handleCreate(false)} disabled={createMutation.isPending} className="bg-pink-600 hover:bg-pink-700 text-white">Criar</Button>
        </div>

        <input ref={fileInputRef} type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleUpload} />
      </DialogContent>
    </Dialog>
  );
}
