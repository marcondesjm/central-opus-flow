import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Tag, Clock, Star, MessageSquare, Lightbulb, FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBlogPost } from '@/hooks/useBlog';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/landing/Footer';
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

  const handleRate = (r: number) => {
    setUserRating(r);
    toast.success('Obrigado pela avaliação!', { description: `Você avaliou com ${r} estrela${r > 1 ? 's' : ''}.` });
  };

  const handleRemoveRating = () => {
    setUserRating(0);
    toast.info('Avaliação removida.');
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
            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.published_at && format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: dateLocales[currentLocale] || ptBR })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views_count} visualizações
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {avgRating} de 5
              </span>
            </div>

            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border">
              <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
                {/* Logo / Icon */}
                {post.cover_image && (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-lg border border-border flex-shrink-0">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="text-center sm:text-left flex-1">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
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

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-2 leading-tight">
                    {post.title}
                  </h1>

                  {post.excerpt && (
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{readTime} min de leitura</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content with styled sections */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-4 prose-h2:py-1 prose-h2:text-xl
                prose-h3:text-primary/90 prose-h3:text-lg
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:shadow-sm
                prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                prose-li:marker:text-primary
                prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>

          {/* Attachment / Download Section */}
          {((post as any).attachment_name || (post as any).attachment_url) && (
            <div className="mt-10 mb-8">
              <div className="flex items-center justify-between gap-4 flex-wrap border border-border rounded-full px-5 py-3 bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-sm">{(post as any).attachment_name || 'Anexo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="rounded-full px-5" onClick={() => window.open((post as any).attachment_url, '_blank')}>
                    <Eye className="w-4 h-4 mr-1.5" />
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full px-5" asChild>
                    <a href={(post as any).attachment_url} download={(post as any).attachment_name}>
                      <Download className="w-4 h-4 mr-1.5" />
                      Baixar
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

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

          {/* Suggestion / Feedback Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Card className="flex-1 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => toast.info('Obrigado!', { description: 'Sua sugestão será analisada.' })}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Tem uma sugestão?</p>
                  <p className="text-xs text-muted-foreground">Nos ajude a melhorar este conteúdo ou sugira novos temas!</p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
              onClick={() => toast.info('Obrigado!', { description: 'Entraremos em contato em breve.' })}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Enviar Sugestão</p>
                  <p className="text-xs text-muted-foreground">Compartilhe sua opinião sobre este artigo.</p>
                </div>
              </CardContent>
            </Card>
          </div>

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
