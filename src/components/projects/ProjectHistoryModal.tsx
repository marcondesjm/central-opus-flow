import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectHistoryPanel } from './ProjectHistoryPanel';
import { History } from 'lucide-react';

interface ProjectHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
  projectName?: string;
}

export function ProjectHistoryModal({ 
  open, 
  onOpenChange, 
  projectId,
  projectName 
}: ProjectHistoryModalProps) {
  if (!projectId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Histórico de Alterações
          </DialogTitle>
          {projectName && (
            <p className="text-sm text-muted-foreground">{projectName}</p>
          )}
        </DialogHeader>
        <ProjectHistoryPanel projectId={projectId} />
      </DialogContent>
    </Dialog>
  );
}
