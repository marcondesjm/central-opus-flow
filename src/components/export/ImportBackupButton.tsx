import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useCreateAccount, useCreateProject, useCreateTag, useAccounts, useTags, useProjects, useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { saveAccountLocalKeys, getLocalKeys } from '@/hooks/useLocalKeys';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
    localKeys?: Record<string, any>;
    checklists?: any[];
  };
  summary: {
    totalAccounts: number;
    totalProjects: number;
    totalTags: number;
    totalLocalKeys?: number;
    totalChecklists?: number;
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
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch existing data to match by email/name
  const { data: existingAccounts = [] } = useAccounts();
  const { data: existingTags = [] } = useTags();
  const { data: existingProjects = [] } = useProjects();
  
  const createAccount = useCreateAccount();
  const createProject = useCreateProject();
  const createTag = useCreateTag();
  const updateProject = useUpdateProject();

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
        setOverwriteExisting(false);
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
    if (!backupData || !user) return;
    
    setImporting(true);
    setConfirmOpen(false);
    
    try {
      let accountsImported = 0;
      let projectsImported = 0;
      let projectsUpdated = 0;
      let tagsImported = 0;
      let projectsSkipped = 0;
      let keysImported = 0;
      let checklistsImported = 0;
      
      // Map old IDs to new IDs
      const accountIdMap = new Map<string, string>();
      const tagIdMap = new Map<string, string>();
      const projectIdMap = new Map<string, string>();

      // First, map existing accounts by email to handle duplicates
      for (const account of backupData.data.accounts) {
        const existingAccount = existingAccounts.find(a => a.email === account.email);
        if (existingAccount) {
          accountIdMap.set(account.id, existingAccount.id);
          console.log(`Conta existente encontrada: ${account.email} -> ${existingAccount.id}`);
        } else {
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
            console.warn('Erro ao criar conta:', account.email, e);
          }
        }
      }

      // Map existing tags by name
      for (const tag of backupData.data.tags) {
        const existingTag = existingTags.find(t => t.name.toLowerCase() === tag.name.toLowerCase());
        if (existingTag) {
          tagIdMap.set(tag.id, existingTag.id);
        } else {
          try {
            const result = await createTag.mutateAsync({
              name: tag.name,
              color: tag.color || 'blue',
            });
            tagIdMap.set(tag.id, result.id);
            tagsImported++;
          } catch (e) {
            console.warn('Erro ao criar tag:', tag.name, e);
          }
        }
      }

      // Import projects
      for (const project of backupData.data.projects) {
        const newAccountId = accountIdMap.get(project.accountId);
        if (!newAccountId) {
          console.warn('Conta não encontrada para projeto:', project.name, 'accountId:', project.accountId);
          projectsSkipped++;
          continue;
        }

        // Check if project already exists (by name and account)
        const existingProject = existingProjects.find(
          p => p.name.toLowerCase() === project.name.toLowerCase() && p.account_id === newAccountId
        );

        if (existingProject) {
          projectIdMap.set(project.id, existingProject.id);
          
          if (overwriteExisting) {
            // Update existing project
            try {
              await updateProject.mutateAsync({
                id: existingProject.id,
                description: project.description || '',
                url: project.url || '',
                status: project.status || 'draft',
                type: project.type || 'other',
                progress: project.progress || 0,
                is_favorite: project.isFavorite || false,
                notes: project.notes || '',
                screenshot: project.screenshot || null,
                deadline: project.deadline || null,
              });
              projectsUpdated++;
            } catch (e) {
              console.warn('Erro ao atualizar projeto:', project.name, e);
              projectsSkipped++;
            }
          } else {
            console.log('Projeto já existe (ignorado):', project.name);
            projectsSkipped++;
          }
        } else {
          // Create new project
          try {
            const result = await createProject.mutateAsync({
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
            projectIdMap.set(project.id, result.id);
            projectsImported++;
          } catch (e: any) {
            console.warn('Erro ao importar projeto:', project.name, e);
            projectsSkipped++;
          }
        }
      }

      // Import local keys
      if (backupData.data.localKeys) {
        const existingLocalKeys = getLocalKeys();
        
        for (const [oldAccountId, keys] of Object.entries(backupData.data.localKeys)) {
          const newAccountId = accountIdMap.get(oldAccountId);
          if (newAccountId && keys && typeof keys === 'object') {
            // Merge with existing keys if overwrite is enabled, otherwise only add new
            if (overwriteExisting || !existingLocalKeys[newAccountId]) {
              saveAccountLocalKeys(newAccountId, keys as any);
              keysImported++;
            }
          }
        }
      }

      // Import checklists
      if (backupData.data.checklists && backupData.data.checklists.length > 0) {
        for (const checklist of backupData.data.checklists) {
          const newProjectId = projectIdMap.get(checklist.projectId);
          if (!newProjectId) {
            console.warn('Projeto não encontrado para checklist:', checklist.title);
            continue;
          }

          try {
            // Check if checklist item already exists
            const { data: existing } = await supabase
              .from('project_checklists')
              .select('id')
              .eq('project_id', newProjectId)
              .eq('title', checklist.title)
              .single();

            if (existing && !overwriteExisting) {
              console.log('Checklist já existe (ignorado):', checklist.title);
              continue;
            }

            if (existing && overwriteExisting) {
              // Update existing checklist
              await supabase
                .from('project_checklists')
                .update({
                  is_completed: checklist.isCompleted,
                  completed_at: checklist.completedAt,
                  position: checklist.position,
                })
                .eq('id', existing.id);
              checklistsImported++;
            } else {
              // Create new checklist
              await supabase
                .from('project_checklists')
                .insert({
                  project_id: newProjectId,
                  user_id: user.id,
                  title: checklist.title,
                  is_completed: checklist.isCompleted || false,
                  completed_at: checklist.completedAt || null,
                  position: checklist.position || 0,
                });
              checklistsImported++;
            }
          } catch (e) {
            console.warn('Erro ao importar checklist:', checklist.title, e);
          }
        }
      }

      const parts = [];
      if (accountsImported > 0) parts.push(`${accountsImported} contas criadas`);
      if (projectsImported > 0) parts.push(`${projectsImported} projetos criados`);
      if (projectsUpdated > 0) parts.push(`${projectsUpdated} projetos atualizados`);
      if (tagsImported > 0) parts.push(`${tagsImported} tags criadas`);
      if (keysImported > 0) parts.push(`${keysImported} keys restauradas`);
      if (checklistsImported > 0) parts.push(`${checklistsImported} itens de checklist`);
      if (projectsSkipped > 0) parts.push(`${projectsSkipped} projetos ignorados`);

      toast({
        title: 'Backup importado!',
        description: parts.join(', ') + '.',
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
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Deseja importar os dados do backup?</p>
                {backupData && (
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <p><strong>{backupData.summary.totalAccounts}</strong> contas</p>
                    <p><strong>{backupData.summary.totalProjects}</strong> projetos</p>
                    <p><strong>{backupData.summary.totalTags}</strong> tags</p>
                    {backupData.summary.totalLocalKeys !== undefined && (
                      <p><strong>{backupData.summary.totalLocalKeys}</strong> keys de integração</p>
                    )}
                    {backupData.summary.totalChecklists !== undefined && (
                      <p><strong>{backupData.summary.totalChecklists}</strong> itens de checklist</p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="overwrite" 
                    checked={overwriteExisting}
                    onCheckedChange={(checked) => setOverwriteExisting(checked === true)}
                  />
                  <Label 
                    htmlFor="overwrite" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Sobrescrever dados existentes
                  </Label>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {overwriteExisting 
                    ? 'Projetos, keys e checklists existentes serão atualizados com os dados do backup.'
                    : 'Dados duplicados serão ignorados.'}
                </p>
              </div>
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
