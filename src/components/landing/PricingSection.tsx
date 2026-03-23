import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Zap, Shield, Crown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 md:py-32 px-4 relative">
      <div className="absolute inset-0 bg-muted/20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto max-w-6xl relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Investimento
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Pare de perder tempo com{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              feedback desorganizado
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Entregue projetos mais rápido com aprovações profissionais.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* FREE Plan */}
          <motion.div
            className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-transparent" />
            
            <div className="relative">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Livre</h3>
                <p className="text-muted-foreground text-sm">Para começar a organizar</p>
              </div>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl md:text-5xl font-bold">R$0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Até 2 projetos', included: true },
                  { text: 'Comentários ilimitados', included: true },
                  { text: 'Aprovações básicas', included: true },
                  { text: 'Controle de revisões', included: false },
                  { text: 'Histórico de versões', included: false },
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      feature.included ? "bg-primary/10" : "bg-muted"
                    )}>
                      {feature.included ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <span className={cn("text-sm", !feature.included && "text-muted-foreground")}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth" className="block">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
                >
                  Começar grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* PRO Plan */}
          <motion.div
            className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            
            <div className="absolute top-6 right-6">
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-lg">
                <Crown className="w-3 h-3 mr-1" />
                Recomendado
              </Badge>
            </div>
            
            <div className="relative">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Pro</h3>
                </div>
                <p className="text-muted-foreground text-sm">Tudo para entregar projetos mais rápido</p>
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>R$29</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-6">
                7 dias grátis • Cancele quando quiser
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Projetos ilimitados',
                  'Comentários ilimitados',
                  'Controle de revisões',
                  'Histórico de versões',
                  'Fluxo profissional de aprovação',
                  'Link de aprovação para clientes',
                  'Suporte prioritário',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth" className="block">
                <Button 
                  size="lg" 
                  className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Psychology line */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-lg font-semibold text-foreground">
            💡 Um único projeto já paga a ferramenta
          </p>
        </motion.div>

        {/* Money back guarantee */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">
              Garantia de 7 dias. Não gostou? Devolvemos seu dinheiro.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
