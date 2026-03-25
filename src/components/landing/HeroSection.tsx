import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-0 md:pt-36 px-4 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none opacity-60" style={{ background: 'var(--gradient-glow)' }} />

      <div className="container mx-auto max-w-6xl relative">
        {/* Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm text-[12px] font-medium text-muted-foreground shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
            Feedback organizado, aprovações rápidas
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-center text-4xl sm:text-5xl md:text-[3.75rem] lg:text-[4.25rem] font-bold leading-[1.08] tracking-[-0.035em] text-foreground mb-5 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Pare de receber feedback{' '}
          <br className="hidden sm:block" />
          de clientes no{' '}
          <span className="relative">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              WhatsApp
            </span>
            <motion.span
              className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full origin-left"
              style={{ background: 'var(--gradient-primary)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-center text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Envie seu projeto, receba comentários organizados, controle revisões
          e obtenha aprovação — tudo num fluxo simples.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="h-12 px-8 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Começar grátis
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-8 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Veja como funciona
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex flex-col items-center gap-2.5 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5">Aprovado por freelancers</span>
          </div>
          <p className="text-xs text-muted-foreground/50">
            Grátis para até 2 projetos · Sem cartão de crédito
          </p>
        </motion.div>

      </div>
    </section>
  );
}
