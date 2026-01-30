import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Freelancer de Web',
    content: 'Eu tinha 3 contas Lovable e perdia 30 minutos por dia só procurando projetos. Com o ProjectHub, encontro tudo em segundos.',
    avatar: 'CS',
    rating: 5,
  },
  {
    name: 'Ana Rodrigues',
    role: 'Dona de Agência',
    content: 'Gerencio 8 contas de clientes diferentes. O ProjectHub salvou minha sanidade mental. Recomendo para qualquer agência.',
    avatar: 'AR',
    rating: 5,
  },
  {
    name: 'Pedro Santos',
    role: 'Desenvolvedor Full-Stack',
    content: 'A busca com Ctrl+K é viciante. Nunca mais precisei lembrar em qual conta estava cada projeto. Vale cada centavo.',
    avatar: 'PS',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Depoimentos
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 mb-4">
            Quem usa, recomenda
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Veja o que desenvolvedores e agências dizem sobre o ProjectHub.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-card border border-border rounded-xl p-6 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
