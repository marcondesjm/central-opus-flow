import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useCreateAccount, useCreateProject, useCreateTag } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
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

interface ImportBackupButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

interface BackupData {
  version: string;
  data: {
    accounts: any[];
    projects: any[];
    tags: any[];
  };
  summary: {
    totalAccounts: number;
    totalProjects: number;
    totalTags: number;
  };
}

export function ImportBackupButton({ 
  variant = 'outline', 
  size = 'sm',
  className 
}: ImportBackupButtonProps) {
  const [importing, setImporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const createAccount = useCreateAccount();
  const createProject = useCreateProject();
  const createTag = useCreateTag();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version || !data.data) {
          throw new Error('Arquivo de backup inválido');
        }
        setBackupData(data);
        setConfirmOpen(true);
      } catch (error: any) {
        toast({
          title: 'Erro ao ler arquivo',
          description: error.message || 'O arquivo não é um backup válido.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!backupData) return;
    
    setImporting(true);
    setConfirmOpen(false);
    
    try {
      let accountsImported = 0;
      let projectsImported = 0;
      let tagsImported = 0;
      
      // Map old IDs to new IDs
      const accountIdMap = new Map<string, string>();
      const tagIdMap = new Map<string, string>();

      // Import accounts
      for (const account of backupData.data.accounts) {
        try {
          const result = await createAccount.mutateAsync({
            name: account.name,
            email: account.email,
            color: account.color || 'blue',
            credits: account.credits || 0,
            admin_email: account.admin_email || null,
            supabase_project_id: account.supabase_project_id || null,
            supabase_url: account.supabase_url || null,
            anon_key: account.anon_key || null,
            service_role_key: account.service_role_key || null,
            notes: account.notes || null,
          });
          accountIdMap.set(account.id, result.id);
          accountsImported++;
        } catch (e) {
          console.warn('Conta já existe ou erro:', account.email);
        }
      }

      // Import tags
      for (const tag of backupData.data.tags) {
        try {
          const result = await createTag.mutateAsync({
            name: tag.name,
            color: tag.color || 'blue',
          });
          tagIdMap.set(tag.id, result.id);
          tagsImported++;
        } catch (e) {
          console.warn('Tag já existe ou erro:', tag.name);
        }
      }

      // Import projects
      for (const project of backupData.data.projects) {
        const newAccountId = accountIdMap.get(project.accountId);
        if (!newAccountId) {
          console.warn('Conta não encontrada para projeto:', project.name);
          continue;
        }

        try {
          await createProject.mutateAsync({
            name: project.name,
            description: project.description || '',
            url: project.url || '',
            status: project.status || 'draft',
            type: project.type || 'other',
            progress: project.progress || 0,
            is_favorite: project.isFavorite || false,
            notes: project.notes || '',
            account_id: newAccountId,
            screenshot: project.screenshot || null,
            deadline: project.deadline || null,
          });
          projectsImported++;
        } catch (e) {
          console.warn('Erro ao importar projeto:', project.name);
        }
      }

      toast({
        title: 'Backup importado!',
        description: `${accountsImported} contas, ${projectsImported} projetos e ${tagsImported} tags importados.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao importar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
      setBackupData(null);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        variant={variant}
        size={size}
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className={className}
      >
        {importing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {importing ? 'Importando...' : 'Importar'}
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Deseja importar os dados do backup?</p>
              {backupData && (
                <div className="bg-muted p-3 rounded-lg text-sm mt-2">
                  <p><strong>{backupData.summary.totalAccounts}</strong> contas</p>
                  <p><strong>{backupData.summary.totalProjects}</strong> projetos</p>
                  <p><strong>{backupData.summary.totalTags}</strong> tags</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Dados duplicados serão ignorados.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Importar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
