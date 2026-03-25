import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings2, BarChart3, FolderKanban, Star, Wrench, Clock, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

export interface CarouselVisibility {
  slideOverview: boolean;
  slideKanban: boolean;
  statAjustes: boolean;
  statRevisao: boolean;
  statAguardando: boolean;
  statAtrasados: boolean;
  statAprovados: boolean;
  highlightProjects: boolean;
  kanbanSpaces: boolean;
}

const STORAGE_KEY = 'carousel-visibility';

const DEFAULT_VISIBILITY: CarouselVisibility = {
  slideOverview: true,
  slideKanban: true,
  statAjustes: true,
  statRevisao: true,
  statAguardando: true,
  statAtrasados: true,
  statAprovados: true,
  highlightProjects: true,
};

export function getCarouselVisibility(): CarouselVisibility {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_VISIBILITY;
}

function saveCarouselVisibility(v: CarouselVisibility) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}

const SLIDE_ITEMS: { key: keyof CarouselVisibility; label: string; icon: React.ElementType; group: 'slide' }[] = [
  { key: 'slideOverview', label: 'Visão Geral de Projetos', icon: BarChart3, group: 'slide' },
  { key: 'slideKanban', label: 'Monitor Kanban', icon: FolderKanban, group: 'slide' },
];

const STAT_ITEMS: { key: keyof CarouselVisibility; label: string; icon: React.ElementType; group: 'stat' }[] = [
  { key: 'statAjustes', label: 'Card Ajustes', icon: Wrench, group: 'stat' },
  { key: 'statRevisao', label: 'Card Em revisão', icon: Clock, group: 'stat' },
  { key: 'statAguardando', label: 'Card Aguardando', icon: Star, group: 'stat' },
  { key: 'statAtrasados', label: 'Card Atrasados', icon: AlertTriangle, group: 'stat' },
  { key: 'statAprovados', label: 'Card Aprovados', icon: CheckCircle2, group: 'stat' },
];

const EXTRA_ITEMS: { key: keyof CarouselVisibility; label: string; icon: React.ElementType }[] = [
  { key: 'highlightProjects', label: 'Projetos em destaque', icon: Star },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (v: CarouselVisibility) => void;
}

export function CarouselCustomizeModal({ open, onOpenChange, onUpdate }: Props) {
  const [visibility, setVisibility] = useState<CarouselVisibility>(getCarouselVisibility);

  useEffect(() => {
    if (open) setVisibility(getCarouselVisibility());
  }, [open]);

  const handleToggle = (key: keyof CarouselVisibility) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveCarouselVisibility(visibility);
    onUpdate(visibility);
    onOpenChange(false);
  };

  const renderItem = (item: { key: keyof CarouselVisibility; label: string; icon: React.ElementType }) => {
    const Icon = item.icon;
    return (
      <div key={item.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor={`carousel-${item.key}`} className="text-sm font-medium cursor-pointer">
            {item.label}
          </Label>
        </div>
        <Switch
          id={`carousel-${item.key}`}
          checked={visibility[item.key]}
          onCheckedChange={() => handleToggle(item.key)}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-muted-foreground" />
            Personalizar Visão Geral
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Slides */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Painéis</p>
            <div className="space-y-0.5">
              {SLIDE_ITEMS.map(renderItem)}
            </div>
          </div>

          {/* Stats cards */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Cards de Estatísticas</p>
            <div className="space-y-0.5">
              {STAT_ITEMS.map(renderItem)}
            </div>
          </div>

          {/* Extras */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">Extras</p>
            <div className="space-y-0.5">
              {EXTRA_ITEMS.map(renderItem)}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
