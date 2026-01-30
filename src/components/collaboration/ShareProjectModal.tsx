import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Share2, 
  Mail, 
  UserPlus, 
  Trash2, 
  Crown,
  Eye,
  Pencil,
  Shield,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { useCollaboration, CollaborationRole, ProjectCollaborator } from '@/hooks/useCollaboration';
import { toast } from 'sonner';

interface ShareProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

const roleLabels: Record<CollaborationRole, string> = {
  viewer: 'Visualizador',
  editor: 'Editor',
  admin: 'Administrador'
};

const roleIcons: Record<CollaborationRole, React.ReactNode> = {
  viewer: <Eye className="w-4 h-4" />,
  editor: <Pencil className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />
};

export function ShareProjectModal({ 
  open, 
  onOpenChange, 
  projectId, 
  projectName,
  isOwner 
}: ShareProjectModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaborationRole>('viewer');
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
  const [copied, setCopied] = useState(false);
  
  const { 
    inviteToProject, 
    fetchProjectCollaborators,
    removeProjectCollaborator,
    updateProjectCollaboratorRole
  } = useCollaboration();

  useEffect(() => {
    if (open && projectId) {
      loadCollaborators();
    }
  }, [open, projectId]);

  const loadCollaborators = async () => {
    const data = await fetchProjectCollaborators(projectId);
    setCollaborators(data);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast.error('Digite um email válido');
      return;
    }

    setLoading(true);
    const result = await inviteToProject(projectId, email.trim(), role, projectName);
    setLoading(false);

    if (result.success) {
      setEmail('');
      await loadCollaborators();
    } else {
      toast.error(result.error || 'Erro ao enviar convite');
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    const result = await removeProjectCollaborator(collaboratorId);
    if (result.success) {
      await loadCollaborators();
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: CollaborationRole) => {
    const result = await updateProjectCollaboratorRole(collaboratorId, newRole);
    if (result.success) {
      await loadCollaborators();
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/project/${projectId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar Projeto
          </DialogTitle>
          <DialogDescription>
            Compartilhe "{projectName}" com outros usuários
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isOwner && (
            <>
              {/* Invite Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Convidar por email</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                      />
                    </div>
                    <Select value={role} onValueChange={(v) => setRole(v as CollaborationRole)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Visualizador
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Editor
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleInvite} disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Enviar Convite
                </Button>
              </div>

              <Separator />
            </>
          )}

          {/* Collaborators List */}
          <div className="space-y-3">
            <Label>Colaboradores ({collaborators.length})</Label>
            
            {collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum colaborador ainda
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {collaborators.map((collab) => (
                  <div 
                    key={collab.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={collab.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {collab.invited_email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {collab.profile?.full_name || collab.invited_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {collab.invited_email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!collab.accepted_at && (
                        <Badge variant="outline" className="text-xs">
                          Pendente
                        </Badge>
                      )}
                      
                      {isOwner ? (
                        <>
                          <Select 
                            value={collab.role} 
                            onValueChange={(v) => handleRoleChange(collab.id, v as CollaborationRole)}
                          >
                            <SelectTrigger className="w-28 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Visualizador</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemove(collab.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {roleIcons[collab.role]}
                          {roleLabels[collab.role]}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Copy Link */}
          <div className="space-y-2">
            <Label>Ou copie o link do projeto</Label>
            <Button variant="outline" className="w-full" onClick={copyLink}>
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
