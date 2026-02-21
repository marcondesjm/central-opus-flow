import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Tag, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBlogPost } from '@/hooks/useBlog';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/landing/Footer';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de, type Locale } from 'date-fns/locale';

const dateLocales: Record<string, Locale> = { pt: ptBR, en: enUS, es, fr, de };

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language?.substring(0, 2) || 'pt';
  const { data: post, isLoading } = useBlogPost(slug || '');

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
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {t('blog.backToBlog')}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
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

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{post.title}</h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.published_at && format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: dateLocales[currentLocale] || ptBR })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readTime} min {t('blog.readTime')}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.views_count} {t('blog.views')}
              </span>
            </div>

            {/* Cover image */}
            {post.cover_image && (
              <div className="rounded-2xl overflow-hidden mb-10">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>

          {/* Back to blog */}
          <div className="mt-12 pt-8 border-t border-border">
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
