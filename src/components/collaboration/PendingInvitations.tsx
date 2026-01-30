import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Check, 
  X, 
  FolderKanban, 
  Users,
  Loader2
} from 'lucide-react';
import { useCollaboration, ProjectCollaborator, AccountCollaborator } from '@/hooks/useCollaboration';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function PendingInvitations() {
  const { pendingInvitations, acceptProjectInvitation, acceptAccountInvitation } = useCollaboration();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (pendingInvitations.length === 0) return null;

  const isProjectInvitation = (inv: ProjectCollaborator | AccountCollaborator): inv is ProjectCollaborator => {
    return 'project_id' in inv;
  };

  const handleAccept = async (invitation: ProjectCollaborator | AccountCollaborator) => {
    setLoadingId(invitation.id);
    
    if (isProjectInvitation(invitation)) {
      await acceptProjectInvitation(invitation.id);
    } else {
      await acceptAccountInvitation(invitation.id);
    }
    
    setLoadingId(null);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5 text-primary" />
          Convites Pendentes
        </CardTitle>
        <CardDescription>
          Você tem {pendingInvitations.length} convite(s) aguardando resposta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingInvitations.map((invitation) => (
          <div 
            key={invitation.id}
            className="flex items-center justify-between p-4 bg-background rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {isProjectInvitation(invitation) ? (
                  <FolderKanban className="w-5 h-5 text-primary" />
                ) : (
                  <Users className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {isProjectInvitation(invitation) 
                    ? 'Convite para projeto' 
                    : 'Convite para conta'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(invitation.created_at), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {invitation.role === 'viewer' && 'Visualizador'}
                {invitation.role === 'editor' && 'Editor'}
                {invitation.role === 'admin' && 'Admin'}
              </Badge>
              
              <Button 
                size="sm"
                onClick={() => handleAccept(invitation)}
                disabled={loadingId === invitation.id}
              >
                {loadingId === invitation.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Aceitar
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
