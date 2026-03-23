import { Button } from '@/components/ui/button';
import { FolderKanban, ArrowRight, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/70 backdrop-blur-2xl border-b border-border/30 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <FolderKanban className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">Central Opus Flow</span>
        </Link>

        {/* Nav links - desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Funcionalidades', anchor: '#features' },
            { label: 'Preços', to: '/pricing' },
            { label: 'Blog', to: '/blog' },
          ].map((item) =>
            'to' in item && item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => scrollTo(item.anchor!)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link to="/auth" className="hidden sm:block">
            <Button size="sm" variant="ghost" className="text-sm text-muted-foreground hover:text-foreground font-medium">
              Entrar
            </Button>
          </Link>
          <Link to="/auth" className="hidden sm:block">
            <Button size="sm" className="text-sm h-9 px-4 rounded-xl font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-shadow">
              Começar grátis
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </Link>
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border/30 px-4 py-4 space-y-3 animate-fade-in">
          <button onClick={() => scrollTo('#features')} className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground py-2">
            Funcionalidades
          </button>
          <Link to="/pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2">
            Preços
          </Link>
          <Link to="/blog" className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2">
            Blog
          </Link>
          <div className="pt-2 border-t border-border/30 flex gap-2">
            <Link to="/auth" className="flex-1">
              <Button size="sm" variant="outline" className="w-full">Entrar</Button>
            </Link>
            <Link to="/auth" className="flex-1">
              <Button size="sm" className="w-full">Começar grátis</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
