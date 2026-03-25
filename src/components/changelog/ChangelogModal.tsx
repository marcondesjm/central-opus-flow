import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChangelogByVersion, ChangelogEntry, useLatestVersion } from '@/hooks/useChangelog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Sparkles, 
  Bug, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  History,
  Loader2,
  ChevronUp,
  ChevronDown,
  User,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { Download, CheckCircle2, Loader2 as DownloadSpinner } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getHighestVersion, isVersionBehind } from '@/lib/versioning';

interface ChangelogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeConfig: Record<ChangelogEntry['type'], { icon: typeof Sparkles; label: string; color: string }> = {
  feature: { icon: Sparkles, label: 'Nova funcionalidade', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  fix: { icon: Bug, label: 'Correção', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
  improvement: { icon: TrendingUp, label: 'Melhoria', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  security: { icon: Shield, label: 'Segurança', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  breaking: { icon: AlertTriangle, label: 'Breaking Change', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export function ChangelogModal({ open, onOpenChange }: ChangelogModalProps) {
  const { data: changelog, isLoading, isFetching } = useChangelogByVersion();
  const queryClient = useQueryClient();
  const { data: systemVersion } = useSystemVersion();
  const { data: latestVersion } = useLatestVersion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadPhase, setDownloadPhase] = useState<'idle' | 'downloading' | 'ready'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const totalMB = 12.4; // simulated total size

  // Force refresh all version/changelog data whenever modal opens + auto-refresh every 10s
  useEffect(() => {
    if (!open) return;

    const refreshAll = () => {
      queryClient.invalidateQueries({ queryKey: ['changelog-by-version'] });
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
      queryClient.invalidateQueries({ queryKey: ['latest-version'] });
      queryClient.invalidateQueries({ queryKey: ['system-version'] });
    };

    refreshAll();
    const interval = window.setInterval(refreshAll, 10_000);
    return () => clearInterval(interval);
  }, [open, queryClient]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.resetQueries({ queryKey: ['changelog-by-version'] }),
        queryClient.resetQueries({ queryKey: ['changelog'] }),
        queryClient.resetQueries({ queryKey: ['latest-version'] }),
        queryClient.resetQueries({ queryKey: ['system-version'] }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['changelog-by-version'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['changelog'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['latest-version'], type: 'active' }),
        queryClient.refetchQueries({ queryKey: ['system-version'], type: 'active' }),
      ]);

      toast.success('Histórico e versão atualizados!');
    } catch {
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowScrollTop(scrollTop > 100);
        setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 100);
      }
    };

    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      // Check initial state
      setTimeout(checkScroll, 100);
    }

    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', checkScroll);
      }
    };
  }, [open, changelog]);

  const LOCAL_VERSION_KEY = 'centralopusflow-app-version';
  const LAST_SEEN_KEY = 'centralopusflow-last-seen-version';
  const targetVersion = getHighestVersion(latestVersion?.version, systemVersion?.version);

  const hasUpdate = (() => {
    const installedVersion = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_VERSION_KEY) : null;
    return isVersionBehind(installedVersion, targetVersion);
  })();

  // Auto-detect update on modal open
  useEffect(() => {
    if (open && hasUpdate && downloadPhase === 'idle') {
      // reset for new update
      setDownloadProgress(0);
    }
  }, [open, hasUpdate, downloadPhase]);

  // Simulate download progress
  useEffect(() => {
    if (downloadPhase !== 'downloading') return;
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 2;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setDownloadProgress(100);
        setTimeout(() => setDownloadPhase('ready'), 500);
      } else {
        setDownloadProgress(Math.round(current));
      }
    }, 400);
    return () => clearInterval(interval);
  }, [downloadPhase]);

  const handleStartDownload = () => {
    setDownloadProgress(0);
    setDownloadPhase('downloading');
  };

  const handleInstallUpdate = () => {
    if (targetVersion) {
      localStorage.setItem(LAST_SEEN_KEY, targetVersion);
      localStorage.setItem(LOCAL_VERSION_KEY, targetVersion);
      localStorage.setItem('centralopusflow-installed-at', new Date().toISOString());
    }
    window.location.reload();
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Histórico de Atualizações
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isFetching}
              className="gap-2 h-8 px-3 text-xs"
              title="Forçar atualização do histórico e versão"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshing || isFetching) && "animate-spin")} />
              {isRefreshing || isFetching ? 'Atualizando...' : 'Atualizar'}
            </Button>
            {downloadPhase === 'idle' && hasUpdate && (
              <Button
                size="sm"
                onClick={handleStartDownload}
                className="gap-2 h-8 px-3 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar v{targetVersion}
              </Button>
            )}
          </div>
          {/* Download progress bar */}
          {downloadPhase === 'downloading' && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Download className="h-3 w-3 animate-bounce" />
                  Baixando atualização v{targetVersion}...
                </span>
                <span className="font-mono text-muted-foreground">
                  {((totalMB * (100 - downloadProgress)) / 100).toFixed(1)} MB restantes
                </span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
              <p className="text-[10px] text-muted-foreground text-right">{downloadProgress}%</p>
            </div>
          )}
          {downloadPhase === 'ready' && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Atualização pronta para instalar</span>
              </div>
              <Button size="sm" onClick={handleInstallUpdate} className="gap-1.5 h-8 px-3 text-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                Instalar Agora
              </Button>
            </div>
          )}
          <DialogDescription>
            Confira todas as alterações e melhorias do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          <div 
            ref={scrollRef}
            className="h-full max-h-[60vh] overflow-y-auto p-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !changelog || changelog.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhuma atualização registrada</p>
              </div>
            ) : (
              <div className="space-y-8">
                {changelog.map(({ version, entries, date }) => (
                  <div key={version} className="relative">
                    {/* Version header */}
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="default" className="text-sm font-mono">
                        v{version}
                      </Badge>
                      {date && (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR })}
                        </span>
                      )}
                    </div>

                    {/* Entries */}
                    <div className="space-y-3 ml-2 border-l-2 border-border pl-4">
                      {entries.map((entry) => {
                        const config = typeConfig[entry.type];
                        const Icon = config.icon;

                        return (
                          <div key={entry.id} className="relative">
                            {/* Timeline dot */}
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
                            
                            <div className="flex items-start gap-3">
                              <Badge 
                                variant="outline" 
                                className={cn("gap-1 text-xs shrink-0", config.color)}
                              >
                                <Icon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{entry.title}</p>
                                {entry.description && (
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {entry.description}
                                  </p>
                                )}
                                {entry.contributor_name && (
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Feedback de <span className="font-medium">{entry.contributor_name}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scroll buttons */}
          {showScrollTop && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-6 h-8 w-8 rounded-full shadow-lg z-10 opacity-90 hover:opacity-100"
              onClick={scrollToTop}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          
          {showScrollBottom && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-2 right-6 h-8 w-8 rounded-full shadow-lg z-10 opacity-90 hover:opacity-100"
              onClick={scrollToBottom}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
