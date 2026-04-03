import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CONTENT_TYPES } from '@/hooks/useContentItems';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: string) => void;
}

export function ContentTypeSelectorModal({ open, onOpenChange, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">O que deseja criar?</h2>
            <p className="text-sm text-muted-foreground">Selecione o tipo de conteúdo</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Redes Sociais</p>
            <div className="grid grid-cols-4 gap-2">
              {CONTENT_TYPES.social.map((type) => (
                <button
                  key={type.value}
                  onClick={() => { onSelect(type.value); onOpenChange(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-background hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Outros</p>
            <div className="grid grid-cols-4 gap-2">
              {CONTENT_TYPES.outros.map((type) => (
                <button
                  key={type.value}
                  onClick={() => { onSelect(type.value); onOpenChange(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-background hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary text-center leading-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
