import { motion } from 'framer-motion';
import { Clock, Target, Eye, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    value: '2h',
    label: 'por semana',
    description: 'Economize tempo eliminando a troca entre contas',
  },
  {
    icon: Target,
    value: '10x',
    label: 'mais rápido',
    description: 'Encontre projetos com busca instantânea',
  },
  {
    icon: Eye,
    value: '100%',
    label: 'visibilidade',
    description: 'Veja todos os projetos em um único lugar',
  },
  {
    icon: TrendingUp,
    value: '+40%',
    label: 'produtividade',
    description: 'Foque no que importa, não em organização',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Resultados reais para o seu dia a dia
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Nossos usuários relatam ganhos significativos de produtividade 
            logo na primeira semana de uso.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{benefit.value}</div>
              <div className="text-sm font-medium mb-2 opacity-90">{benefit.label}</div>
              <p className="text-xs opacity-70">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
