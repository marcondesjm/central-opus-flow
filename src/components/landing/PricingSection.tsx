import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Zap, Shield } from 'lucide-react';
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
      
      <div className="container mx-auto max-w-4xl relative">
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
            Por menos de R$ 1 por dia, você economiza horas de trabalho toda semana.
          </p>
        </motion.div>

        <motion.div
          className="relative bg-card border-2 border-primary/50 rounded-3xl p-8 md:p-10 max-w-lg mx-auto overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ boxShadow: 'var(--shadow-glow)' }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          {/* Popular badge */}
          <div className="absolute top-6 right-6">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              Mais Popular
            </Badge>
          </div>
          
          <div className="relative">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-1">Plano Pro</h3>
              <p className="text-muted-foreground">Tudo que você precisa</p>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>R$29</span>
              <span className="text-2xl font-bold">,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-8">
              ou R$ 287,00/ano <span className="text-primary font-medium">(economize 20%)</span>
            </p>
            
            <ul className="space-y-4 mb-8">
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
                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Começar Teste Grátis de 15 Dias
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">✓ Sem cartão</span>
              <span className="flex items-center gap-1">✓ PIX</span>
              <span className="flex items-center gap-1">✓ Cancele quando quiser</span>
            </div>
          </div>
        </motion.div>

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
