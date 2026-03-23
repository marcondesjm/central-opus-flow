import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const comparisons = [
  { them: 'Ferramentas genéricas', us: 'Feito para entregas de projetos' },
  { them: 'Feedback por WhatsApp', us: 'Feedback centralizado e organizado' },
  { them: 'Revisões infinitas', us: 'Limites claros de revisões' },
  { them: 'Setup complexo', us: 'Comece em 2 minutos' },
];

export function DifferentiationSection() {
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/5" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/50 text-[11px] font-medium text-muted-foreground mb-5">
            Por que Central Opus?
          </div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mb-3">
            Não é mais um{' '}
            <span className="relative">
              gerenciador de projetos
              <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-destructive/30 rounded-full" />
            </span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enquanto outras ferramentas tentam fazer tudo, nós focamos no que realmente importa para freelancers e agências.
          </p>
        </motion.div>

        {/* Comparison table */}
        <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-2 border-b border-border/40">
            <div className="p-4 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">Outros</div>
            <div className="p-4 text-xs font-medium text-primary uppercase tracking-wider border-l border-border/40">Central Opus</div>
          </div>
          {/* Rows */}
          {comparisons.map((c, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-2 border-b border-border/30 last:border-b-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className="p-4 text-sm text-muted-foreground/60 line-through decoration-destructive/30">{c.them}</div>
              <div className="p-4 text-sm text-foreground font-medium border-l border-border/40 flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                {c.us}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
