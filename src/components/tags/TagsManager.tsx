import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTags, useCreateTag, Tag } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface TagsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tagColors = [
  { id: 'blue', class: 'bg-blue-500' },
  { id: 'emerald', class: 'bg-emerald-500' },
  { id: 'amber', class: 'bg-amber-500' },
  { id: 'rose', class: 'bg-rose-500' },
  { id: 'violet', class: 'bg-violet-500' },
  { id: 'cyan', class: 'bg-cyan-500' },
  { id: 'orange', class: 'bg-orange-500' },
  { id: 'pink', class: 'bg-pink-500' },
];

export function TagsManager({ open, onOpenChange }: TagsManagerProps) {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para a tag.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTag.mutateAsync({
        name: newTagName.trim(),
        color: selectedColor,
      });
      
      toast({
        title: 'Tag criada!',
        description: `A tag "${newTagName}" foi criada.`,
      });
      
      setNewTagName('');
      setSelectedColor('blue');
    } catch (error: any) {
      toast({
        title: 'Erro ao criar tag',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    setDeletingTagId(tag.id);
    
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tag.id);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      
      toast({
        title: 'Tag removida',
        description: `A tag "${tag.name}" foi removida.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover tag',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setDeletingTagId(null);
    }
  };

  const getColorClass = (color: string) => {
    const colorObj = tagColors.find(c => c.id === color);
    return colorObj?.class || 'bg-blue-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Tags</DialogTitle>
          <DialogDescription>
            Crie e organize suas tags para categorizar projetos.
          </DialogDescription>
        </DialogHeader>
        
        {/* Create new tag */}
        <form onSubmit={handleCreateTag} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Nova tag</Label>
            <div className="flex gap-2">
              <Input
                id="tag-name"
                placeholder="Nome da tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={createTag.isPending} size="icon">
                {createTag.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {tagColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColor(color.id)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all duration-200',
                    color.class,
                    selectedColor === color.id 
                      ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                      : 'hover:scale-105'
                  )}
                />
              ))}
            </div>
          </div>
        </form>
        
        {/* Existing tags */}
        <div className="space-y-2">
          <Label>Tags existentes</Label>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : tags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Nenhuma tag criada ainda.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('w-3 h-3 rounded-full', getColorClass(tag.color))} />
                    <span className="text-sm">{tag.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteTag(tag)}
                    disabled={deletingTagId === tag.id}
                  >
                    {deletingTagId === tag.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
