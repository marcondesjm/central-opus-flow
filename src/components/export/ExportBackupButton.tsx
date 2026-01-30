import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useAccounts, useProjects, useTags } from '@/hooks/useProjects';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        data: {
          accounts: accounts.map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,
            color: a.color,
            credits: a.credits,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          })),
          projects: projects.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            url: p.url,
            status: p.status,
            type: p.type,
            progress: p.progress,
            isFavorite: p.is_favorite,
            viewCount: p.view_count,
            notes: p.notes,
            accountId: p.account_id,
            tags: p.tags?.map(t => t.name) || [],
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          })),
          tags: tags.map(t => ({
            id: t.id,
            name: t.name,
            color: t.color,
            createdAt: t.created_at,
          })),
          activityLogs: activityLogs.map(log => ({
            id: log.id,
            action: log.action,
            entityType: log.entity_type,
            entityId: log.entity_id,
            entityName: log.entity_name,
            metadata: log.metadata,
            createdAt: log.created_at,
          })),
        },
        summary: {
          totalAccounts: accounts.length,
          totalProjects: projects.length,
          totalTags: tags.length,
          totalActivityLogs: activityLogs.length,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `projecthub-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup exportado!',
        description: `${projects.length} projetos, ${accounts.length} contas e ${activityLogs.length} logs exportados.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={exporting}
      className={className}
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {exporting ? 'Exportando...' : 'Exportar Backup'}
    </Button>
  );
}
