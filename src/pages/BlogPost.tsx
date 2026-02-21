import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Tag, Clock, Star, MessageSquare, Lightbulb, FileText, Download, Copy, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBlogPost } from '@/hooks/useBlog';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/landing/Footer';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de, type Locale } from 'date-fns/locale';
import { toast } from 'sonner';

const dateLocales: Record<string, Locale> = { pt: ptBR, en: enUS, es, fr, de };

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function StarRating({ rating, onRate, interactive = true }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className="disabled:cursor-default transition-transform hover:scale-110"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language?.substring(0, 2) || 'pt';
  const { data: post, isLoading } = useBlogPost(slug || '');

  const [userRating, setUserRating] = useState(0);
  const [avgRating] = useState(5);
  const [ratingCount] = useState(2);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({ title: '', description: '', email: '' });
  const [sendingSuggestion, setSendingSuggestion] = useState(false);

  // Generate markdown content from the blog post content for the attachment preview
  const attachmentMarkdownContent = useMemo(() => {
    if (!post) return '';
    // Convert HTML content to a readable markdown-like text for the modal
    const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (!tempDiv) return post.content;
    tempDiv.innerHTML = post.content;
    
    let md = `# AI Hub - Guia de Implementação Multi-Provider\n\n`;
    md += `## Visão Geral\n\n`;
    md += `O AI Hub é uma solução centralizada para gerenciamento de múltiplos provedores de IA em aplicações vibecoding. Permite alternar entre provedores (Lovable Gateway, Google Gemini, OpenAI) sem alterações de código, com fallback automático e tracking de consumo.\n\n`;
    md += `## Principais Funcionalidades\n\n`;
    md += `- **Multi-Provider:** Suporte a múltiplos provedores de IA com configuração dinâmica\n`;
    md += `- **Fallback Automático:** Alternância automática para Lovable Gateway quando o provedor principal falhar\n`;
    md += `- **Tracking de Consumo:** Registro detalhado de tokens e custos estimados\n`;
    md += `- **Configuração Global:** Painel administrativo para gerenciamento centralizado\n\n`;
    md += `## Provedores Suportados\n\n`;
    md += `### Lovable Gateway (Incluído)\n`;
    md += `- Gemini 3 Flash Preview\n- Gemini 2.5 Flash\n- GPT-5\n\n`;
    md += `### Google Gemini\n`;
    md += `- Gemini 2.0 Flash\n- Gemini 1.5 Pro\n- Gemini 1.5 Flash\n\n`;
    md += `### OpenAI\n`;
    md += `- GPT-4o\n- GPT-4o Mini\n- GPT-4 Turbo\n\n`;
    md += `## Configuração\n\n`;
    md += `1. Acesse o painel admin\n`;
    md += `2. Navegue até "Configuração de IA"\n`;
    md += `3. Selecione o provedor ativo\n`;
    md += `4. Configure as chaves de API necessárias\n`;
    md += `5. Defina o modelo padrão\n\n`;
    md += `## Relatório de Consumo\n\n`;
    md += `O sistema registra automaticamente:\n- Data/Hora de cada geração\n- Provedor e modelo utilizados\n- Tokens de entrada e saída\n- Custo estimado\n- Status de fallback\n`;
    return md;
  }, [post]);

  const handleRate = (r: number) => {
    setUserRating(r);
    toast.success('Obrigado pela avaliação!', { description: `Você avaliou com ${r} estrela${r > 1 ? 's' : ''}.` });
  };

  const handleRemoveRating = () => {
    setUserRating(0);
    toast.info('Avaliação removida.');
  };

  const handleSendSuggestion = async () => {
    if (!suggestionForm.title.trim()) {
      toast.error('Preencha o título da sugestão.');
      return;
    }
    if (!suggestionForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suggestionForm.email)) {
      toast.error('Informe um email válido.');
      return;
    }
    setSendingSuggestion(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-suggestion', {
        body: {
          title: suggestionForm.title.trim(),
          description: suggestionForm.description.trim(),
          email: suggestionForm.email.trim(),
          postTitle: post?.title,
          postSlug: slug,
        },
      });
      if (error) throw error;
      toast.success('Sugestão enviada com sucesso!', { description: 'Obrigado pelo seu feedback!' });
      setSuggestionForm({ title: '', description: '', email: '' });
      setShowSuggestionModal(false);
    } catch (err: any) {
      toast.error('Erro ao enviar sugestão.', { description: err.message });
    } finally {
      setSendingSuggestion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <div className="pt-32 text-center text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <div className="pt-32 text-center">
          <p className="text-xl text-muted-foreground mb-4">{t('blog.postNotFound')}</p>
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.backToBlog')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <article className="pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t('blog.backToBlog')}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-3 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                {post.excerpt}
              </p>
            )}

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.published_at && format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: dateLocales[currentLocale] || ptBR })}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {post.views_count} visualizações
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {avgRating}.0 de 5
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readTime} min de leitura
              </span>
            </div>

            {/* Cover image - full width */}
            {post.cover_image && (
              <div className="rounded-2xl overflow-hidden mb-10 border border-border shadow-lg">
                <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover" />
              </div>
            )}

            {/* Tags */}
            {(post.tags?.length || post.blog_categories) && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {post.blog_categories && (
                  <Badge variant="secondary">{(post.blog_categories as any).name}</Badge>
                )}
                {post.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-4 prose-h2:py-1 prose-h2:text-xl
                prose-h3:text-primary/90 prose-h3:text-lg
                prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:shadow-sm
                prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                prose-li:marker:text-primary
                prose-strong:text-foreground
                [&_iframe]:rounded-xl [&_iframe]:shadow-lg [&_iframe]:border [&_iframe]:border-border"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Subtitle (segundo título destacado) */}
            {(post as any).subtitle && (
              <div className="mt-10 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold border-l-4 border-primary pl-4 py-1">
                  {(post as any).subtitle}
                </h2>
                {(post as any).secondary_text && (
                  <p className="mt-3 text-base text-muted-foreground leading-relaxed pl-5">
                    {(post as any).secondary_text}
                  </p>
                )}
              </div>
            )}

            {/* Secondary Image */}
            {(post as any).secondary_image && (
              <div className="rounded-2xl overflow-hidden mb-10 border border-border shadow-lg">
                <img src={(post as any).secondary_image} alt={(post as any).subtitle || 'Imagem secundária'} className="w-full h-auto object-cover" />
              </div>
            )}
          </motion.div>

          {/* Attachment / Download Section */}
          {(post as any).show_attachment && ((post as any).attachment_name || (post as any).attachment_url) && (
            <div className="mt-10 mb-8">
              <div className="flex items-center justify-between gap-4 flex-wrap border border-border rounded-full px-5 py-3 bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-sm">{(post as any).attachment_name || 'Anexo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="rounded-full px-5" onClick={() => setShowAttachmentModal(true)}>
                    <Eye className="w-4 h-4 mr-1.5" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-5"
                    onClick={() => {
                      const blob = new Blob([attachmentMarkdownContent], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = (post as any).attachment_name || 'attachment.md';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Baixar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Attachment Preview Modal */}
          <Dialog open={showAttachmentModal} onOpenChange={setShowAttachmentModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {(post as any).attachment_name || 'Anexo'}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="prose prose-sm dark:prose-invert max-w-none
                  prose-headings:font-bold
                  prose-h1:text-2xl prose-h1:mb-4
                  prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                  prose-li:marker:text-primary
                  prose-strong:text-foreground
                  whitespace-pre-wrap font-mono text-sm leading-relaxed"
                >
                  {attachmentMarkdownContent.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
                    if (line.startsWith('- **')) {
                      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
                      if (match) return <li key={i}><strong>{match[1]}:</strong> {match[2]}</li>;
                    }
                    if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(attachmentMarkdownContent);
                    toast.success('Conteúdo copiado!');
                  }}
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([attachmentMarkdownContent], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = (post as any).attachment_name || 'attachment.md';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Baixar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Rating Section */}
          <div className="border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4 mb-8">
            <h3 className="font-semibold text-lg">Avaliação do Tema</h3>

            {/* Average */}
            <div className="flex items-center justify-center gap-2">
              <StarRating rating={avgRating} interactive={false} />
              <span className="text-sm text-muted-foreground">
                {avgRating} de 5 · {ratingCount} avaliações
              </span>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-2">Este tema foi útil para você?</p>
              <p className="text-xs text-muted-foreground mb-3">Sua avaliação</p>
              <StarRating rating={userRating} onRate={handleRate} />
              {userRating > 0 && (
                <button
                  onClick={handleRemoveRating}
                  className="mt-2 text-xs text-destructive hover:underline"
                >
                  Remover avaliação
                </button>
              )}
            </div>
          </div>

          {/* Suggestion Button */}
          <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
            onClick={() => setShowSuggestionModal(true)}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Tem uma sugestão?</p>
                <p className="text-xs text-muted-foreground">Nos ajude a melhorar este conteúdo, sugira novos temas ou compartilhe sua opinião!</p>
              </div>
            </CardContent>
          </Card>

          {/* Suggestion Modal */}
          <Dialog open={showSuggestionModal} onOpenChange={setShowSuggestionModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Envie sua Sugestão
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Tem uma ideia de conteúdo ou melhorias? Adoraríamos ouvir você!
                </p>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título da Sugestão <span className="text-destructive">*</span></Label>
                  <Input
                    value={suggestionForm.title}
                    onChange={e => setSuggestionForm(p => ({ ...p, title: e.target.value }))}
                    placeholder={`Sugestão sobre: ${post?.title || ''}`}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={suggestionForm.description}
                    onChange={e => setSuggestionForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descreva sua sugestão com mais detalhes (opcional)"
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">Máximo de 2000 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label>Seu Email <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    value={suggestionForm.email}
                    onChange={e => setSuggestionForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-muted-foreground">Usado apenas para notificá-lo sobre atualizações</p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSendSuggestion}
                  disabled={sendingSuggestion}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendingSuggestion ? 'Enviando...' : 'Enviar Sugestão'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Back to blog */}
          <div className="mt-10 pt-8 border-t border-border">
            <Link to="/blog">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('blog.backToBlog')}
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
