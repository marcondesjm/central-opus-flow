import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircleQuestion, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAssistantFaqs, AssistantFaq } from '@/hooks/useAssistantFaqs';
import { useClippySounds } from '@/hooks/useClippySounds';
import { ClippyEyes } from './ClippyEyes';
import clippyImage from '@/assets/clippy-classic.png';
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
  '🤔 Parece que você está explorando... precisa de ajuda?',
];

type ClippyMood = 'normal' | 'happy' | 'thinking' | 'surprised' | 'sleeping' | 'wink';
type ClippyAnimation = 'idle' | 'wave' | 'jump' | 'lean' | 'spin' | 'bounce' | 'peek' | 'knock';

export function ClippyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(() => sessionStorage.getItem('clippy-hidden') === 'true');
  const [selectedFaq, setSelectedFaq] = useState<AssistantFaq | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingText, setGreetingText] = useState('');
  const [mood, setMood] = useState<ClippyMood>('normal');
  const [animation, setAnimation] = useState<ClippyAnimation>('idle');
  const [isTypingBubble, setIsTypingBubble] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const { data: faqs, isLoading } = useAssistantFaqs();
  const sounds = useClippySounds();

  const handleHide = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHidden(true);
    setIsOpen(false);
    setShowGreeting(false);
    sessionStorage.setItem('clippy-hidden', 'true');
    sounds.playClose();
  }, [sounds]);

  // If hidden, render a tiny button to bring him back — moved after all hooks below in JSX

  // Cycle through random idle animations
  useEffect(() => {
    const animations: ClippyAnimation[] = ['wave', 'jump', 'lean', 'bounce', 'peek'];
    const moods: ClippyMood[] = ['happy', 'thinking', 'wink', 'normal'];

    const doRandomAction = () => {
      if (isOpen) return;

      const anim = animations[Math.floor(Math.random() * animations.length)];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];

      setAnimation(anim);
      setMood(randomMood);
      sounds.playTap();

      // Reset after animation
      setTimeout(() => {
        setAnimation('idle');
        setMood('normal');
      }, 2000);
    };

    const interval = setInterval(doRandomAction, 8000 + Math.random() * 12000);
    return () => clearInterval(interval);
  }, [isOpen, sounds]);

  // Go to sleep after inactivity, then knock on screen
  useEffect(() => {
    if (isOpen) {
      setMood('happy');
      return;
    }

    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!isOpen && !showGreeting) {
        // Knock on screen animation before sleeping
        setAnimation('knock');
        setMood('surprised');
        sounds.playTap();
        setTimeout(() => {
          sounds.playTap();
          setTimeout(() => {
            sounds.playTap();
            setTimeout(() => {
              setAnimation('idle');
              setMood('sleeping');
            }, 400);
          }, 200);
        }, 200);
      }
    }, 45000);

    return () => clearTimeout(idleTimerRef.current);
  }, [isOpen, showGreeting, animation, sounds]);

  // Wake up on mouse move near clippy
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mood === 'sleeping') {
        const threshold = 200;
        const clipRect = { right: window.innerWidth, bottom: window.innerHeight - 60 };
        if (
          e.clientX > clipRect.right - threshold &&
          e.clientY > clipRect.bottom - threshold
        ) {
          setMood('surprised');
          sounds.playPop();
          setTimeout(() => setMood('normal'), 1500);
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mood, sounds]);

  // Show greeting after delay on first visit with typing effect
  useEffect(() => {
    const greeted = sessionStorage.getItem('clippy-greeted');
    if (!greeted) {
      const timer = setTimeout(() => {
        const text = greetings[Math.floor(Math.random() * greetings.length)];
        setIsTypingBubble(true);
        sounds.playGreeting();
        setMood('happy');

        // Simulate typing
        setTimeout(() => {
          setGreetingText(text);
          setIsTypingBubble(false);
          setShowGreeting(true);
          sessionStorage.setItem('clippy-greeted', 'true');
        }, 800);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sounds]);

  // Periodically show tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      if (!isOpen && !showGreeting && mood !== 'sleeping') {
        const text = greetings[Math.floor(Math.random() * greetings.length)];
        setIsTypingBubble(true);
        setMood('thinking');
        sounds.playThinking();

        setTimeout(() => {
          setGreetingText(text);
          setIsTypingBubble(false);
          setShowGreeting(true);
          setMood('happy');
          setTimeout(() => {
            setShowGreeting(false);
            setMood('normal');
          }, 6000);
        }, 1000);
      }
    }, 50000 + Math.random() * 30000);

    return () => clearInterval(tipInterval);
  }, [isOpen, showGreeting, mood, sounds]);

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
    setMood('happy');
    setAnimation('jump');
    sounds.playPop();
    setTimeout(() => setAnimation('idle'), 500);
  }, [sounds]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMood('normal');
    sounds.playClose();
  }, [sounds]);

  const handleSelectFaq = useCallback(
    (faq: AssistantFaq) => {
      setSelectedFaq(faq);
      setMood('thinking');
      sounds.playTap();
      setTimeout(() => setMood('happy'), 600);
    },
    [sounds],
  );

  const getAnimationStyle = () => {
    switch (animation) {
      case 'wave':
        return {
          rotate: [0, -15, 15, -10, 10, -5, 0],
          transition: { duration: 1.2, ease: 'easeInOut' as const },
        };
      case 'jump':
        return {
          y: [0, -20, 0, -10, 0],
          transition: { duration: 0.6, ease: 'easeOut' as const },
        };
      case 'lean':
        return {
          rotate: [0, 12, 0],
          x: [0, 5, 0],
          transition: { duration: 1.5, ease: 'easeInOut' as const },
        };
      case 'bounce':
        return {
          scale: [1, 1.15, 0.9, 1.05, 1],
          transition: { duration: 0.8, ease: 'easeInOut' as const },
        };
      case 'peek':
        return {
          x: [0, 8, 0, -8, 0],
          rotate: [0, 5, 0, -5, 0],
          transition: { duration: 1.8, ease: 'easeInOut' as const },
        };
      case 'spin':
        return {
          rotate: [0, 360],
          transition: { duration: 0.8, ease: 'easeInOut' as const },
        };
      case 'knock':
        return {
          x: [0, -6, 2, -6, 2, -4, 0],
          rotate: [0, -8, 3, -8, 3, -4, 0],
          transition: { duration: 0.8, ease: 'easeInOut' as const },
        };
      default: // idle
        return {
          y: [0, -4, 0, -2, 0],
          rotate: [0, -1.5, 1.5, -0.5, 0],
          transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
        };
    }
  };

  if (isHidden) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-[130px] right-3 sm:right-4 lg:bottom-[80px] z-[60] w-8 h-8 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-accent transition-colors"
        onClick={() => {
          setIsHidden(false);
          sessionStorage.removeItem('clippy-hidden');
          setMood('happy');
          setAnimation('wave');
          sounds.playGreeting();
          setTimeout(() => setAnimation('idle'), 1200);
        }}
        title="Mostrar Clippy"
      >
        <MessageCircleQuestion className="w-4 h-4 text-primary" />
      </motion.button>
    );
  }

  return (
    <>
      {/* Speech bubble with typing indicator */}
      <AnimatePresence>
        {(showGreeting || isTypingBubble) && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-[220px] right-3 sm:right-4 lg:bottom-[150px] z-[60] max-w-[230px]"
          >
            <div className="relative bg-card border border-border shadow-lg rounded-xl px-3 py-2.5">
              <button
                onClick={() => {
                  setShowGreeting(false);
                  setIsTypingBubble(false);
                  sounds.playTap();
                }}
                className="absolute -top-2 -right-2 bg-muted hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>

              {isTypingBubble ? (
                <div className="flex items-center gap-1 py-1 px-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60"
                      animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-foreground leading-relaxed">{greetingText}</p>
              )}

              {/* Tail pointing down-right toward clippy */}
              <div className="absolute -bottom-[6px] right-6 w-3 h-3 bg-card border-b border-r border-border rotate-45 transform" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clippy character */}
      <motion.div
        className="fixed bottom-[130px] right-3 sm:right-4 lg:bottom-[80px] z-[60] cursor-pointer select-none group/clippy"
        animate={getAnimationStyle()}
        onClick={handleOpen}
        onMouseEnter={() => {
          if (mood === 'sleeping') {
            setMood('surprised');
            sounds.playPop();
            setTimeout(() => setMood('normal'), 1200);
          } else if (mood !== 'happy') {
            setMood('happy');
          }
        }}
        onMouseLeave={() => {
          if (!isOpen && mood !== 'sleeping') {
            setMood('normal');
          }
        }}
        title="Assistente de Ajuda"
      >
        {/* Shadow */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/10 rounded-full blur-sm"
          animate={{
            scaleX: animation === 'jump' ? [1, 0.6, 1.2, 0.8, 1] : [1, 0.9, 1, 0.95, 1],
            opacity: animation === 'jump' ? [0.3, 0.1, 0.4, 0.2, 0.3] : [0.3, 0.2, 0.3, 0.25, 0.3],
          }}
          transition={{ duration: animation === 'jump' ? 0.6 : 4, repeat: animation === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
        />

        {/* Clippy body */}
        <div className="relative">
          <motion.img
            src={clippyImage}
            alt="Clippy - Assistente"
            className="w-16 h-24 object-contain drop-shadow-lg"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            style={{ filter: mood === 'sleeping' ? 'brightness(0.85) saturate(0.7)' : 'none' }}
          />

          {/* Sleeping Zzz */}
          {mood === 'sleeping' && (
            <div className="absolute -top-1 -right-2">
              <motion.span
                className="text-[10px] font-bold text-muted-foreground"
                animate={{ opacity: [0, 1, 0], y: [0, -8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                z
              </motion.span>
              <motion.span
                className="text-xs font-bold text-muted-foreground absolute -top-2 left-2"
                animate={{ opacity: [0, 1, 0], y: [0, -10] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                Z
              </motion.span>
            </div>
          )}

          {/* Close/Hide button */}
          <button
            onClick={handleHide}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover/clippy:opacity-100"
            title="Ocultar Clippy"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </motion.div>

      {/* FAQ Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[230px] right-3 sm:right-4 lg:bottom-[170px] z-[60] w-[calc(100vw-1.5rem)] sm:w-[340px] max-w-[340px] max-h-[60vh] sm:max-h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
              <motion.div
                className="relative w-9 h-11 shrink-0"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={clippyImage} alt="Clippy" className="w-full h-full object-contain" />
                <div className="absolute top-[2px] left-1/2 -translate-x-1/2 scale-[0.45]">
                  <ClippyEyes mood="happy" size={0.5} />
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">Assistente</h3>
                <p className="text-[11px] text-muted-foreground">Como posso te ajudar? 😊</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleClose}>
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
                    onClick={() => {
                      setSelectedFaq(null);
                      sounds.playTap();
                      setMood('normal');
                    }}
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
                      onChange={(e) => {
                        setSearch(e.target.value);
                        if (e.target.value) setMood('thinking');
                        else setMood('happy');
                      }}
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
                      onClick={() => {
                        setSelectedCategory(null);
                        sounds.playTap();
                      }}
                    >
                      Todas
                    </Badge>
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        className="cursor-pointer text-[10px] shrink-0 h-5"
                        onClick={() => {
                          setSelectedCategory(cat === selectedCategory ? null : cat);
                          sounds.playTap();
                        }}
                      >
                        {categoryLabels[cat] || cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* FAQ list */}
                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-2"
                      />
                      Carregando...
                    </div>
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
                          onClick={() => handleSelectFaq(faq)}
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
