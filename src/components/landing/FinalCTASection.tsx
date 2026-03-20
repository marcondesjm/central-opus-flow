import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto max-w-[600px] relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            Pronto para organizar{' '}
            <span className="text-primary">seus projetos?</span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-md mx-auto">
            Junte-se a centenas de criadores que já economizam tempo com o Central Opus Flow.
          </p>

          <Link to="/auth">
            <Button
              size="lg"
              className="text-base px-10 h-14 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group active:scale-[0.97]"
            >
              <Zap className="w-5 h-5 mr-2" />
              Começar Grátis Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-8">
            {['7 dias grátis', 'Sem cartão de crédito', 'Cancele quando quiser'].map((b) => (
              <span key={b} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
