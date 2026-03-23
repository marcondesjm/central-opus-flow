import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function DifferentiationSection() {
  return (
    <section className="py-28 md:py-36 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/10" />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--gradient-primary)', opacity: 0.15 }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--gradient-primary)', opacity: 0.15 }} />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] text-xs font-medium text-primary mb-8">
            <ArrowRight className="w-3 h-3" />
            Foco no que importa
          </div>

          <h2 className="text-3xl md:text-[2.75rem] font-extrabold tracking-[-0.03em] mb-6">
            Não é mais um gerenciador de projetos
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Enquanto outras ferramentas tentam fazer tudo, o Central Opus foca no
            que realmente importa:{' '}
            <span className="text-foreground font-semibold">
              entregar projetos com menos caos e mais controle.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
