import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      {/* Multiple glows for richness */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[200px] pointer-events-none bg-primary/[0.08]" />
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none bg-accent/[0.06]" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none bg-[hsl(326,78%,60%)]/[0.05]" />

      <div className="container mx-auto max-w-3xl relative">
        <motion.div
          className="text-center p-12 md:p-16 rounded-3xl border border-primary/20 bg-card/60 backdrop-blur-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          {/* Card gradient border top */}
          <div className="absolute -top-px left-0 right-0 h-[2px]" style={{ background: 'var(--gradient-primary)' }} />
          
          {/* Background pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
            backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />

          <div className="relative">
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/25 bg-primary/[0.08] text-xs font-bold text-primary mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Rocket className="w-3.5 h-3.5" />
              Comece agora
            </motion.div>

            <h2 className="text-3xl md:text-[3.5rem] font-black mb-8 tracking-[-0.04em] leading-[1.05]">
              Comece a organizar
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                seus projetos hoje
              </span>
            </h2>

            <Link to="/auth">
              <Button
                size="lg"
                className="h-14 px-12 rounded-2xl text-base font-bold transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-10px_hsl(var(--primary)/0.4)] active:scale-[0.97] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                Criar conta grátis
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <p className="text-sm text-muted-foreground/50 mt-8 font-medium">
              Grátis para até 2 projetos · Sem cartão de crédito
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
