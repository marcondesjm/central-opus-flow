import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket, Play, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto text-center max-w-[640px] relative">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.08] text-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Controle todas as suas contas e projetos{' '}
          <span className="text-primary">em segundos</span>
        </motion.h1>

        <motion.p
          className="text-base md:text-lg text-muted-foreground mb-10 max-w-[520px] mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Encontre qualquer projeto com um comando, centralize tudo e ganhe até{' '}
          <strong className="text-foreground">2h por semana</strong> automaticamente.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/auth">
            <Button
              size="lg"
              className="text-base px-8 h-14 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group active:scale-[0.97]"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Criar minha conta grátis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button
              variant="ghost"
              size="lg"
              className="text-base px-6 h-14 rounded-full font-semibold text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]"
            >
              <Play className="w-4 h-4 mr-2" />
              Ver como funciona (30s)
            </Button>
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          {['7 dias grátis', 'Sem cartão de crédito', 'Cancele quando quiser'].map((text) => (
            <span key={text} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
