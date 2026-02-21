import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Calendar, Eye, Tag, ArrowRight, FolderKanban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBlogPosts, useBlogCategories } from '@/hooks/useBlog';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/landing/Footer';
import { format } from 'date-fns';
import { ptBR, enUS, es, fr, de, type Locale } from 'date-fns/locale';

const dateLocales: Record<string, Locale> = { pt: ptBR, en: enUS, es, fr, de };

export default function Blog() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const currentLocale = i18n.language?.substring(0, 2) || 'pt';
  const { data: posts, isLoading } = useBlogPosts(currentLocale, undefined, search || undefined);
  const { data: categories } = useBlogCategories();

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!selectedCategory) return posts;
    return posts.filter(p => p.blog_categories?.slug === selectedCategory);
  }, [posts, selectedCategory]);

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{t('blog.title')}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('blog.subtitle')}</p>
          </motion.div>

          {/* Search + Categories */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('blog.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                {t('blog.allCategories')}
              </Button>
              {categories?.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-20 text-muted-foreground">{t('common.loading')}</div>
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">{t('blog.noPosts')}</p>
            </div>
          )}

          {/* Featured Post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link to={`/blog/${featuredPost.slug}`} className="block group mb-12">
                <div className="relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors">
                  {featuredPost.cover_image && (
                    <div className="aspect-[2/1] overflow-hidden">
                      <img
                        src={featuredPost.cover_image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {featuredPost.blog_categories && (
                        <Badge variant="secondary">{featuredPost.blog_categories.name}</Badge>
                      )}
                      {featuredPost.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.published_at && format(new Date(featuredPost.published_at), 'dd MMM yyyy', { locale: dateLocales[currentLocale] || ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {featuredPost.views_count} {t('blog.views')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Other Posts Grid */}
          {otherPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link to={`/blog/${post.slug}`} className="block group h-full">
                    <div className="rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors h-full flex flex-col">
                      {post.cover_image && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {post.blog_categories && (
                            <Badge variant="secondary" className="text-xs">{post.blog_categories.name}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.published_at && format(new Date(post.published_at), 'dd MMM yyyy', { locale: dateLocales[currentLocale] || ptBR })}
                          </span>
                          <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                            {t('blog.readMore')} <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
