import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FinalCTASection() {
  return (
    <section className="py-28 md:py-36 px-4 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[160px] pointer-events-none bg-primary/[0.06]" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none bg-accent/[0.06]" />

      <div className="container mx-auto max-w-2xl relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] text-xs font-medium text-primary mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Comece agora
          </div>

          <h2 className="text-3xl md:text-[3rem] font-extrabold mb-6 tracking-[-0.03em] leading-tight">
            Comece a organizar
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              seus projetos hoje
            </span>
          </h2>

          <Link to="/auth">
            <Button
              size="lg"
              className="h-13 px-10 rounded-2xl text-base font-semibold transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              Criar conta grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground/50 mt-8">
            Grátis para até 2 projetos · Sem cartão de crédito
          </p>
        </motion.div>
      </div>
    </section>
  );
}
