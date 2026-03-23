import { Button } from '@/components/ui/button';
import { FolderKanban, ArrowRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-2xl border-b border-border/40 shadow-[0_1px_3px_0_hsl(var(--foreground)/0.04)]'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 h-[60px] flex items-center justify-between max-w-6xl">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <FolderKanban className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[13px] tracking-[-0.01em] text-foreground">
            Central Opus Flow
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Funcionalidades', anchor: '#features' },
            { label: 'Preços', to: '/pricing' },
            { label: 'Blog', to: '/blog' },
          ].map((item) =>
            'to' in item && item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => scrollTo(item.anchor!)}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <Link to="/auth">
              <Button
                size="sm"
                variant="ghost"
                className="text-[13px] text-muted-foreground hover:text-foreground h-8 px-3"
              >
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="sm"
                className="text-[13px] h-8 px-4 rounded-lg font-medium bg-foreground text-background hover:bg-foreground/90 transition-all"
              >
                Começar grátis
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </Link>
          </div>
          <button
            className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-md"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border/40 px-6 py-4 space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button onClick={() => scrollTo('#features')} className="block w-full text-left text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              Funcionalidades
            </button>
            <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              Preços
            </Link>
            <Link to="/blog" className="block text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              Blog
            </Link>
            <div className="pt-3 border-t border-border/30 flex gap-2">
              <Link to="/auth" className="flex-1">
                <Button size="sm" variant="outline" className="w-full text-sm">Entrar</Button>
              </Link>
              <Link to="/auth" className="flex-1">
                <Button size="sm" className="w-full text-sm bg-foreground text-background hover:bg-foreground/90">Começar grátis</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
