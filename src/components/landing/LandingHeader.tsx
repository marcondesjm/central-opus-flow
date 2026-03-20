import { Button } from '@/components/ui/button';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/60 backdrop-blur-2xl border-b border-border/40'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <FolderKanban className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">Central Opus Flow</span>
        </Link>

        {/* Nav links - desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Funcionalidades', anchor: '#features' },
            { label: 'Preços', to: '/pricing' },
            { label: 'Blog', to: '/blog' },
          ].map((item) =>
            'to' in item && item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => scrollTo(item.anchor!)}
                className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link to="/auth" className="hidden sm:block">
            <Button size="sm" variant="ghost" className="text-[13px] text-muted-foreground hover:text-foreground">
              Entrar
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="text-[13px] h-8 px-3 rounded-lg">
              Começar grátis
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
