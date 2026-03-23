import { motion } from 'framer-motion';

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
    role: 'Designer de landing pages',
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
    <section className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em]">
            Designers já estão simplificando seus projetos
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-card border border-border/40 rounded-xl p-6 hover:border-border/80 transition-colors duration-300"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                "{t.content}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
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
