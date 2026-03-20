import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.07] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl relative">
        {/* Eyebrow */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/demo" className="group">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/50 backdrop-blur text-xs text-muted-foreground hover:border-primary/40 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Novo: Pipeline Kanban com automações
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-center text-[clamp(2rem,5.5vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          Gerencie projetos, clientes e
          <br className="hidden sm:block" />
          finanças em um só lugar
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-center text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          Central Opus Flow é a plataforma que centraliza contas, projetos,
          kanban, propostas e cobranças — para freelancers e agências que
          querem escalar sem caos.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="h-12 px-7 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Começar grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-7 rounded-xl text-sm font-semibold border-border/60 hover:bg-muted/50 active:scale-[0.97]"
            >
              <Play className="w-3.5 h-3.5 mr-2 fill-current" />
              Ver demonstração
            </Button>
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          className="text-center text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          Grátis por 7 dias · Sem cartão de crédito · Cancele quando quiser
        </motion.p>
      </div>
    </section>
  );
}
