import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQSection() {
  const { t } = useTranslation();

  const faqs = [
    { question: t('landing.faq1Q'), answer: t('landing.faq1A') },
    { question: t('landing.faq2Q'), answer: t('landing.faq2A') },
    { question: t('landing.faq3Q'), answer: t('landing.faq3A') },
    { question: t('landing.faq4Q'), answer: t('landing.faq4A') },
    { question: t('landing.faq5Q'), answer: t('landing.faq5A') },
    { question: t('landing.faq6Q'), answer: t('landing.faq6A') },
    { question: t('landing.faq7Q'), answer: t('landing.faq7A') },
  ];

  return (
    <section id="faq" className="py-24 md:py-32 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary/80 mb-3">FAQ</p>
          <h2 className="text-2xl md:text-[2.5rem] font-bold tracking-[-0.02em]">
            {t('landing.faqTitle')}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/40 rounded-xl px-4 data-[state=open]:border-primary/30 data-[state=open]:bg-muted/20 transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4 text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
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
