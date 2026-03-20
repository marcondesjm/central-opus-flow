import { motion } from 'framer-motion';
import { Users, FolderKanban, Clock, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: '620+', label: 'usuários ativos' },
  { icon: FolderKanban, value: '1.200+', label: 'projetos organizados' },
  { icon: Clock, value: '2h', label: 'economizadas por semana' },
  { icon: Star, value: '4.9', label: 'avaliação média' },
];

export function SocialProofBar() {
  return (
    <section className="py-10 px-4 border-y border-border/50 bg-muted/20">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center gap-1"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <stat.icon className="w-5 h-5 text-primary mb-1" />
              <span className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
