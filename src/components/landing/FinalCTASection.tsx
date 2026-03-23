import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FinalCTASection() {
  return (
    <section className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          className="text-center relative p-10 md:p-16 rounded-2xl border border-border/50 bg-card/60 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          {/* Top accent */}
          <div className="absolute -top-px left-8 right-8 h-[2px] rounded-b-full" style={{ background: 'var(--gradient-primary)' }} />

          {/* Subtle dot pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
            backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />

          <div className="relative">
            <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-4 leading-tight">
              Comece a organizar
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                seus projetos hoje
              </span>
            </h2>

            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              Junte-se a centenas de freelancers que já simplificaram suas entregas
            </p>

            <Link to="/auth">
              <Button
                size="lg"
                className="h-12 px-10 rounded-xl text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                Criar conta grátis
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Link>

            <p className="text-xs text-muted-foreground/40 mt-6">
              Grátis para até 2 projetos · Sem cartão de crédito
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
