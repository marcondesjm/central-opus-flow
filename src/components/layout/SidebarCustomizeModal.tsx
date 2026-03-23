import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GripVertical, LayoutDashboard, Star, Archive, Tag, Kanban, FileText, Receipt, Share2, Globe, BookOpen, Users } from 'lucide-react';

export interface SidebarVisibility {
  favorites: boolean;
  archived: boolean;
  tags: boolean;
  kanban: boolean;
  proposals: boolean;
  billing: boolean;
  collaborations: boolean;
  wordpress: boolean;
  blog: boolean;
  teams: boolean;
}

const STORAGE_KEY = 'sidebar-visibility';

const DEFAULT_VISIBILITY: SidebarVisibility = {
  favorites: true,
  archived: true,
  tags: true,
  kanban: true,
  proposals: true,
  billing: true,
  collaborations: true,
  wordpress: true,
  blog: true,
  teams: true,
};

export function getSidebarVisibility(): SidebarVisibility {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_VISIBILITY;
}

function saveSidebarVisibility(v: SidebarVisibility) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}

const ITEMS: { key: keyof SidebarVisibility; label: string; icon: React.ElementType }[] = [
  { key: 'favorites', label: 'Favoritos', icon: Star },
  { key: 'archived', label: 'Arquivados', icon: Archive },
  { key: 'tags', label: 'Tags', icon: Tag },
  { key: 'kanban', label: 'Kanban', icon: Kanban },
  { key: 'proposals', label: 'Propostas', icon: FileText },
  { key: 'billing', label: 'Faturamento', icon: Receipt },
  { key: 'collaborations', label: 'Colaborações', icon: Share2 },
  { key: 'wordpress', label: 'WordPress', icon: Globe },
  { key: 'blog', label: 'Blog', icon: BookOpen },
  { key: 'teams', label: 'Equipes', icon: Users },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (v: SidebarVisibility) => void;
}

export function SidebarCustomizeModal({ open, onOpenChange, onUpdate }: Props) {
  const [visibility, setVisibility] = useState<SidebarVisibility>(getSidebarVisibility);

  useEffect(() => {
    if (open) setVisibility(getSidebarVisibility());
  }, [open]);

  const handleToggle = (key: keyof SidebarVisibility) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveSidebarVisibility(visibility);
    onUpdate(visibility);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GripVertical className="w-5 h-5 text-muted-foreground" />
            Personalizar barra lateral
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          {/* All Projects is always visible */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Páginas de destino</span>
            </div>
            <span className="text-xs text-muted-foreground">Sempre visível</span>
          </div>

          {ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor={`sidebar-${item.key}`} className="text-sm font-medium cursor-pointer">
                    {item.label}
                  </Label>
                </div>
                <Switch
                  id={`sidebar-${item.key}`}
                  checked={visibility[item.key]}
                  onCheckedChange={() => handleToggle(item.key)}
                />
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
