import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUpdateProject, Project, useAccounts } from '@/hooks/useProjects';
import { CalendarIcon, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectEditFormProps {
  project: Project;
  onSaved?: () => void;
}

export function ProjectEditForm({ project, onSaved }: ProjectEditFormProps) {
  const updateProject = useUpdateProject();
  const { data: accounts = [] } = useAccounts();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [url, setUrl] = useState(project.url || '');
  const [status, setStatus] = useState(project.status);
  const [type, setType] = useState(project.type);
  const [notes, setNotes] = useState(project.notes || '');
  const [progress, setProgress] = useState(project.progress);
  const [deadline, setDeadline] = useState<Date | undefined>(
    project.deadline ? new Date(project.deadline) : undefined
  );
  const [accountId, setAccountId] = useState(project.account_id);

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || '');
    setUrl(project.url || '');
    setStatus(project.status);
    setType(project.type);
    setNotes(project.notes || '');
    setProgress(project.progress);
    setDeadline(project.deadline ? new Date(project.deadline) : undefined);
    setAccountId(project.account_id);
  }, [project]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Nome do projeto é obrigatório');
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: project.id,
        name: name.trim(),
        description: description.trim() || null,
        url: url.trim() || null,
        status,
        type,
        notes: notes.trim() || null,
        progress,
        deadline: deadline ? deadline.toISOString() : null,
        account_id: accountId,
        previousData: project,
      });
      toast.success('Projeto atualizado!');
      onSaved?.();
    } catch {
      toast.error('Erro ao atualizar projeto');
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Nome do projeto</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do projeto" />
      </div>

      {/* Account + Type row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Conta</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tipo</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="landing">Landing Page</SelectItem>
              <SelectItem value="app">App</SelectItem>
              <SelectItem value="funnel">Funil</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status + Progress row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Status</Label>
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="review">Em revisão</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="changes">Ajustes</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Progresso (%)</Label>
          <Input 
            type="number" min={0} max={100} 
            value={progress} 
            onChange={e => setProgress(Number(e.target.value))} 
          />
        </div>
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">URL do projeto</Label>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
      </div>

      {/* Deadline */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Prazo</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn('w-full justify-start text-left text-xs font-normal', !deadline && 'text-muted-foreground')}>
              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
              {deadline ? format(deadline, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Sem prazo definido'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={deadline} onSelect={setDeadline} locale={ptBR} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Descrição</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o projeto..." rows={3} />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Notas internas</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas e observações..." rows={2} />
      </div>

      {/* Save */}
      <Button onClick={handleSave} disabled={updateProject.isPending} className="w-full gap-2">
        {updateProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Salvar alterações
      </Button>
    </div>
  );
}
