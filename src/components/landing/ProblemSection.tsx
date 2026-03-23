import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const problems = [
  'Feedback espalhado entre WhatsApp, email e áudio',
  'Clientes pedindo mudanças infinitas',
  'Você perde tempo tentando organizar tudo',
  'Não sabe quando o projeto está realmente aprovado',
];

export function ProblemSection() {
  return (
    <section className="py-28 md:py-36 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

      <div className="container mx-auto max-w-2xl relative">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-destructive mb-4">O problema</p>
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold leading-tight tracking-[-0.03em]">
            Você já passou por isso?
          </h2>
        </motion.div>

        <div className="space-y-3 mb-12">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm hover:border-destructive/30 hover:bg-destructive/[0.03] transition-all duration-300"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-destructive/15 transition-colors">
                <X className="w-3.5 h-3.5 text-destructive" />
              </div>
              <p className="text-[15px] text-muted-foreground leading-relaxed">{problem}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-full before:bg-primary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-base font-medium text-foreground/80 leading-relaxed">
            Isso não é profissional — e está te fazendo perder tempo (e dinheiro).
          </p>
        </motion.div>
      </div>
    </section>
  );
}
