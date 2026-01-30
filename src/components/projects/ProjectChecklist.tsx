import { useState } from 'react';
import { 
  useProjectChecklist, 
  useAddChecklistItem, 
  useToggleChecklistItem, 
  useUpdateChecklistItem, 
  useDeleteChecklistItem 
} from '@/hooks/useProjectChecklist';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  Circle,
  GripVertical,
  Pencil,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ProjectChecklistProps {
  projectId: string;
  isOwner?: boolean;
}

export function ProjectChecklist({ projectId, isOwner = true }: ProjectChecklistProps) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const { data: items = [], isLoading } = useProjectChecklist(projectId);
  const addItem = useAddChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const { toast } = useToast();

  const completedCount = items.filter(item => item.is_completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    try {
      await addItem.mutateAsync({ projectId, title: newItemTitle.trim() });
      setNewItemTitle('');
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await toggleItem.mutateAsync({ 
        id, 
        projectId, 
        isCompleted: !currentState 
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingTitle.trim()) return;

    try {
      await updateItem.mutateAsync({ 
        id: editingId, 
        projectId, 
        title: editingTitle.trim() 
      });
      setEditingId(null);
      setEditingTitle('');
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem.mutateAsync({ id, projectId });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir item',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">
            {completedCount} de {totalCount} ({Math.round(progressPercent)}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Add New Item Form (only for owners) */}
      {isOwner && (
        <form onSubmit={handleAddItem} className="flex gap-2">
          <Input
            placeholder="Adicionar nova tarefa..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={addItem.isPending || !newItemTitle.trim()}
          >
            {addItem.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}

      {/* Checklist Items */}
      <div className="space-y-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Circle className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa adicionada ainda
            </p>
            {isOwner && (
              <p className="text-xs text-muted-foreground mt-1">
                Adicione tarefas para acompanhar o progresso
              </p>
            )}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-lg border transition-all',
                item.is_completed 
                  ? 'bg-muted/30 border-muted' 
                  : 'bg-card border-border hover:border-primary/30'
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              
              <Checkbox
                checked={item.is_completed}
                onCheckedChange={() => handleToggle(item.id, item.is_completed)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />

              {editingId === item.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={handleSaveEdit}
                    disabled={updateItem.isPending}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <>
                  <span 
                    className={cn(
                      'flex-1 text-sm transition-all',
                      item.is_completed && 'line-through text-muted-foreground'
                    )}
                  >
                    {item.title}
                  </span>

                  {item.is_completed && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}

                  {isOwner && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(item.id, item.title)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteItem.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
