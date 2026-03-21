import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useAccounts, useProjects, useTags } from '@/hooks/useProjects';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useWordPressConnections } from '@/hooks/useWordPress';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getLocalKeys } from '@/hooks/useLocalKeys';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import JSZip from 'jszip';

interface ExportBackupButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ExportBackupButton({ 
  variant = 'outline', 
  size = 'sm',
  className 
}: ExportBackupButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { data: accounts = [] } = useAccounts();
  const { data: projects = [] } = useProjects();
  const { data: tags = [] } = useTags();
  const { data: activityLogs = [] } = useActivityLogs(500);
  const { data: wpConnections = [] } = useWordPressConnections();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    
    try {
      const localKeys = getLocalKeys();
      
      // Fetch checklists
      const projectIds = projects.map(p => p.id);
      let checklists: any[] = [];
      if (projectIds.length > 0) {
        const { data: checklistData } = await supabase
          .from('project_checklists')
          .select('*')
          .in('project_id', projectIds)
          .order('position', { ascending: true });
        if (checklistData) checklists = checklistData;
      }

      // Fetch Kanban data
      const [kanbanColumnsRes, kanbanDealsRes, kanbanPaymentsRes, kanbanExpensesRes, kanbanChecklistRes] = await Promise.all([
        supabase.from('kanban_columns').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_deals').select('*').eq('user_id', user.id).order('position'),
        supabase.from('kanban_payments').select('*').eq('user_id', user.id),
        supabase.from('kanban_expenses').select('*').eq('user_id', user.id),
        supabase.from('kanban_task_checklist').select('*').eq('user_id', user.id).order('position'),
      ]);

      const kanbanColumns = kanbanColumnsRes.data || [];
      const kanbanDeals = kanbanDealsRes.data || [];
      const kanbanPayments = kanbanPaymentsRes.data || [];
      const kanbanExpenses = kanbanExpensesRes.data || [];
      const kanbanChecklist = kanbanChecklistRes.data || [];

      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        data: {
          accounts: accounts.map(a => ({
            id: a.id, name: a.name, email: a.email, color: a.color, credits: a.credits,
            admin_email: a.admin_email, supabase_project_id: a.supabase_project_id,
            supabase_url: a.supabase_url, anon_key: a.anon_key, service_role_key: a.service_role_key,
            notes: a.notes, createdAt: a.created_at, updatedAt: a.updated_at,
          })),
          projects: projects.map(p => ({
            id: p.id, name: p.name, description: p.description, url: p.url, status: p.status,
            type: p.type, progress: p.progress, isFavorite: p.is_favorite, viewCount: p.view_count,
            notes: p.notes, accountId: p.account_id, screenshot: p.screenshot, deadline: p.deadline,
            tags: p.tags?.map(t => t.name) || [], createdAt: p.created_at, updatedAt: p.updated_at,
          })),
          tags: tags.map(t => ({ id: t.id, name: t.name, color: t.color, createdAt: t.created_at })),
          activityLogs: activityLogs.map(log => ({
            id: log.id, action: log.action, entityType: log.entity_type, entityId: log.entity_id,
            entityName: log.entity_name, metadata: log.metadata, createdAt: log.created_at,
          })),
          localKeys,
          checklists: checklists.map(c => ({
            id: c.id, projectId: c.project_id, title: c.title, isCompleted: c.is_completed,
            completedAt: c.completed_at, position: c.position, createdAt: c.created_at,
          })),
          wordpressConnections: wpConnections.map(wp => ({
            id: wp.id, siteUrl: wp.site_url, username: wp.username, appPassword: wp.app_password,
            siteName: wp.site_name, lastSyncAt: wp.last_sync_at, createdAt: wp.created_at,
          })),
          kanbanColumns: kanbanColumns.map(c => ({
            id: c.id, name: c.name, color: c.color, position: c.position, createdAt: c.created_at,
          })),
          kanbanDeals: kanbanDeals.map(d => ({
            id: d.id, clientName: d.client_name, companyName: d.company_name, description: d.description,
            phase: d.phase, position: d.position, priority: d.priority, progress: d.progress,
            revenue: d.revenue, tags: d.tags, assigneeName: d.assignee_name, color: d.color,
            clientEmail: d.client_email, clientWhatsapp: d.client_whatsapp, dueDate: d.due_date,
            completedAt: d.completed_at, createdAt: d.created_at,
          })),
          kanbanPayments: kanbanPayments.map(p => ({
            id: p.id, dealId: p.deal_id, amount: p.amount, paymentDate: p.payment_date,
            description: p.description, paymentMethod: p.payment_method, category: p.category,
            status: p.status, createdAt: p.created_at,
          })),
          kanbanExpenses: kanbanExpenses.map(e => ({
            id: e.id, dealId: e.deal_id, amount: e.amount, expenseDate: e.expense_date,
            description: e.description, category: e.category, createdAt: e.created_at,
          })),
          kanbanChecklist: kanbanChecklist.map(c => ({
            id: c.id, dealId: c.deal_id, title: c.title, isCompleted: c.is_completed,
            position: c.position, createdAt: c.created_at,
          })),
        },
        summary: {
          totalAccounts: accounts.length,
          totalProjects: projects.length,
          totalTags: tags.length,
          totalActivityLogs: activityLogs.length,
          totalLocalKeys: Object.keys(localKeys).length,
          totalChecklists: checklists.length,
          totalWordPressConnections: wpConnections.length,
          totalKanbanColumns: kanbanColumns.length,
          totalKanbanDeals: kanbanDeals.length,
          totalKanbanPayments: kanbanPayments.length,
          totalKanbanExpenses: kanbanExpenses.length,
          totalKanbanChecklist: kanbanChecklist.length,
        },
      };

      const jsonContent = JSON.stringify(backupData, null, 2);
      const dateStr = format(new Date(), 'yyyy-MM-dd-HHmm');

      // Export as ZIP
      const zip = new JSZip();
      zip.file(`centralopusflow-backup-${dateStr}.json`, jsonContent);
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
      
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `centralopusflow-backup-${dateStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup exportado!',
        description: `${projects.length} projetos, ${accounts.length} contas, ${kanbanDeals.length} tarefas Kanban e ${kanbanPayments.length} pagamentos exportados.`,
      });
    } catch (error: any) {
      toast({ title: 'Erro ao exportar', description: error.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={exporting} className={className}>
      {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
      {exporting ? 'Exportando...' : 'Exportar Backup'}
    </Button>
  );
}
