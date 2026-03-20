import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.05] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-2xl relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-[2.75rem] font-bold mb-5 tracking-[-0.02em] leading-tight">
            Pronto para organizar
            <br />
            <span className="text-primary">seus projetos?</span>
          </h2>

          <p className="text-base text-muted-foreground mb-10 max-w-md mx-auto">
            Junte-se a centenas de freelancers e agências que já economizam tempo
            com o Central Opus Flow.
          </p>

          <Link to="/auth">
            <Button
              size="lg"
              className="h-12 px-8 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Começar grátis agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <p className="text-xs text-muted-foreground/50 mt-6">
            Grátis por 7 dias · Sem cartão de crédito
          </p>
        </motion.div>
      </div>
    </section>
  );
}
