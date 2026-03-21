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
import JSZip from 'jszip';
import { useWordPressConnections, useCreateWordPressConnection } from '@/hooks/useWordPress';
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
    wordpressConnections?: any[];
    kanbanColumns?: any[];
    kanbanDeals?: any[];
    kanbanPayments?: any[];
    kanbanExpenses?: any[];
    kanbanChecklist?: any[];
  };
  summary: {
    totalAccounts: number;
    totalProjects: number;
    totalTags: number;
    totalLocalKeys?: number;
    totalChecklists?: number;
    totalWordPressConnections?: number;
    totalKanbanColumns?: number;
    totalKanbanDeals?: number;
    totalKanbanPayments?: number;
    totalKanbanExpenses?: number;
    totalKanbanChecklist?: number;
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
  
  const { data: existingAccounts = [] } = useAccounts();
  const { data: existingTags = [] } = useTags();
  const { data: existingProjects = [] } = useProjects();
  const { data: existingWpConnections = [] } = useWordPressConnections();
  
  const createAccount = useCreateAccount();
  const createProject = useCreateProject();
  const createTag = useCreateTag();
  const updateProject = useUpdateProject();
  const createWpConnection = useCreateWordPressConnection();

  const extractJsonFromZip = async (file: File): Promise<any> => {
    const zip = await JSZip.loadAsync(file);
    const jsonFile = Object.keys(zip.files).find(name => name.endsWith('.json'));
    if (!jsonFile) throw new Error('Nenhum arquivo .json encontrado dentro do arquivo compactado.');
    const content = await zip.files[jsonFile].async('string');
    return JSON.parse(content);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let data: any;
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'zip' || ext === 'wpress') {
        data = await extractJsonFromZip(file);
      } else {
        const text = await file.text();
        data = JSON.parse(text);
      }

      if (!data.version || !data.data) {
        throw new Error('Arquivo de backup inválido');
      }
      setBackupData(data);
      setOverwriteExisting(false);
      setConfirmOpen(true);
    } catch (error: any) {
      toast({ title: 'Erro ao ler arquivo', description: error.message || 'O arquivo não é um backup válido.', variant: 'destructive' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (!backupData || !user) return;
    
    setImporting(true);
    setConfirmOpen(false);
    
    try {
      let accountsImported = 0, projectsImported = 0, projectsUpdated = 0;
      let tagsImported = 0, projectsSkipped = 0, keysImported = 0, checklistsImported = 0;
      
      const accountIdMap = new Map<string, string>();
      const tagIdMap = new Map<string, string>();
      const projectIdMap = new Map<string, string>();
      const dealIdMap = new Map<string, string>();

      // Import accounts
      for (const account of backupData.data.accounts) {
        const existing = existingAccounts.find(a => a.email === account.email);
        if (existing) {
          accountIdMap.set(account.id, existing.id);
        } else {
          try {
            const result = await createAccount.mutateAsync({
              name: account.name, email: account.email, color: account.color || 'blue',
              credits: account.credits || 0, admin_email: account.admin_email || null,
              supabase_project_id: account.supabase_project_id || null,
              supabase_url: account.supabase_url || null, anon_key: account.anon_key || null,
              service_role_key: account.service_role_key || null, notes: account.notes || null,
            });
            accountIdMap.set(account.id, result.id);
            accountsImported++;
          } catch (e) { console.warn('Erro ao criar conta:', account.email, e); }
        }
      }

      // Import tags
      for (const tag of backupData.data.tags) {
        const existing = existingTags.find(t => t.name.toLowerCase() === tag.name.toLowerCase());
        if (existing) {
          tagIdMap.set(tag.id, existing.id);
        } else {
          try {
            const result = await createTag.mutateAsync({ name: tag.name, color: tag.color || 'blue' });
            tagIdMap.set(tag.id, result.id);
            tagsImported++;
          } catch (e) { console.warn('Erro ao criar tag:', tag.name, e); }
        }
      }

      // Import projects
      for (const project of backupData.data.projects) {
        const newAccountId = accountIdMap.get(project.accountId);
        if (!newAccountId) { projectsSkipped++; continue; }

        const existing = existingProjects.find(
          p => p.name.toLowerCase() === project.name.toLowerCase() && p.account_id === newAccountId
        );

        if (existing) {
          projectIdMap.set(project.id, existing.id);
          if (overwriteExisting) {
            try {
              await updateProject.mutateAsync({
                id: existing.id, description: project.description || '', url: project.url || '',
                status: project.status || 'draft', type: project.type || 'other',
                progress: project.progress || 0, is_favorite: project.isFavorite || false,
                notes: project.notes || '', screenshot: project.screenshot || null,
                deadline: project.deadline || null,
              });
              projectsUpdated++;
            } catch (e) { projectsSkipped++; }
          } else { projectsSkipped++; }
        } else {
          try {
            const result = await createProject.mutateAsync({
              name: project.name, description: project.description || '', url: project.url || '',
              status: project.status || 'draft', type: project.type || 'other',
              progress: project.progress || 0, is_favorite: project.isFavorite || false,
              notes: project.notes || '', account_id: newAccountId,
              screenshot: project.screenshot || null, deadline: project.deadline || null,
            });
            projectIdMap.set(project.id, result.id);
            projectsImported++;
          } catch (e) { projectsSkipped++; }
        }
      }

      // Import local keys
      if (backupData.data.localKeys) {
        const existingLocalKeys = getLocalKeys();
        for (const [oldAccountId, keys] of Object.entries(backupData.data.localKeys)) {
          const newAccountId = accountIdMap.get(oldAccountId);
          if (newAccountId && keys && typeof keys === 'object') {
            if (overwriteExisting || !existingLocalKeys[newAccountId]) {
              saveAccountLocalKeys(newAccountId, keys as any);
              keysImported++;
            }
          }
        }
      }

      // Import project checklists
      if (backupData.data.checklists?.length) {
        for (const checklist of backupData.data.checklists) {
          const newProjectId = projectIdMap.get(checklist.projectId);
          if (!newProjectId) continue;
          try {
            const { data: existing } = await supabase.from('project_checklists').select('id')
              .eq('project_id', newProjectId).eq('title', checklist.title).single();
            if (existing && !overwriteExisting) continue;
            if (existing && overwriteExisting) {
              await supabase.from('project_checklists').update({
                is_completed: checklist.isCompleted, completed_at: checklist.completedAt, position: checklist.position,
              }).eq('id', existing.id);
            } else {
              await supabase.from('project_checklists').insert({
                project_id: newProjectId, user_id: user.id, title: checklist.title,
                is_completed: checklist.isCompleted || false, completed_at: checklist.completedAt || null,
                position: checklist.position || 0,
              });
            }
            checklistsImported++;
          } catch (e) { console.warn('Erro checklist:', e); }
        }
      }

      // Import WordPress connections
      let wpImported = 0;
      if (backupData.data.wordpressConnections?.length) {
        for (const wp of backupData.data.wordpressConnections) {
          const exists = existingWpConnections.find(e => e.site_url === wp.siteUrl && e.username === wp.username);
          if (exists && !overwriteExisting) continue;
          if (!exists) {
            try {
              await createWpConnection.mutateAsync({
                site_url: wp.siteUrl, username: wp.username, app_password: wp.appPassword,
                site_name: wp.siteName || undefined,
              });
              wpImported++;
            } catch (e) { console.warn('Erro WP:', e); }
          }
        }
      }

      // Import Kanban columns
      let kanbanColumnsImported = 0;
      if (backupData.data.kanbanColumns?.length) {
        for (const col of backupData.data.kanbanColumns) {
          const { data: existing } = await supabase.from('kanban_columns').select('id')
            .eq('user_id', user.id).eq('name', col.name).maybeSingle();
          if (existing && !overwriteExisting) continue;
          if (existing && overwriteExisting) {
            await supabase.from('kanban_columns').update({ color: col.color, position: col.position }).eq('id', existing.id);
            kanbanColumnsImported++;
          } else if (!existing) {
            await supabase.from('kanban_columns').insert({
              user_id: user.id, name: col.name, color: col.color, position: col.position,
            });
            kanbanColumnsImported++;
          }
        }
      }

      // Import Kanban deals
      let kanbanDealsImported = 0;
      if (backupData.data.kanbanDeals?.length) {
        for (const deal of backupData.data.kanbanDeals) {
          const { data: existing } = await supabase.from('kanban_deals').select('id')
            .eq('user_id', user.id).eq('client_name', deal.clientName).eq('company_name', deal.companyName).maybeSingle();
          
          if (existing && !overwriteExisting) {
            dealIdMap.set(deal.id, existing.id);
            continue;
          }
          if (existing && overwriteExisting) {
            await supabase.from('kanban_deals').update({
              description: deal.description, phase: deal.phase, position: deal.position,
              priority: deal.priority, progress: deal.progress, revenue: deal.revenue,
              tags: deal.tags, assignee_name: deal.assigneeName, color: deal.color,
              client_email: deal.clientEmail, client_whatsapp: deal.clientWhatsapp,
              due_date: deal.dueDate, completed_at: deal.completedAt,
            }).eq('id', existing.id);
            dealIdMap.set(deal.id, existing.id);
            kanbanDealsImported++;
          } else {
            const { data: created } = await supabase.from('kanban_deals').insert({
              user_id: user.id, client_name: deal.clientName, company_name: deal.companyName,
              description: deal.description, phase: deal.phase, position: deal.position,
              priority: deal.priority, progress: deal.progress, revenue: deal.revenue,
              tags: deal.tags, assignee_name: deal.assigneeName, color: deal.color,
              client_email: deal.clientEmail, client_whatsapp: deal.clientWhatsapp,
              due_date: deal.dueDate, completed_at: deal.completedAt,
            }).select('id').single();
            if (created) dealIdMap.set(deal.id, created.id);
            kanbanDealsImported++;
          }
        }
      }

      // Import Kanban payments
      let kanbanPaymentsImported = 0;
      if (backupData.data.kanbanPayments?.length) {
        for (const payment of backupData.data.kanbanPayments) {
          const newDealId = dealIdMap.get(payment.dealId);
          if (!newDealId) continue;
          try {
            await supabase.from('kanban_payments').insert({
              user_id: user.id, deal_id: newDealId, amount: payment.amount,
              payment_date: payment.paymentDate, description: payment.description,
              payment_method: payment.paymentMethod, category: payment.category,
              status: payment.status,
            });
            kanbanPaymentsImported++;
          } catch (e) { console.warn('Erro pagamento:', e); }
        }
      }

      // Import Kanban expenses
      let kanbanExpensesImported = 0;
      if (backupData.data.kanbanExpenses?.length) {
        for (const expense of backupData.data.kanbanExpenses) {
          const newDealId = expense.dealId ? dealIdMap.get(expense.dealId) : null;
          try {
            await supabase.from('kanban_expenses').insert({
              user_id: user.id, deal_id: newDealId || null, amount: expense.amount,
              expense_date: expense.expenseDate, description: expense.description,
              category: expense.category,
            });
            kanbanExpensesImported++;
          } catch (e) { console.warn('Erro despesa:', e); }
        }
      }

      // Import Kanban task checklist
      let kanbanChecklistImported = 0;
      if (backupData.data.kanbanChecklist?.length) {
        for (const item of backupData.data.kanbanChecklist) {
          const newDealId = dealIdMap.get(item.dealId);
          if (!newDealId) continue;
          try {
            await supabase.from('kanban_task_checklist').insert({
              user_id: user.id, deal_id: newDealId, title: item.title,
              is_completed: item.isCompleted || false, position: item.position || 0,
            });
            kanbanChecklistImported++;
          } catch (e) { console.warn('Erro kanban checklist:', e); }
        }
      }

      const parts = [];
      if (accountsImported > 0) parts.push(`${accountsImported} contas`);
      if (projectsImported > 0) parts.push(`${projectsImported} projetos criados`);
      if (projectsUpdated > 0) parts.push(`${projectsUpdated} projetos atualizados`);
      if (tagsImported > 0) parts.push(`${tagsImported} tags`);
      if (keysImported > 0) parts.push(`${keysImported} keys`);
      if (checklistsImported > 0) parts.push(`${checklistsImported} checklists`);
      if (wpImported > 0) parts.push(`${wpImported} conexões WordPress`);
      if (kanbanColumnsImported > 0) parts.push(`${kanbanColumnsImported} colunas Kanban`);
      if (kanbanDealsImported > 0) parts.push(`${kanbanDealsImported} tarefas Kanban`);
      if (kanbanPaymentsImported > 0) parts.push(`${kanbanPaymentsImported} pagamentos`);
      if (kanbanExpensesImported > 0) parts.push(`${kanbanExpensesImported} despesas`);
      if (kanbanChecklistImported > 0) parts.push(`${kanbanChecklistImported} checklists Kanban`);
      if (projectsSkipped > 0) parts.push(`${projectsSkipped} projetos ignorados`);

      toast({
        title: 'Backup importado!',
        description: parts.join(', ') + '.',
      });
    } catch (error: any) {
      toast({ title: 'Erro ao importar', description: error.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setImporting(false);
      setBackupData(null);
    }
  };

  const totalKanban = (backupData?.summary?.totalKanbanDeals || 0) + 
    (backupData?.summary?.totalKanbanPayments || 0) + 
    (backupData?.summary?.totalKanbanExpenses || 0);

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
      
      <Button variant={variant} size={size} onClick={() => fileInputRef.current?.click()} disabled={importing} className={className}>
        {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
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
                    {(backupData.summary.totalLocalKeys ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalLocalKeys}</strong> keys de integração</p>
                    )}
                    {(backupData.summary.totalChecklists ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalChecklists}</strong> itens de checklist</p>
                    )}
                    {(backupData.summary.totalWordPressConnections ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalWordPressConnections}</strong> conexões WordPress</p>
                    )}
                    {(backupData.summary.totalKanbanDeals ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalKanbanDeals}</strong> tarefas Kanban</p>
                    )}
                    {(backupData.summary.totalKanbanPayments ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalKanbanPayments}</strong> pagamentos Kanban</p>
                    )}
                    {(backupData.summary.totalKanbanExpenses ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalKanbanExpenses}</strong> despesas Kanban</p>
                    )}
                    {(backupData.summary.totalKanbanColumns ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalKanbanColumns}</strong> colunas Kanban</p>
                    )}
                    {(backupData.summary.totalKanbanChecklist ?? 0) > 0 && (
                      <p><strong>{backupData.summary.totalKanbanChecklist}</strong> checklists Kanban</p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="overwrite" 
                    checked={overwriteExisting}
                    onCheckedChange={(checked) => setOverwriteExisting(checked === true)}
                  />
                  <Label htmlFor="overwrite" className="text-sm font-medium leading-none cursor-pointer">
                    Sobrescrever dados existentes
                  </Label>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {overwriteExisting 
                    ? 'Dados existentes serão atualizados com os dados do backup.'
                    : 'Dados duplicados serão ignorados.'}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>Importar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
