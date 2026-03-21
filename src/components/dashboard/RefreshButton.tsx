import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  className?: string;
}

export function RefreshButton({ className }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const refreshKeys = [
    ['projects'],
    ['accounts'],
    ['tags'],
    ['collaborated-projects'],
    ['system-version'],
    ['latest-version'],
    ['changelog'],
    ['changelog-by-version'],
    ['activity-logs'],
    ['project-history'],
  ] as const;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all(
        refreshKeys.map((queryKey) => queryClient.resetQueries({ queryKey }))
      );

      await Promise.all(
        refreshKeys.map((queryKey) =>
          queryClient.refetchQueries({ queryKey, type: 'all' })
        )
      );
      
      toast.success('Históricos e versão atualizados!');
    } catch (error) {
      toast.error('Erro ao atualizar dados');
    } finally {
      // Keep spinning animation for a moment
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={cn("gap-2", className)}
    >
      <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
      Atualizar
    </Button>
  );
}

