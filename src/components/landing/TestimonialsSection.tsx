import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    content: 'Antes eu perdia tudo no WhatsApp. Agora consigo organizar feedback e finalizar projetos muito mais rápido.',
    name: 'Carlos S.',
    role: 'Designer freelancer',
    initials: 'CS',
  },
  {
    content: 'Meus clientes adoram a experiência de aprovação. Simples, direto e sem confusão.',
    name: 'Ana R.',
    role: 'Web designer freelancer',
    initials: 'AR',
  },
  {
    content: 'O controle de revisões mudou tudo. Chega de retrabalho infinito.',
    name: 'Pedro S.',
    role: 'Dev freelancer',
    initials: 'PS',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 dark:bg-muted/5" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/60 bg-card/50 text-[11px] font-medium text-muted-foreground mb-5">
            Depoimentos
          </div>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em]">
            Profissionais já estão{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              simplificando
            </span>
            {' '}suas entregas
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="group relative bg-card/80 border border-border/50 rounded-2xl p-6 hover:border-border transition-all duration-300 hover:-translate-y-0.5"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-[13px] text-foreground/80 leading-relaxed mb-6">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold text-primary-foreground shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
