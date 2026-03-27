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
    <section className="py-20 md:py-28 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase">Depoimentos</span>
          <h2 className="text-3xl md:text-[2.75rem] font-bold tracking-[-0.03em] mt-2">
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
              className="bg-card border border-border/50 rounded-2xl p-6 hover:border-border transition-colors"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed mb-6">
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
