import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Globe,
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Code, Quote, Image as ImageIcon, Link2, FileText, Upload, X, ExternalLink,
  Highlighter, Type, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useAdminBlogPosts,
  useBlogCategories,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useCreateBlogCategory,
  useDeleteBlogCategory,
  uploadBlogImage,
  getBlogImageUrl,
  useBlogPostSections,
  saveBlogPostSections,
  type BlogPost,
} from '@/hooks/useBlog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

const LOCALES = [
  { value: 'pt', label: '🇧🇷 Português' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'de', label: '🇩🇪 Deutsch' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ============================================================================
// Rich Text Toolbar
// ============================================================================

interface ToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  content: string;
  onChange: (content: string) => void;
  onImageInsert: () => void;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

function RichToolbar({ textareaRef, content, onChange, onImageInsert }: ToolbarProps) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end) || 'texto';
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end);
    onChange(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }, [textareaRef, content, onChange]);

  const insertAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const newContent = content.substring(0, start) + text + content.substring(start);
    onChange(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  }, [textareaRef, content, onChange]);

  const fonts = [
    { name: 'Padrão (System)', value: '' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  ];

  const highlightColors = [
    { name: 'Amarelo', value: '#fef08a', textColor: '#000' },
    { name: 'Verde', value: '#bbf7d0', textColor: '#000' },
    { name: 'Azul', value: '#bfdbfe', textColor: '#000' },
    { name: 'Rosa', value: '#fbcfe8', textColor: '#000' },
    { name: 'Laranja', value: '#fed7aa', textColor: '#000' },
    { name: 'Roxo', value: '#e9d5ff', textColor: '#000' },
  ];

  const tools = [
    { icon: Bold, label: 'Negrito', action: () => wrapSelection('<strong>', '</strong>') },
    { icon: Italic, label: 'Itálico', action: () => wrapSelection('<em>', '</em>') },
    { icon: Heading1, label: 'H1', action: () => wrapSelection('<h1>', '</h1>') },
    { icon: Heading2, label: 'H2', action: () => wrapSelection('<h2>', '</h2>') },
    { icon: Heading3, label: 'H3', action: () => wrapSelection('<h3>', '</h3>') },
    null, // separator
    { icon: List, label: 'Lista', action: () => insertAtCursor('\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n') },
    { icon: ListOrdered, label: 'Lista Num.', action: () => insertAtCursor('\n<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ol>\n') },
    { icon: Quote, label: 'Citação', action: () => wrapSelection('<blockquote>', '</blockquote>') },
    { icon: Code, label: 'Código', action: () => wrapSelection('<pre><code>', '</code></pre>') },
    null, // separator
    { icon: ImageIcon, label: 'Imagem', action: onImageInsert },
    { icon: Video, label: 'Vídeo (YouTube)', action: () => { setShowVideoInput(!showVideoInput); setShowFontMenu(false); setShowHighlightMenu(false); } },
    { icon: Link2, label: 'Link', action: () => wrapSelection('<a href="URL">', '</a>') },
  ];

  return (
    <div className="relative flex flex-wrap items-center gap-0.5 p-2 bg-muted/50 border border-border rounded-t-lg">
      {tools.map((tool, i) => {
        if (!tool) return <Separator key={i} orientation="vertical" className="h-6 mx-1" />;
        const Icon = tool.icon;
        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={tool.action}
              >
                <Icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">{tool.label}</TooltipContent>
          </Tooltip>
        );
      })}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Font selector */}
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1"
              onClick={() => { setShowFontMenu(!showFontMenu); setShowHighlightMenu(false); }}
            >
              <Type className="w-4 h-4" />
              Fonte
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Escolher fonte</TooltipContent>
        </Tooltip>
        {showFontMenu && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[180px]">
            {fonts.map(font => (
              <button
                key={font.name}
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-accent transition-colors"
                style={{ fontFamily: font.value || 'inherit' }}
                onClick={() => {
                  if (font.value) {
                    wrapSelection(`<span style="font-family: ${font.value}">`, '</span>');
                  }
                  setShowFontMenu(false);
                }}
              >
                {font.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Highlight selector */}
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs gap-1"
              onClick={() => { setShowHighlightMenu(!showHighlightMenu); setShowFontMenu(false); }}
            >
              <Highlighter className="w-4 h-4" />
              Destacar
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Destacar texto</TooltipContent>
        </Tooltip>
        {showHighlightMenu && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-2 min-w-[160px]">
            <p className="text-xs text-muted-foreground mb-2 px-1">Cor do destaque</p>
            <div className="grid grid-cols-3 gap-1.5">
              {highlightColors.map(color => (
                <button
                  key={color.name}
                  type="button"
                  className="w-10 h-8 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => {
                    wrapSelection(`<mark style="background-color: ${color.value}; color: ${color.textColor}; padding: 2px 4px; border-radius: 3px;">`, '</mark>');
                    setShowHighlightMenu(false);
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              className="w-full mt-2 text-left px-2 py-1.5 text-xs rounded hover:bg-accent transition-colors text-muted-foreground"
              onClick={() => {
                wrapSelection('<mark>', '</mark>');
                setShowHighlightMenu(false);
              }}
            >
              Destaque padrão
            </button>
          </div>
        )}
      </div>

      {/* Video URL input */}
      {showVideoInput && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-3">
          <p className="text-xs text-muted-foreground mb-2">Cole a URL do YouTube</p>
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="h-8 text-sm"
            />
            <Button
              type="button"
              size="sm"
              className="h-8 px-3"
              onClick={() => {
                const id = extractYouTubeId(videoUrl);
                if (id) {
                  insertAtCursor(`\n<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div>\n`);
                  setVideoUrl('');
                  setShowVideoInput(false);
                } else if (videoUrl.trim()) {
                  // Generic video/iframe embed
                  insertAtCursor(`\n<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0"><iframe src="${videoUrl.trim()}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div>\n`);
                  setVideoUrl('');
                  setShowVideoInput(false);
                }
              }}
            >
              Inserir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Blog Manager
// ============================================================================

export function BlogManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: posts, isLoading } = useAdminBlogPosts();
  const { data: categories } = useBlogCategories();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const createCategory = useCreateBlogCategory();
  const deleteCategory = useDeleteBlogCategory();

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('blue');
  const [uploading, setUploading] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [editorTab, setEditorTab] = useState('editor');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inlineImageRef = useRef<HTMLInputElement>(null);
  const attachmentRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    subtitle: '',
    secondary_text: '',
    content: '',
    cover_image: '',
    secondary_image: '',
    category_id: '',
    locale: 'pt',
    tags: '',
    is_published: false,
    show_attachment: false,
    attachment_url: '',
    attachment_name: '',
  });

  const [sections, setSections] = useState<{ title: string; content: string }[]>([]);

  // Load sections when editing
  const { data: existingSections } = useBlogPostSections(editingPost?.id || '');

  // Sync sections when loaded from DB
  useEffect(() => {
    if (existingSections && existingSections.length > 0) {
      setSections(existingSections.map(s => ({ title: s.title, content: s.content })));
    }
  }, [existingSections]);

  const resetForm = () => {
    setForm({ title: '', slug: '', excerpt: '', subtitle: '', secondary_text: '', content: '', cover_image: '', secondary_image: '', category_id: '', locale: 'pt', tags: '', is_published: false, show_attachment: false, attachment_url: '', attachment_name: '' });
    setSections([]);
    setEditingPost(null);
    setIsCreating(false);
    setEditorTab('editor');
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      subtitle: (post as any).subtitle || '',
      secondary_text: (post as any).secondary_text || '',
      content: post.content,
      cover_image: post.cover_image || '',
      secondary_image: (post as any).secondary_image || '',
      category_id: post.category_id || '',
      locale: post.locale,
      tags: post.tags?.join(', ') || '',
      is_published: post.is_published,
      show_attachment: (post as any).show_attachment || false,
      attachment_url: (post as any).attachment_url || '',
      attachment_name: (post as any).attachment_name || '',
    });
    setIsCreating(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : slugify(title),
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data, error } = await uploadBlogImage(file);
      if (error) throw error;
      const url = getBlogImageUrl(data.path);
      setForm(prev => ({ ...prev, cover_image: url }));
      toast.success('Imagem de capa enviada!');
    } catch {
      toast.error('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    try {
      const { data, error } = await uploadBlogImage(file);
      if (error) throw error;
      const url = getBlogImageUrl(data.path);
      const imgTag = `\n<img src="${url}" alt="${file.name}" class="rounded-xl shadow-lg my-4 max-w-full" />\n`;
      const ta = textareaRef.current;
      if (ta) {
        const start = ta.selectionStart;
        const newContent = form.content.substring(0, start) + imgTag + form.content.substring(start);
        setForm(prev => ({ ...prev, content: newContent }));
      } else {
        setForm(prev => ({ ...prev, content: prev.content + imgTag }));
      }
      toast.success('Imagem inserida no conteúdo!');
    } catch {
      toast.error('Erro ao enviar imagem.');
    } finally {
      setUploadingInline(false);
      if (inlineImageRef.current) inlineImageRef.current.value = '';
    }
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data, error } = await uploadBlogImage(file);
      if (error) throw error;
      const url = getBlogImageUrl(data.path);
      setForm(prev => ({ ...prev, attachment_url: url, attachment_name: file.name }));
      toast.success('Anexo adicionado!');
    } catch {
      toast.error('Erro ao enviar anexo.');
    } finally {
      if (attachmentRef.current) attachmentRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Preencha título e conteúdo.');
      return;
    }

    const tagsArray = form.tags.split(',').map(s => s.trim()).filter(Boolean);
    const postData: any = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      subtitle: form.subtitle || null,
      secondary_text: form.secondary_text || null,
      content: form.content,
      cover_image: form.cover_image || null,
      secondary_image: form.secondary_image || null,
      category_id: form.category_id || null,
      locale: form.locale,
      tags: tagsArray,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      author_id: user?.id || '',
      show_attachment: form.show_attachment,
      attachment_url: form.attachment_url || null,
      attachment_name: form.attachment_name || null,
    };

    try {
      let postId = editingPost?.id;
      if (editingPost) {
        await updatePost.mutateAsync({ id: editingPost.id, ...postData });
        toast.success('Post atualizado!');
      } else {
        const created = await createPost.mutateAsync(postData);
        postId = created.id;
        toast.success('Post criado!');
      }

      // Save sections
      if (postId) {
        const validSections = sections.filter(s => s.title.trim() || s.content.trim());
        await saveBlogPostSections(postId, validSections.map((s, i) => ({ ...s, position: i })));
      }

      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta postagem?')) return;
    try {
      await deletePost.mutateAsync(id);
      toast.success('Post excluído!');
    } catch {
      toast.error('Erro ao excluir.');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    try {
      await createCategory.mutateAsync({ name: newCatName, slug: slugify(newCatName), color: newCatColor });
      toast.success('Categoria criada!');
      setNewCatName('');
      setShowCategoryDialog(false);
    } catch {
      toast.error('Erro ao criar categoria.');
    }
  };

  // Hidden file inputs
  const hiddenInputs = (
    <>
      <input ref={inlineImageRef} type="file" accept="image/*" className="hidden" onChange={handleInlineImageUpload} />
      <input ref={attachmentRef} type="file" className="hidden" onChange={handleAttachmentUpload} />
    </>
  );

  // ===== EDITOR VIEW =====
  if (isCreating) {
    return (
      <div className="space-y-6">
        {hiddenInputs}

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {editingPost ? 'Editar Postagem' : 'Nova Postagem'}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open(`/blog/${form.slug}`, '_blank')} disabled={!editingPost}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Ver no blog
            </Button>
            <Button variant="ghost" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>

        {/* Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Título da postagem" />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} />
          </div>
        </div>

        {/* Category, Language, Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.category_id} onValueChange={v => setForm(prev => ({ ...prev, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select value={form.locale} onValueChange={v => setForm(prev => ({ ...prev, locale: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCALES.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags (separar por vírgula)</Label>
            <Input value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="lovable, tutorial, dicas" />
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label>Resumo / Subtítulo</Label>
          <Textarea value={form.excerpt} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} rows={2} placeholder="Breve descrição que aparece no hero do post" />
        </div>

        {/* Dynamic Sections (Títulos e Textos extras) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Títulos e Textos Extras</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSections(prev => [...prev, { title: '', content: '' }])}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar seção
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Adicione títulos H2 destacados com textos descritivos que aparecem após o conteúdo principal</p>

          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-3 text-center border border-dashed border-border rounded-lg">
              Nenhuma seção extra. Clique em "Adicionar seção" para criar.
            </p>
          )}

          {sections.map((section, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Seção {idx + 1}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSections(prev => prev.filter((_, i) => i !== idx))}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <Input
                value={section.title}
                onChange={e => {
                  const val = e.target.value;
                  setSections(prev => prev.map((s, i) => i === idx ? { ...s, title: val } : s));
                }}
                placeholder={`Título ${idx + 1}`}
              />
              <Textarea
                value={section.content}
                onChange={e => {
                  const val = e.target.value;
                  setSections(prev => prev.map((s, i) => i === idx ? { ...s, content: val } : s));
                }}
                placeholder="Texto descritivo desta seção..."
                rows={3}
              />
            </div>
          ))}
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Imagem de Capa</Label>
          <div className="flex gap-3 items-center">
            <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
            {form.cover_image && (
              <div className="relative">
                <img src={form.cover_image} alt="cover" className="w-24 h-16 object-cover rounded border border-border" />
                <button className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground" onClick={() => setForm(prev => ({ ...prev, cover_image: '' }))}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Image */}
        <div className="space-y-2">
          <Label>Segunda Imagem (no corpo do texto)</Label>
          <div className="flex gap-3 items-center">
            <Input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const { data, error } = await uploadBlogImage(file);
                if (error) throw error;
                const url = getBlogImageUrl(data.path);
                setForm(prev => ({ ...prev, secondary_image: url }));
                toast.success('Segunda imagem enviada!');
              } catch {
                toast.error('Erro ao enviar imagem.');
              }
            }} />
            {form.secondary_image && (
              <div className="relative">
                <img src={form.secondary_image} alt="secondary" className="w-24 h-16 object-cover rounded border border-border" />
                <button className="absolute -top-1 -right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground" onClick={() => setForm(prev => ({ ...prev, secondary_image: '' }))}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Aparece abaixo do segundo título no post</p>
        </div>

        {/* Attachment */}
        <div className="space-y-2">
          <Label>Anexo (arquivo para download)</Label>
          {form.attachment_name ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <FileText className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{form.attachment_name}</p>
                <p className="text-xs text-muted-foreground truncate">{form.attachment_url}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm(prev => ({ ...prev, attachment_url: '', attachment_name: '' }))}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => attachmentRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Adicionar anexo
            </Button>
          )}
          {form.attachment_name && (
            <div className="flex items-center gap-3 mt-2">
              <Switch checked={form.show_attachment} onCheckedChange={v => setForm(prev => ({ ...prev, show_attachment: v }))} />
              <Label className="text-sm">Exibir botões "Visualizar" e "Baixar" no post</Label>
            </div>
          )}
        </div>

        {/* Content Editor with Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Conteúdo</Label>
            <Tabs value={editorTab} onValueChange={setEditorTab}>
              <TabsList className="h-8">
                <TabsTrigger value="editor" className="text-xs h-7 px-3">Editor</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs h-7 px-3">Preview</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {editorTab === 'editor' ? (
            <div>
              <RichToolbar
                textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
                content={form.content}
                onChange={content => setForm(prev => ({ ...prev, content }))}
                onImageInsert={() => inlineImageRef.current?.click()}
              />
              <Textarea
                ref={textareaRef}
                value={form.content}
                onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                rows={20}
                className="font-mono text-sm rounded-t-none border-t-0"
                placeholder="Escreva o conteúdo em HTML..."
              />
              {uploadingInline && (
                <p className="text-xs text-muted-foreground mt-1 animate-pulse">Enviando imagem...</p>
              )}
            </div>
          ) : (
            <div className="border border-border rounded-lg p-6 min-h-[400px] bg-card">
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-4 prose-h2:py-1
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl
                  prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                  prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                  prose-li:marker:text-primary prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-muted-foreground">Preview vazio...</p>' }}
              />
            </div>
          )}
        </div>

        {/* Publish & Save */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_published} onCheckedChange={v => setForm(prev => ({ ...prev, is_published: v }))} />
            <Label>Publicar</Label>
          </div>
          <Button onClick={handleSave} disabled={createPost.isPending || updatePost.isPending}>
            Salvar postagem
          </Button>
        </div>
      </div>
    );
  }

  // ===== LIST VIEW =====
  return (
    <div className="space-y-6">
      {hiddenInputs}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Blog</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCategoryDialog(true)}>
            Categorias
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Nova postagem
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {posts?.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
              {post.cover_image && (
                <img src={post.cover_image} alt="" className="w-16 h-10 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{post.title}</p>
                  <Badge variant={post.is_published ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {post.is_published ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {post.is_published ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <Badge variant="outline" className="text-xs shrink-0">
                    <Globe className="w-3 h-3 mr-1" />
                    {post.locale.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(post.created_at), 'dd/MM/yyyy')}
                  {post.blog_categories && ` • ${(post.blog_categories as any).name}`}
                  {(post as any).attachment_name && ` • 📎 ${(post as any).attachment_name}`}
                </p>
              </div>
              <div className="flex gap-1">
                {post.is_published && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver no blog</TooltipContent>
                  </Tooltip>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {posts?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhuma postagem ainda.</p>
          )}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nome da categoria" />
              <Button onClick={handleCreateCategory} disabled={!newCatName}>Criar</Button>
            </div>
            <div className="space-y-2">
              {categories?.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 rounded border border-border">
                  <span>{cat.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory.mutate(cat.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
