import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  FolderKanban, 
  Tags, 
  Search, 
  BarChart3, 
  Coins, 
  Download,
  ArrowUpRight
} from 'lucide-react';

const features = [
  {
    icon: FolderKanban,
    title: 'Multi-Contas',
    benefit: 'Conecte todas as suas contas Lovable e acesse todos os projetos em um único lugar.',
    highlight: 'Sem trocar de conta',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Tags,
    title: 'Organização',
    benefit: 'Tags coloridas, favoritos e filtros para classificar projetos do seu jeito.',
    highlight: 'Encontre em 2 cliques',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Search,
    title: 'Busca Global',
    benefit: 'Pressione Ctrl+K e encontre qualquer projeto em todas as contas instantaneamente.',
    highlight: 'Busca em segundos',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: BarChart3,
    title: 'Estatísticas',
    benefit: 'Gráficos de status, tipo e progresso para entender seu portfólio completo.',
    highlight: 'Dados em tempo real',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: Coins,
    title: 'Créditos',
    benefit: 'Acompanhe os créditos de cada conta diretamente no painel principal.',
    highlight: 'Nunca fique zerado',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: Download,
    title: 'Backup',
    benefit: 'Exporte todos os seus dados em JSON e importe quando precisar.',
    highlight: 'Seus dados, seu controle',
    color: 'from-cyan-500 to-cyan-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 px-4 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto max-w-6xl relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Funcionalidades
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Tudo para ser{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              mais produtivo
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Cada funcionalidade foi pensada para economizar seu tempo e 
            eliminar a frustração de gerenciar múltiplas contas.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0" />
                </div>
                
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.benefit}</p>
                
                <Badge variant="secondary" className="text-xs font-medium">
                  {feature.highlight}
                </Badge>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
