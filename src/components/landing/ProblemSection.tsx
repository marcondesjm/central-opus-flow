import { motion } from 'framer-motion';

const problems = [
  'Feedback espalhado entre WhatsApp, email e áudio',
  'Clientes pedindo mudanças infinitas',
  'Você perde tempo tentando organizar tudo',
  'Não sabe quando o projeto está realmente aprovado',
];

export function ProblemSection() {
  return (
    <section className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-[2.5rem] font-bold leading-tight tracking-[-0.02em]">
            Você já passou por isso?
          </h2>
        </motion.div>

        <div className="space-y-3 mb-10">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/50"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <span className="text-destructive mt-0.5 shrink-0">✕</span>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-sm font-medium text-foreground/80 border-l-2 border-primary pl-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Isso não é profissional — e está te fazendo perder tempo (e dinheiro).
        </motion.p>
      </div>
    </section>
  );
}
