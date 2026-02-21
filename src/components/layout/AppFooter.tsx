import { useState } from 'react';
import { useSystemVersion, getFormattedVersion, getFormattedReleaseDate } from '@/hooks/useSystemVersion';
import { useLatestVersion } from '@/hooks/useChangelog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ClearCacheButton } from '@/components/settings/ClearCacheButton';
import { FeedbackButton } from '@/components/support/FeedbackButton';
import { ChangelogModal } from '@/components/changelog/ChangelogModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AppFooter() {
  const { data: systemVersion, isLoading } = useSystemVersion();
  const { data: latestVersion } = useLatestVersion();
  const [changelogOpen, setChangelogOpen] = useState(false);

  // Use latest version from changelog if available, fallback to system_config
  const version = latestVersion?.version || systemVersion?.version || '1.0.0';
  const updatedAt = latestVersion?.created_at 
    ? new Date(latestVersion.created_at) 
    : systemVersion?.updatedAt;

  return (
    <>
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3">
        <div className="container mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Central Opus Flow — DoorVII® Todos os direitos reservados</span>
            <ClearCacheButton />
            <FeedbackButton />
          </div>
          
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-4 w-32 hidden sm:block" />
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setChangelogOpen(true)}
                >
                  <Badge variant="outline" className="text-xs font-mono">
                    v{version}
                  </Badge>
                  {updatedAt && (
                    <span className="hidden sm:inline">
                      Atualizado em {format(updatedAt, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  )}
                  <History className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Ver histórico de atualizações</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </footer>

      <ChangelogModal open={changelogOpen} onOpenChange={setChangelogOpen} />
    </>
  );
}
