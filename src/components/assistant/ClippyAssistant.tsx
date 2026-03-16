import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { X, MessageCircleQuestion, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAssistantFaqs, AssistantFaq } from '@/hooks/useAssistantFaqs';
import clippyImage from '@/assets/clippy-assistant.png';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  geral: 'Geral',
  projetos: 'Projetos',
  kanban: 'Kanban',
  propostas: 'Propostas',
  conta: 'Conta',
  configuracoes: 'Configurações',
  cobrancas: 'Cobranças',
};

const categoryColors: Record<string, string> = {
  geral: 'bg-muted text-muted-foreground',
  projetos: 'bg-primary/10 text-primary',
  kanban: 'bg-amber-500/10 text-amber-600',
  propostas: 'bg-emerald-500/10 text-emerald-600',
  conta: 'bg-purple-500/10 text-purple-600',
  configuracoes: 'bg-blue-500/10 text-blue-600',
  cobrancas: 'bg-red-500/10 text-red-600',
};

const greetings = [
  '👋 Olá! Precisa de ajuda? Clique em mim!',
  '💡 Tem dúvidas? Estou aqui pra ajudar!',
  '🔍 Quer aprender a usar o sistema? Me chama!',
  '✨ Ei! Posso te mostrar como usar tudo por aqui!',
];

// Clippy idle animations
const idleVariants = {
  idle: {
    y: [0, -6, 0, -3, 0],
    rotate: [0, -2, 2, -1, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

const eyeBlinkVariants = {
  open: { scaleY: 1 },
  blink: {
    scaleY: [1, 0.1, 1],
    transition: { duration: 0.2 },
  },
};

export function ClippyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<AssistantFaq | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingText, setGreetingText] = useState('');
  const [isWaving, setIsWaving] = useState(false);
  const { data: faqs, isLoading } = useAssistantFaqs();
  const eyeControls = useAnimation();

  // Blink eyes randomly
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      eyeControls.start('blink').then(() => eyeControls.start('open'));
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(blinkInterval);
  }, [eyeControls]);

  // Wave animation periodically
  useEffect(() => {
    const waveInterval = setInterval(() => {
      if (!isOpen && !showGreeting) {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 1500);
      }
    }, 15000 + Math.random() * 10000);

    return () => clearInterval(waveInterval);
  }, [isOpen, showGreeting]);

  // Show greeting after delay on first visit
  useEffect(() => {
    const greeted = sessionStorage.getItem('clippy-greeted');
    if (!greeted) {
      const timer = setTimeout(() => {
        setGreetingText(greetings[Math.floor(Math.random() * greetings.length)]);
        setShowGreeting(true);
        sessionStorage.setItem('clippy-greeted', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Periodically show tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      if (!isOpen && !showGreeting) {
        setGreetingText(greetings[Math.floor(Math.random() * greetings.length)]);
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 6000);
      }
    }, 60000 + Math.random() * 30000);

    return () => clearInterval(tipInterval);
  }, [isOpen, showGreeting]);

  const filteredFaqs = faqs?.filter((faq) => {
    const matchesSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqs?.map((f) => f.category) || [])];

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setShowGreeting(false);
    setSelectedFaq(null);
    setSearch('');
    setSelectedCategory(null);
  }, []);

  return (
    <>
      {/* Speech bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.85 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-[160px] right-4 lg:bottom-[100px] z-[60] max-w-[220px]"
          >
            {/* Bubble */}
            <div className="relative bg-card border border-border shadow-lg rounded-xl px-3 py-2.5">
              <button
                onClick={() => setShowGreeting(false)}
                className="absolute -top-2 -right-2 bg-muted hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
              <p className="text-xs text-foreground leading-relaxed">{greetingText}</p>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-[6px] left-4 w-3 h-3 bg-card border-b border-r border-border rotate-45 transform" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clippy character - RIGHT side, above WhatsApp button */}
      <motion.div
        className="fixed bottom-[88px] right-4 lg:bottom-[60px] z-[60] cursor-pointer select-none"
        variants={idleVariants}
        animate="idle"
        onClick={handleOpen}
        title="Assistente de Ajuda"
      >
        {/* Shadow */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/10 rounded-full blur-sm"
          animate={{
            scaleX: [1, 0.9, 1, 0.95, 1],
            opacity: [0.3, 0.2, 0.3, 0.25, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Clippy image with wave animation */}
        <motion.img
          src={clippyImage}
          alt="Clippy - Assistente"
          className="w-16 h-20 object-contain drop-shadow-md"
          animate={
            isWaving
              ? {
                  rotate: [0, -15, 15, -10, 10, -5, 0],
                  transition: { duration: 1.2, ease: 'easeInOut' },
                }
              : {}
          }
          whileHover={{
            scale: 1.15,
            rotate: [0, -8, 8, -4, 0],
            transition: { duration: 0.6 },
          }}
          whileTap={{ scale: 0.9 }}
        />

        {/* Eyes blink overlay (subtle opacity effect) */}
        <motion.div
          className="absolute top-[18px] left-1/2 -translate-x-1/2 w-10 h-3 pointer-events-none"
          variants={eyeBlinkVariants}
          animate={eyeControls}
          initial="open"
          style={{ transformOrigin: 'center' }}
        />
      </motion.div>

      {/* FAQ Panel - LEFT side */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[170px] right-4 lg:bottom-[140px] z-[60] w-[340px] max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header - Office style */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
              <motion.img
                src={clippyImage}
                alt="Clippy"
                className="w-9 h-11 object-contain"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">Assistente</h3>
                <p className="text-[11px] text-muted-foreground">Como posso te ajudar?</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            {selectedFaq ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="px-3 py-2 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-xs h-7"
                    onClick={() => setSelectedFaq(null)}
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Voltar
                  </Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <Badge className={cn('mb-3 text-xs', categoryColors[selectedFaq.category] || 'bg-muted')}>
                    {categoryLabels[selectedFaq.category] || selectedFaq.category}
                  </Badge>
                  <h4 className="font-semibold text-sm mb-3 text-foreground">{selectedFaq.question}</h4>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedFaq.answer}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Search */}
                <div className="px-3 py-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar pergunta..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-7 text-xs"
                    />
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 1 && (
                  <div className="flex gap-1 px-3 py-1.5 border-b border-border overflow-x-auto">
                    <Badge
                      variant={!selectedCategory ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px] shrink-0 h-5"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Todas
                    </Badge>
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        className="cursor-pointer text-[10px] shrink-0 h-5"
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                      >
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* FAQ list */}
                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">Carregando...</div>
                  ) : !filteredFaqs?.length ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      <MessageCircleQuestion className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Nenhuma pergunta encontrada
                    </div>
                  ) : (
                    <div className="p-1.5 space-y-0.5">
                      {filteredFaqs.map((faq, index) => (
                        <motion.button
                          key={faq.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          onClick={() => setSelectedFaq(faq)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <MessageCircleQuestion className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {faq.question}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
