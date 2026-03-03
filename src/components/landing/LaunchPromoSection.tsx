import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Rocket, Target, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LaunchPromoSection() {
  const [filledSlots] = useState(() => Math.floor(Math.random() * 6) + 44);
  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-amber-500/20">
        <Sparkles className="w-24 h-24" />
      </div>
      <div className="absolute bottom-10 right-10 text-orange-500/20">
        <Flame className="w-32 h-32" />
      </div>

      <div className="container mx-auto max-w-4xl relative">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Fire badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Badge className="mb-6 px-4 py-2 text-base bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              <Flame className="w-4 h-4 mr-2 animate-pulse" />
              Promoção de Lançamento – Limitada
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Rocket className="w-8 h-8 text-amber-500" />
              <h2 className="text-2xl md:text-4xl font-bold">
                Oferta Especial para os{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  50 Primeiros
                </span>
              </h2>
            </div>
          </motion.div>

          {/* Price card */}
          <motion.div
            className="bg-card border-2 border-amber-500/50 rounded-3xl p-8 md:p-10 max-w-md mx-auto my-10 relative overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{ 
              boxShadow: '0 0 60px rgba(245, 158, 11, 0.3), 0 0 100px rgba(249, 115, 22, 0.2)' 
            }}
          >
            {/* Corner ribbon */}
            <div className="absolute -top-1 -right-1">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-8 py-1 rotate-45 translate-x-6 translate-y-3">
                LIMITADO
              </div>
            </div>

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />

            <div className="relative">
              {/* Price */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-muted-foreground line-through text-lg">R$ 19,90</span>
                  <Badge variant="destructive" className="text-xs">-50%</Badge>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-bold text-muted-foreground">R$</span>
                  <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    9
                  </span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    ,90
                  </span>
                  <span className="text-muted-foreground text-lg">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  por <strong>3 meses</strong> (depois R$ 19,90/mês)
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 my-8 text-left">
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">Exclusivo para novos usuários</p>
                    <p className="text-xs text-muted-foreground">Primeira compra apenas</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">🔥 {filledSlots} de 50 vagas já preenchidas!</p>
                    <p className="text-xs text-muted-foreground">Restam apenas {50 - filledSlots} vagas</p>
                  </div>
                </div>
              </div>

              {/* Savings callout */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 mb-6 border border-amber-500/20">
                <p className="text-sm font-medium">
                  👉 Garanta agora e economize{' '}
                  <span className="text-amber-500 font-bold">R$ 30,00</span>{' '}
                  nos 3 primeiros meses!
                </p>
              </div>

              {/* CTA Button */}
              <Link to="/auth" className="block">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <Flame className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Quero Essa Oferta!
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Trust line */}
              <p className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2 flex-wrap">
                <span>✓ Sem fidelidade</span>
                <span className="text-muted-foreground/50">•</span>
                <span>✓ Cancele quando quiser</span>
                <span className="text-muted-foreground/50">•</span>
                <span>✓ Garantia de 7 dias</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
