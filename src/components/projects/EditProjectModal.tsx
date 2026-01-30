import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpdateProject, useAccounts, useTags, Project } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, FileEdit, History, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CoverUpload } from './CoverUpload';
import { DeadlinePicker } from './DeadlinePicker';
import { ProjectHistoryPanel } from './ProjectHistoryPanel';
import { ProjectChecklist } from './ProjectChecklist';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

const projectTypes = [
  { value: 'website', label: 'Website' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'app', label: 'Aplicativo' },
  { value: 'funnel', label: 'Funil' },
  { value: 'other', label: 'Outro' },
] as const;

const projectStatuses = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
] as const;

const tagColors: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  green: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  yellow: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  red: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  purple: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400',
  pink: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:text-pink-400',
  indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400',
};

export function EditProjectModal({ open, onOpenChange, project }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [accountId, setAccountId] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [type, setType] = useState<'website' | 'landing' | 'app' | 'funnel' | 'other'>('website');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('draft');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  
  const { data: accounts = [] } = useAccounts();
  const { data: tags = [] } = useTags();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setUrl(project.url || '');
      setAccountId(project.account_id);
      setCoverUrl(project.screenshot || null);
      setType(project.type as typeof type);
      setStatus(project.status as typeof status);
      setNotes(project.notes || '');
      setSelectedTags(project.tags?.map(t => t.id) || []);
      setDeadline(project.deadline ? new Date(project.deadline) : null);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project || !name.trim() || !accountId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e selecione uma conta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: project.id,
        name: name.trim(),
        description: description.trim() || null,
        url: url.trim() || null,
        account_id: accountId,
        screenshot: coverUrl,
        type,
        status,
        notes: notes.trim() || null,
        tagIds: selectedTags,
        deadline: deadline?.toISOString() || null,
      });
      
      toast({
        title: 'Projeto atualizado!',
        description: `O projeto "${name}" foi atualizado.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar projeto',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getTagColor = (color: string) => {
    return tagColors[color] || tagColors.blue;
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
          <DialogDescription>
            Atualize as informações do projeto.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-2">
              <FileEdit className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Cover Upload */}
          <div className="space-y-2">
            <Label>Capa do projeto</Label>
            <CoverUpload 
              coverUrl={coverUrl} 
              onCoverChange={setCoverUrl}
              disabled={updateProject.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-project-name">Nome do projeto *</Label>
            <Input
              id="edit-project-name"
              placeholder="Ex: Minha Landing Page"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-project-account">Conta Lovable *</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-project-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-project-url">URL do projeto</Label>
            <Input
              id="edit-project-url"
              type="url"
              placeholder="https://meu-projeto.lovable.app"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-project-description">Descrição</Label>
            <Textarea
              id="edit-project-description"
              placeholder="Descreva seu projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-project-notes">Notas</Label>
            <Textarea
              id="edit-project-notes"
              placeholder="Anotações sobre o projeto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          {/* Tags Selection */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Tags</span>
              {selectedTags.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {selectedTags.length} selecionada{selectedTags.length !== 1 ? 's' : ''}
                </span>
              )}
            </Label>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-muted/30">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className={cn(
                        'cursor-pointer transition-all duration-200 px-3 py-1',
                        isSelected 
                          ? cn(getTagColor(tag.color), 'ring-2 ring-primary/30') 
                          : 'hover:bg-muted'
                      )}
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                      {isSelected && (
                        <X className="w-3 h-3 ml-1.5" />
                      )}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Nenhuma tag criada. Vá em Tags no menu para criar.
                </p>
              </div>
            )}
          </div>

          {/* Deadline Picker */}
          <div className="space-y-2">
            <Label>Prazo de entrega</Label>
            <DeadlinePicker
              value={deadline}
              onChange={setDeadline}
              disabled={updateProject.isPending}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProject.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
          </TabsContent>
          
          <TabsContent value="checklist" className="mt-4">
            <ProjectChecklist projectId={project.id} isOwner={true} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <ProjectHistoryPanel projectId={project.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
