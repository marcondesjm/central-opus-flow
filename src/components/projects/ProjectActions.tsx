import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Archive, 
  Star,
  Copy,
  Share2
} from 'lucide-react';
import { useDeleteProject, useUpdateProject, Project } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { ShareProjectModal } from '@/components/collaboration/ShareProjectModal';

interface ProjectActionsProps {
  project: {
    id: string;
    name: string;
    url?: string | null;
    is_favorite?: boolean;
    status?: string;
  };
  onEdit?: () => void;
  isOwner?: boolean;
}

export function ProjectActions({ project, onEdit, isOwner = true }: ProjectActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(project.id);
      toast({
        title: 'Projeto excluído',
        description: `O projeto "${project.name}" foi excluído.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async () => {
    const newStatus = project.status === 'archived' ? 'draft' : 'archived';
    try {
      await updateProject.mutateAsync({ 
        id: project.id, 
        status: newStatus 
      });
      toast({
        title: newStatus === 'archived' ? 'Projeto arquivado' : 'Projeto restaurado',
        description: `O projeto "${project.name}" foi ${newStatus === 'archived' ? 'arquivado' : 'restaurado'}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyUrl = () => {
    if (project.url) {
      navigator.clipboard.writeText(project.url);
      toast({
        title: 'URL copiada',
        description: 'A URL foi copiada para a área de transferência.',
      });
    }
  };

  const handleOpenUrl = () => {
    if (project.url) {
      window.open(project.url, '_blank');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShareModalOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          )}
          {project.url && (
            <>
              <DropdownMenuItem onClick={handleOpenUrl}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir projeto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar URL
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            {project.status === 'archived' ? 'Restaurar' : 'Arquivar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto "{project.name}" será 
              permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareProjectModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        projectId={project.id}
        projectName={project.name}
        isOwner={isOwner}
      />
    </>
  );
}
