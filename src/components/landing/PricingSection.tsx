import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Zap, Shield, Flame, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  'Contas ilimitadas',
  'Projetos ilimitados',
  'Tags personalizadas',
  'Busca instantânea (Ctrl+K)',
  'Estatísticas e gráficos',
  'Controle de créditos',
  'Exportação de dados',
  'Suporte prioritário',
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 md:py-32 px-4 relative">
      {/* Background */}
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
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Menos que um{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              café por dia
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Por menos de R$ 0,50 por dia, você economiza horas de trabalho toda semana.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <motion.div
            className="relative bg-card border border-border rounded-3xl p-8 overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Plano Pro Mensal</h3>
                <p className="text-muted-foreground text-sm">Flexibilidade total</p>
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>R$13</span>
                <span className="text-xl font-bold">,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Cobrado mensalmente
              </p>
              
              <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/auth" className="block">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:-translate-y-0.5"
                >
                  Começar Teste Grátis de 7 Dias
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                7 dias grátis • Sem cartão
              </p>
            </div>
          </motion.div>

          {/* Annual Plan */}
          <motion.div
            className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            
            {/* Popular badge */}
            <div className="absolute top-6 right-6">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Flame className="w-3 h-3 mr-1" />
                Melhor custo-benefício
              </Badge>
            </div>
            
            <div className="relative">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold">Plano Pro Anual</h3>
                </div>
                <p className="text-muted-foreground text-sm">Tudo que você precisa, com desconto</p>
              </div>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>R$199</span>
                <span className="text-muted-foreground">/ano</span>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-muted-foreground">
                  💰 equivale a <strong className="text-foreground">R$ 16,58/mês</strong>
                </span>
              </div>
              
              <ul className="space-y-3 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
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
                  Começar Teste Grátis de 7 Dias
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                7 dias grátis • Sem cartão • PIX disponível
              </p>
            </div>
          </motion.div>
        </div>

        {/* Money back guarantee */}
        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">
              Garantia de 7 dias após o pagamento. Não gostou? Devolvemos seu dinheiro.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
