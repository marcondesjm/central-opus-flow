import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 overflow-hidden">
      {/* Background gradient glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-glow)' }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center max-w-5xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-8 px-5 py-2 text-sm font-medium border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            15 dias grátis • Sem cartão de crédito
          </Badge>
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Gerencie{' '}
          <span className="relative inline-block">
            <span className="relative z-10 bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              todos os projetos
            </span>
            <span className="absolute -bottom-2 left-0 right-0 h-3 bg-primary/20 rounded-full blur-sm" />
          </span>
          <br />
          em um só lugar
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Unifique múltiplas contas Lovable, encontre qualquer projeto em segundos 
          e ganhe até <strong className="text-foreground font-semibold">2 horas por semana</strong> de produtividade.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/auth">
            <Button 
              size="lg" 
              className="text-base md:text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Começar Grátis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/demo">
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base md:text-lg px-8 h-14 border-2 hover:bg-secondary/50 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Demonstração
            </Button>
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            'Setup em 2 minutos',
            'Sem cartão de crédito',
            'Cancele quando quiser',
          ].map((text) => (
            <span key={text} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
