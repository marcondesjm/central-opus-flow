import { motion } from 'framer-motion';

const stats = [
  { value: '620+', label: 'usuários ativos' },
  { value: '1.200+', label: 'projetos gerenciados' },
  { value: '2h', label: 'economizadas / semana' },
  { value: '4.9', label: 'avaliação média' },
];

export function SocialProofBar() {
  return (
    <section className="py-6 px-4 border-y border-border/30">
      <div className="container mx-auto max-w-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <span className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{stat.value}</span>
              <span className="block text-[11px] text-muted-foreground mt-0.5">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
