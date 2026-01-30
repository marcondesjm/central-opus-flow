import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const benefits = [
  '15 dias grátis',
  'Sem cartão de crédito',
  'Cancele quando quiser',
];

export function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
      
      <div className="container mx-auto max-w-4xl relative">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Pronto para organizar
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              seus projetos?
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de criadores que já economizam tempo com o ProjectHub.
            Comece gratuitamente hoje.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="text-lg px-10 h-16 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              >
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Começar Grátis Agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {benefits.map((benefit) => (
              <span key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {benefit}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
