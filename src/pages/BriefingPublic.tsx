import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBriefingByToken, submitBriefingResponse, DEFAULT_QUESTIONS, BRIEFING_TYPES, type Briefing, type BriefingQuestion, type BriefingResponse } from '@/hooks/useBriefings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronLeft, ChevronRight, Send, Loader2, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BriefingPublic() {
  const { token } = useParams<{ token: string }>();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const questions: BriefingQuestion[] = briefing ? (DEFAULT_QUESTIONS[briefing.briefing_type] || DEFAULT_QUESTIONS.custom) : [];
  const currentQ = questions[currentStep];
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
  const typeInfo = briefing ? BRIEFING_TYPES.find(t => t.value === briefing.briefing_type) : null;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchBriefingByToken(token).then(data => {
      setBriefing(data);
      if (data?.status === 'answered') setSubmitted(true);
      setLoading(false);
    }).catch(() => { setError('Briefing não encontrado'); setLoading(false); });
  }, [token]);

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const toggleMulti = (id: string, option: string) => {
    const current = (answers[id] as string[]) || [];
    setAnswer(id, current.includes(option) ? current.filter(o => o !== option) : [...current, option]);
  };

  const canProceed = () => {
    if (!currentQ?.required) return true;
    const a = answers[currentQ.id];
    if (Array.isArray(a)) return a.length > 0;
    return !!a && a.trim() !== '';
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const responses: BriefingResponse[] = questions.map(q => ({
        questionId: q.id,
        question: q.question,
        answer: answers[q.id] || '',
      }));
      await submitBriefingResponse(token, responses);
      setSubmitted(true);
    } catch {
      setError('Erro ao enviar respostas. Tente novamente.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Briefing não encontrado</h2>
          <p className="text-muted-foreground text-sm">{error || 'O link pode ter expirado ou estar incorreto.'}</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Briefing enviado!</h2>
          <p className="text-muted-foreground text-sm">Obrigado por preencher o briefing. Suas respostas foram salvas com sucesso.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: (typeInfo?.color || '#6b7280') + '20' }}>
              {typeInfo?.icon || '📋'}
            </div>
            <div>
              <h1 className="font-bold text-foreground">{briefing.title}</h1>
              <p className="text-xs text-muted-foreground">{typeInfo?.label} • Para: {briefing.client_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Pergunta {currentStep + 1} de {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {currentQ && (
              <Card className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary-foreground">{currentStep + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">
                      {currentQ.question}
                      {currentQ.required && <span className="text-destructive ml-1">*</span>}
                    </h2>
                  </div>
                </div>

                <div className="pl-11">
                  {(currentQ.type === 'text') && (
                    <Input
                      placeholder={currentQ.placeholder || 'Digite sua resposta...'}
                      value={(answers[currentQ.id] as string) || ''}
                      onChange={e => setAnswer(currentQ.id, e.target.value)}
                      autoFocus
                    />
                  )}

                  {(currentQ.type === 'textarea') && (
                    <Textarea
                      placeholder={currentQ.placeholder || 'Digite sua resposta...'}
                      value={(answers[currentQ.id] as string) || ''}
                      onChange={e => setAnswer(currentQ.id, e.target.value)}
                      rows={4}
                      autoFocus
                    />
                  )}

                  {(currentQ.type === 'select') && currentQ.options && (
                    <div className="grid grid-cols-2 gap-2">
                      {currentQ.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setAnswer(currentQ.id, opt)}
                          className={`p-3 rounded-lg border text-sm text-left transition-all ${
                            answers[currentQ.id] === opt
                              ? 'border-primary bg-primary/10 text-foreground font-medium'
                              : 'border-border hover:border-primary/50 text-muted-foreground'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {(currentQ.type === 'multiselect') && currentQ.options && (
                    <div className="grid grid-cols-2 gap-2">
                      {currentQ.options.map(opt => {
                        const selected = ((answers[currentQ.id] as string[]) || []).includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleMulti(currentQ.id, opt)}
                            className={`p-3 rounded-lg border text-sm text-left transition-all ${
                              selected
                                ? 'border-primary bg-primary/10 text-foreground font-medium'
                                : 'border-border hover:border-primary/50 text-muted-foreground'
                            }`}
                          >
                            <span className={`inline-block w-4 h-4 rounded border mr-2 align-middle ${selected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                              {selected && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(s => s - 1)}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          {currentStep < questions.length - 1 ? (
            <Button
              disabled={!canProceed()}
              onClick={() => setCurrentStep(s => s + 1)}
              className="gap-1"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              disabled={!canProceed() || submitting}
              onClick={handleSubmit}
              className="gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? 'Enviando...' : 'Enviar respostas'}
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-primary">Central Flow</span>
        </p>
      </div>
    </div>
  );
}
