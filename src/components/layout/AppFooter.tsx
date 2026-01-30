import { useSystemVersion, getFormattedVersion, getFormattedReleaseDate } from '@/hooks/useSystemVersion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AppFooter() {
  const { data: systemVersion, isLoading } = useSystemVersion();

  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm px-4 py-3">
      <div className="container mx-auto flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} All Projects Hub</span>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-4 w-32 hidden sm:block" />
          </div>
        ) : systemVersion ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <Badge variant="outline" className="text-xs font-mono">
                  {getFormattedVersion(systemVersion.version)}
                </Badge>
                <span className="hidden sm:inline">
                  Atualizado em {getFormattedReleaseDate(systemVersion.updatedAt)}
                </span>
                <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-2">
                <p className="font-medium">{systemVersion.releaseName}</p>
                {systemVersion.changelog.length > 0 && (
                  <ul className="text-xs space-y-1">
                    {systemVersion.changelog.map((item, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </footer>
  );
}
