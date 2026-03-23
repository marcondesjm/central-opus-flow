import { useMemo, useState } from 'react';
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { useLatestVersion } from '@/hooks/useChangelog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ClearCacheButton } from '@/components/settings/ClearCacheButton';
import { FeedbackButton } from '@/components/support/FeedbackButton';
import { ChangelogModal } from '@/components/changelog/ChangelogModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LOCAL_VERSION_KEY = 'centralopusflow-app-version';
const INSTALLED_AT_KEY = 'centralopusflow-installed-at';

export function AppFooter() {
  const { data: systemVersion, isLoading } = useSystemVersion();
  const { data: latestVersion } = useLatestVersion();
  const [changelogOpen, setChangelogOpen] = useState(false);

  const { version, updatedAt } = useMemo(() => {
    const installedVersion = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_VERSION_KEY) : null;
    const installedAt = typeof window !== 'undefined' ? localStorage.getItem(INSTALLED_AT_KEY) : null;

    return {
      version: installedVersion || latestVersion?.version || systemVersion?.version || '1.0.0',
      updatedAt: installedAt
        ? new Date(installedAt)
        : latestVersion?.created_at
          ? new Date(latestVersion.created_at)
          : systemVersion?.updatedAt,
    };
  }, [latestVersion?.created_at, latestVersion?.version, systemVersion?.updatedAt, systemVersion?.version]);

  return (
    <>
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3 pb-20 lg:pb-3">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Central Opus Flow — <a href="https://www.doorvii.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline-offset-2 hover:underline transition-colors">DoorVII®</a></span>
            <div className="flex items-center gap-2">
              <ClearCacheButton />
              <FeedbackButton />
            </div>
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
                      Atualizado em {format(updatedAt, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
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
