import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    content: 'Antes eu perdia tudo no WhatsApp. Agora consigo organizar feedback e finalizar projetos muito mais rápido.',
    name: 'Carlos S.',
    role: 'Designer freelancer',
    initials: 'CS',
    rating: 5,
  },
  {
    content: 'Meus clientes adoram a experiência de aprovação. Simples, direto e sem confusão.',
    name: 'Ana R.',
    role: 'Web designer freelancer',
    initials: 'AR',
    rating: 5,
  },
  {
    content: 'O controle de revisões mudou tudo. Chega de retrabalho infinito.',
    name: 'Pedro S.',
    role: 'Dev freelancer',
    initials: 'PS',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute top-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none bg-primary/[0.05]" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none bg-accent/[0.04]" />

      <div className="container mx-auto max-w-5xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-4">Depoimentos</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em]">
            Profissionais já estão{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              simplificando
            </span>
            {' '}suas entregas
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-7 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Quote watermark */}
              <div className="absolute -top-2 -right-2 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                <Quote className="w-20 h-20 text-primary" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5 relative">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-[15px] text-foreground/80 leading-relaxed mb-8 relative font-medium">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3 relative">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
