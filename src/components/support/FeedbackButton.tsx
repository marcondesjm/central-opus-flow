import { useState } from 'react';
import { MessageSquare, Send, Star, Bug, Lightbulb, ThumbsUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FeedbackButtonProps {
  className?: string;
}

const feedbackTypes = [
  { id: 'bug', label: 'Bug/Problema', icon: Bug, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'suggestion', label: 'Sugestão', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'compliment', label: 'Elogio', icon: ThumbsUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'other', label: 'Outro', icon: MessageSquare, color: 'text-primary bg-primary/10 border-primary/30' },
];

export function FeedbackButton({ className }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const phoneNumber = '5548996029392';

  const handleSubmit = () => {
    if (!selectedType) {
      toast({
        title: 'Selecione um tipo',
        description: 'Escolha o tipo de feedback que deseja enviar.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Digite sua mensagem',
        description: 'Por favor, descreva seu feedback.',
        variant: 'destructive',
      });
      return;
    }

    const typeLabel = feedbackTypes.find(t => t.id === selectedType)?.label || 'Feedback';
    const stars = rating > 0 ? `\n⭐ Avaliação: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)` : '';
    
    const whatsappMessage = encodeURIComponent(
      `📣 *Feedback - Central Opus Flow*\n\n` +
      `📌 Tipo: ${typeLabel}${stars}\n\n` +
      `💬 Mensagem:\n${message.trim()}\n\n` +
      `---\n` +
      `Enviado via Dashboard`
    );

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: 'Redirecionando para WhatsApp',
      description: 'Obrigado pelo seu feedback!',
    });

    // Reset form
    setSelectedType(null);
    setRating(0);
    setMessage('');
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setSelectedType(null);
      setRating(0);
      setMessage('');
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 text-muted-foreground hover:text-foreground',
            className
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Sua opinião é muito importante para melhorarmos o sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Feedback Type */}
          <div className="space-y-2">
            <Label>Tipo de feedback</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left',
                      isSelected
                        ? type.color + ' border-current'
                        : 'border-border bg-background hover:bg-muted'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isSelected ? '' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', isSelected ? '' : 'text-foreground')}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Como você avalia sua experiência? (opcional)</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      'w-7 h-7 transition-colors',
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Sua mensagem *</Label>
            <Textarea
              id="feedback-message"
              placeholder="Descreva seu feedback, sugestão ou problema encontrado..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Send className="w-4 h-4" />
            Enviar via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
