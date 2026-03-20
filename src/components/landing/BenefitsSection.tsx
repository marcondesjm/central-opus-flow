import { motion } from 'framer-motion';

const benefits = [
  { value: '2h', label: 'economizadas por semana', desc: 'Eliminando troca entre contas e ferramentas' },
  { value: '10x', label: 'mais rápido para encontrar', desc: 'Busca global em todas as contas' },
  { value: '100%', label: 'visibilidade', desc: 'Projetos, vendas e finanças num só lugar' },
  { value: '+40%', label: 'produtividade', desc: 'Menos contexto perdido, mais foco' },
];

export function BenefitsSection() {
  return (
    <section className="py-24 md:py-32 px-4 bg-muted/20 border-y border-border/30">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary/80 mb-3">Resultados</p>
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em]">
            Impacto real desde a primeira semana
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary tabular-nums mb-1">{b.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{b.label}</div>
              <p className="text-[11px] text-muted-foreground">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
