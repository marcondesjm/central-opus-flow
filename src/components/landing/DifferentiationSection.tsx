import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';

export function DifferentiationSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/40 dark:bg-muted/10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Large glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[160px] pointer-events-none bg-primary/[0.06]" />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-8">
            <Target className="w-3 h-3" />
            Foco no que importa
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] mb-8">
            Não é mais um{' '}
            <span className="relative inline-block">
              gerenciador de projetos
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-destructive/40"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            Enquanto outras ferramentas tentam fazer tudo, o Central Opus foca no
            que realmente importa:
          </p>

          <motion.div
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-primary/30 bg-primary/[0.06] backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ArrowRight className="w-5 h-5 text-primary" />
            <span className="text-base md:text-lg font-bold text-foreground">
              Entregar projetos com menos caos e mais controle.
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
