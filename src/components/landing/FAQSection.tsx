import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Como funciona o teste grátis?',
    answer: 'Você tem 15 dias para usar todas as funcionalidades do ProjectHub sem precisar informar cartão de crédito. No final do período, escolha assinar ou continue com acesso limitado.',
  },
  {
    question: 'Quantas contas Lovable posso conectar?',
    answer: 'Com o plano Pro, você pode conectar contas ilimitadas. Não há limite para o número de projetos ou contas que você pode gerenciar.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim. Usamos criptografia em todas as conexões, seus dados são armazenados em servidores seguros, e você pode exportar ou excluir tudo a qualquer momento. Não compartilhamos informações com terceiros.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer: 'Aceitamos PIX para pagamentos mensais ou anuais. Após a confirmação, seu acesso é liberado imediatamente. Você pode cancelar a qualquer momento, sem multas.',
  },
  {
    question: 'Posso usar com minha equipe?',
    answer: 'Atualmente o ProjectHub é focado em uso individual, mas você pode compartilhar projetos e contas com colaboradores. Funcionalidades avançadas de equipe estão em desenvolvimento.',
  },
  {
    question: 'O que acontece se eu cancelar?',
    answer: 'Você mantém acesso até o final do período pago. Após isso, sua conta volta para o modo gratuito limitado, mas seus dados ficam salvos por 90 dias caso queira reativar.',
  },
  {
    question: 'O ProjectHub sincroniza automaticamente com Lovable?',
    answer: 'Os projetos são gerenciados manualmente no ProjectHub. Você adiciona as informações dos projetos que deseja acompanhar e atualiza status, notas e progresso conforme necessário.',
  },
];

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Dúvidas Frequentes
          </span>
          <h2 className="text-2xl md:text-4xl font-bold mt-3 mb-4">
            Perguntas e Respostas
          </h2>
          <p className="text-muted-foreground text-lg">
            Tudo que você precisa saber antes de começar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="bg-card border border-border rounded-lg mb-3 px-4 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
