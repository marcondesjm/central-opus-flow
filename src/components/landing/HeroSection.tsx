import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 overflow-hidden">
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.07] rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-3xl relative">
        <motion.h1
          className="text-center text-[clamp(2rem,5.5vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Pare de receber feedback
          <br className="hidden sm:block" />
          de clientes no WhatsApp
        </motion.h1>

        <motion.p
          className="text-center text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
        >
          Envie sua landing page, receba comentários organizados, controle revisões
          e obtenha aprovação — tudo num fluxo simples.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
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
              Veja como funciona
            </Button>
          </Link>
        </motion.div>

        <motion.p
          className="text-center text-xs text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Grátis para até 2 projetos · Sem cartão de crédito
        </motion.p>
      </div>
    </section>
  );
}
