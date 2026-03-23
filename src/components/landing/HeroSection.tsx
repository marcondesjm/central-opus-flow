import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none bg-primary/[0.12] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none bg-accent/[0.08] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      <div className="absolute bottom-[-10%] left-[40%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-[hsl(326,78%,60%)]/[0.06] animate-[pulse_12s_ease-in-out_infinite_4s]" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto max-w-5xl relative">
        {/* Floating badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-primary/25 bg-primary/[0.08] backdrop-blur-xl text-xs font-semibold text-primary shadow-lg shadow-primary/5">
            <Sparkles className="w-3.5 h-3.5" />
            Feedback organizado, aprovações rápidas
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-center text-[clamp(2.5rem,7vw,5rem)] font-black leading-[0.95] tracking-[-0.05em] text-foreground mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08 }}
        >
          Pare de receber feedback
          <br className="hidden sm:block" />
          de clientes no{' '}
          <span className="relative inline-block">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              WhatsApp
            </span>
            {/* Underline accent */}
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-[4px] rounded-full"
              style={{ background: 'var(--gradient-primary)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Envie seu projeto, receba comentários organizados, controle revisões
          e obtenha aprovação — tudo num fluxo simples.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22 }}
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="h-14 px-10 rounded-2xl text-base font-bold shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.4)] active:scale-[0.97] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Começar grátis
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-10 rounded-2xl text-base font-semibold border-border/60 backdrop-blur-xl hover:bg-card/80 hover:border-primary/30 active:scale-[0.97] transition-all duration-300"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Veja como funciona
            </Button>
          </Link>
        </motion.div>

        {/* Social proof row */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm text-muted-foreground ml-2">Aprovado por freelancers</span>
          </div>
          <p className="text-sm text-muted-foreground/50 font-medium">
            Grátis para até 2 projetos · Sem cartão de crédito
          </p>
        </motion.div>
      </div>
    </section>
  );
}
