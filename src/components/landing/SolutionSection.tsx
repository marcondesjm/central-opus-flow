import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Target, Sparkles } from 'lucide-react';

export function SolutionSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            A Solução
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 mb-4">
            Um único painel para{' '}
            <span className="text-primary">todos os seus projetos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            O ProjectHub centraliza todas as suas contas Lovable em um dashboard 
            inteligente, para você encontrar qualquer projeto em segundos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left - Features list */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Zap,
                title: 'Busca instantânea',
                description: 'Encontre qualquer projeto digitando Ctrl+K. Busca em todas as contas ao mesmo tempo.',
              },
              {
                icon: Target,
                title: 'Organização visual',
                description: 'Tags coloridas, favoritos e filtros para nunca mais perder um projeto.',
              },
              {
                icon: Sparkles,
                title: 'Visão completa',
                description: 'Estatísticas, créditos e status de todos os projetos em tempo real.',
              },
            ].map((feature, index) => (
              <div key={feature.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <div className="relative bg-card border border-border rounded-2xl p-6 shadow-xl">
              <div className="space-y-4">
                {/* Search bar mockup */}
                <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-3">
                  <span className="text-muted-foreground">🔍</span>
                  <span className="text-muted-foreground">Buscar projetos...</span>
                  <span className="ml-auto text-xs bg-background px-2 py-1 rounded">⌘K</span>
                </div>
                
                {/* Account cards */}
                {[
                  { color: 'bg-blue-500', name: 'Conta Trabalho', projects: 18, credits: 150 },
                  { color: 'bg-emerald-500', name: 'Conta Freelance', projects: 12, credits: 85 },
                  { color: 'bg-amber-500', name: 'Conta Pessoal', projects: 7, credits: 200 },
                ].map((account, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${account.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.projects} projetos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-primary">
                        {account.credits} créditos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
