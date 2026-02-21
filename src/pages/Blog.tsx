import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Calendar, Eye, Tag, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLocale = i18n.language?.substring(0, 2) || 'pt';
  const { data: posts, isLoading } = useBlogPosts(currentLocale, undefined, search || undefined);
  const { data: categories } = useBlogCategories();

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!selectedCategory) return posts;
    return posts.filter(p => p.blog_categories?.slug === selectedCategory);
  }, [posts, selectedCategory]);

  // Featured posts for carousel (up to 6)
  const featuredPosts = filteredPosts.slice(0, 6);
  const otherPosts = filteredPosts.slice(6);

  // Carousel: show 2 at a time on desktop
  const maxIndex = Math.max(0, featuredPosts.length - 2);

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCarouselIndex(clamped);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.scrollWidth / featuredPosts.length;
      scrollRef.current.scrollTo({ left: cardWidth * clamped, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <section className="pt-28 pb-6 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Header - left aligned */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              {t('blog.badge', 'Central de Conhecimento')}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">
              Domine o <span className="text-primary">Lovable</span> e crie apps incríveis
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              {t('blog.subtitle')}
            </p>
          </motion.div>

          {/* Featured Carousel */}
          {!isLoading && featuredPosts.length > 0 && (
            <div className="relative mb-12">
              {/* Nav arrows */}
              {featuredPosts.length > 2 && (
                <>
                  <button
                    onClick={() => scrollTo(carouselIndex - 1)}
                    disabled={carouselIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollTo(carouselIndex + 1)}
                    disabled={carouselIndex >= maxIndex}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Carousel track */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-hidden scroll-smooth"
              >
                {featuredPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group flex-shrink-0 w-full md:w-[calc(50%-12px)]"
                  >
                    {/* Cover image card */}
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted border border-border">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-4xl font-bold text-primary/30">{post.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    {/* Excerpt below */}
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors px-1">
                      {post.excerpt || post.title}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Dots */}
              {featuredPosts.length > 2 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollTo(i)}
                      className={`rounded-full transition-all ${
                        i === carouselIndex
                          ? 'w-6 h-2.5 bg-primary'
                          : 'w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search + Categories */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
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
