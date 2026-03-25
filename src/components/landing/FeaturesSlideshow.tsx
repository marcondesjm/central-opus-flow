import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LayoutDashboard, FileText, DollarSign, Lightbulb, Columns3 } from 'lucide-react';

import slideDashboard from '@/assets/slides/slide-dashboard.png';
import slidePropostas from '@/assets/slides/slide-propostas.png';
import slideFaturamento from '@/assets/slides/slide-faturamento.png';
import slideIdeias from '@/assets/slides/slide-ideias.png';
import slideKanban from '@/assets/slides/slide-kanban.png';

const slides = [
  { src: slideDashboard, label: 'Dashboard', icon: LayoutDashboard, desc: 'Visão geral de todos os seus projetos' },
  { src: slidePropostas, label: 'Propostas', icon: FileText, desc: 'Propostas comerciais com identidade visual' },
  { src: slideFaturamento, label: 'Faturamento', icon: DollarSign, desc: 'Controle financeiro completo' },
  { src: slideIdeias, label: 'Ideias', icon: Lightbulb, desc: 'Gerencie ideias com impacto e esforço' },
  { src: slideKanban, label: 'Kanban', icon: Columns3, desc: 'Pipeline visual com drag & drop' },
];

export function FeaturesSlideshow() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  }, []);

  // Auto-play: reset timer on every slide change
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
            Tudo que você precisa em{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              um só lugar
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conheça cada módulo do sistema que vai transformar sua rotina.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {slides.map((slide, i) => {
            const Icon = slide.icon;
            const isActive = i === current;
            return (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{slide.label}</span>
              </button>
            );
          })}
        </div>

        {/* Slideshow */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute -inset-4 rounded-3xl bg-primary/[0.04] blur-3xl -z-10" />

          <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl shadow-black/20">
            {/* Browser bar */}
            <div className="bg-muted/60 px-4 py-2.5 flex items-center gap-2.5 border-b border-border/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-background/60 rounded-md px-3 py-1 text-[11px] text-muted-foreground/60 text-center max-w-xs mx-auto">
                  centralopusflow.com.br/{slides[current].label.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Image area */}
            <div className="relative aspect-[16/9] md:aspect-[16/8] overflow-hidden bg-background">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.img
                  key={current}
                  src={slides[current].src}
                  alt={slides[current].label}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </AnimatePresence>

              {/* Nav arrows */}
              <button
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg hover:bg-card transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center shadow-lg hover:bg-card transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Caption */}
          <div className="text-center mt-6">
            <p className="text-lg font-semibold">{slides[current].label}</p>
            <p className="text-sm text-muted-foreground">{slides[current].desc}</p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
