import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 px-4 overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-mesh)' }} />
      <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full blur-[180px] pointer-events-none bg-primary/[0.08]" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none bg-accent/[0.06]" />

      <div className="container mx-auto max-w-4xl relative">
        {/* Floating badge */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] backdrop-blur-sm text-xs font-medium text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Feedback organizado, aprovações rápidas
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-center text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground mb-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
        >
          Pare de receber feedback
          <br className="hidden sm:block" />
          de clientes no{' '}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
            WhatsApp
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-center text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Envie sua landing page, receba comentários organizados, controle revisões
          e obtenha aprovação — tudo num fluxo simples.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.18 }}
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="h-13 px-8 rounded-2xl text-base font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.97]"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              Começar grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              variant="outline"
              size="lg"
              className="h-13 px-8 rounded-2xl text-base font-semibold border-border/50 backdrop-blur-sm hover:bg-card/80 active:scale-[0.97]"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Veja como funciona
            </Button>
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="text-center text-sm text-muted-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          Grátis para até 2 projetos · Sem cartão de crédito
        </motion.p>
      </div>
    </section>
  );
}
