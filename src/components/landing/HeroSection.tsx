import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroMockup from '@/assets/hero-mockup.png';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden bg-[#0a0a0a]">
      <div className="container mx-auto max-w-7xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left — Text */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-white">
              Organize seus clientes,{' '}
              feche mais projetos e{' '}
              controle seu dinheiro{' '}
              <span className="text-[#25D366]">em um único lugar</span>
            </h1>

            <p className="text-base md:text-lg text-gray-400 max-w-lg leading-relaxed">
              O CRM completo para profissionais de serviços que querem
              organizar clientes, projetos e finanças sem depender de
              planilhas ou múltiplas ferramentas.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-2">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:opacity-90 shadow-lg shadow-[#25D366]/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Testar por 7 dias
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 rounded-xl text-sm font-medium border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 gap-2 bg-transparent"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Ver como funciona
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </motion.div>

          {/* Right — Mockup */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <img
              src={heroMockup}
              alt="Dashboard preview em laptop, tablet e smartphone"
              className="w-full max-w-2xl object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
