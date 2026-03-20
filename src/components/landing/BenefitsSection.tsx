import { motion } from 'framer-motion';
import { Clock, Zap, Eye, TrendingUp } from 'lucide-react';

const benefits = [
  { icon: Clock, value: '2h', label: 'por semana', description: 'Economize eliminando troca entre contas' },
  { icon: Zap, value: '10x', label: 'mais rápido', description: 'Encontre projetos com busca global' },
  { icon: Eye, value: '100%', label: 'visibilidade', description: 'Todos os projetos num único lugar' },
  { icon: TrendingUp, value: '+40%', label: 'produtividade', description: 'Foque no que importa' },
];

export function BenefitsSection() {
  return (
    <section className="py-20 md:py-28 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Resultados reais para o seu dia a dia
          </h2>
          <p className="text-primary-foreground/70 max-w-lg mx-auto">
            Nossos usuários relatam ganhos significativos de produtividade logo na primeira semana.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={b.label}
              className="text-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <b.icon className="w-7 h-7 mx-auto mb-3 opacity-80" />
              <div className="text-3xl md:text-4xl font-extrabold tabular-nums">{b.value}</div>
              <div className="text-sm font-medium opacity-90 mb-1">{b.label}</div>
              <p className="text-xs opacity-60">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
