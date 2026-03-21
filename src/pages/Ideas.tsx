import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/layout/AppLayout';
import { useIdeas, useCreateIdea, useUpdateIdea, useBulkDeleteIdeas, Idea, ROADMAP_OPTIONS, THEME_PRESETS } from '@/hooks/useIdeas';
import { useAuth } from '@/hooks/useAuth';
import { IdeaDetailPanel } from '@/components/ideas/IdeaDetailPanel';
import { IdeasBoardView } from '@/components/ideas/IdeasBoardView';
import { IdeasTimelineView } from '@/components/ideas/IdeasTimelineView';
import { DotRating } from '@/components/ideas/DotRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Lightbulb, Search, Filter, Loader2, List, LayoutGrid, Calendar, Trash2, X, TrendingUp, Zap, Clock, Target, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subMonths, addMonths, format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'table' | 'board' | 'timeline';
const ITEMS_PER_PAGE = 10;

export default function Ideas() {
  const { data: ideas, isLoading } = useIdeas();
  const { user } = useAuth();
  const createIdea = useCreateIdea();
  const bulkDelete = useBulkDeleteIdeas();
  const isMobile = useIsMobile();

  // Inline creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const createInputRef = useRef<HTMLInputElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch profiles for last_modified_by
  const modifierUserIds = useMemo(() => {
    if (!ideas) return [];
    const ids = new Set<string>();
    ideas.forEach(i => { if (i.last_modified_by) ids.add(i.last_modified_by); });
    if (user?.id) ids.add(user.id);
    return Array.from(ids);
  }, [ideas, user?.id]);

  const { data: modifierProfiles } = useQuery({
    queryKey: ['idea-modifier-profiles', modifierUserIds],
    queryFn: async () => {
      if (modifierUserIds.length === 0) return {};
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', modifierUserIds);
      const map: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      data?.forEach(p => { map[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url }; });
      return map;
    },
    enabled: modifierUserIds.length > 0,
  });

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [search, setSearch] = useState('');
  const [filterRoadmap, setFilterRoadmap] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedIdeas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedIdeas.map(i => i.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  };

  // Filter and sort newest first
  const filtered = useMemo(() => (ideas || [])
    .filter(idea => {
      const matchesSearch = !search || idea.title.toLowerCase().includes(search.toLowerCase());
      const matchesRoadmap = filterRoadmap === 'all' || idea.roadmap === filterRoadmap;
      return matchesSearch && matchesRoadmap;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  [ideas, search, filterRoadmap]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedIdeas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [search, filterRoadmap]);

  const handleCreate = (roadmap?: string) => {
    createIdea.mutate({
      title: 'Nova ideia',
      theme: 'geral',
      theme_color: '#6b7280',
      roadmap: roadmap || 'now',
      position: 0,
    }, {
      onSuccess: (newIdea) => {
        setCurrentPage(1);
        // Open the detail panel with the new idea so user can edit inline
        if (newIdea) {
          setSelectedIdea(newIdea as Idea);
        }
      },
    });
  };

  const currentIdea = selectedIdea ? (ideas || []).find(i => i.id === selectedIdea.id) || selectedIdea : null;

  const timelineStart = subMonths(new Date(), 6);
  const timelineEnd = addMonths(new Date(), 6);

  // Stats
  const stats = useMemo(() => {
    const all = ideas || [];
    const avgProgress = all.length > 0 ? Math.round(all.reduce((s, i) => s + i.progress, 0) / all.length) : 0;
    const highImpact = all.filter(i => i.impact >= 4).length;
    const nowCount = all.filter(i => i.roadmap === 'now').length;
    return { total: all.length, avgProgress, highImpact, nowCount };
  }, [ideas]);

  const viewButtons: { mode: ViewMode; icon: typeof List; label: string }[] = [
    { mode: 'table', icon: List, label: 'Lista' },
    { mode: 'board', icon: LayoutGrid, label: 'Roteiro' },
    { mode: 'timeline', icon: Calendar, label: 'Cronograma' },
  ];

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with stats */}
        <div className="border-b bg-card">
          <div className="px-4 md:px-6 pt-5 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <Button size="default" className="gap-2 shadow-lg shadow-primary/20" onClick={() => handleCreate()} disabled={createIdea.isPending}>
                {createIdea.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Nova Ideia
              </Button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Total', value: stats.total, icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Em Foco', value: stats.nowCount, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Alto Impacto', value: stats.highImpact, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Progresso Médio', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl border border-border bg-background p-3 flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.bg)}>
                      <Icon className={cn('w-4 h-4', stat.color)} />
                    </div>
                    <div>
                      <p className={cn('text-lg font-bold tabular-nums leading-tight', stat.color)}>{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {/* View switcher */}
              <div className="flex items-center border rounded-lg bg-muted/30 p-0.5">
                {viewButtons.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all rounded-md',
                      viewMode === mode
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ideias..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {viewMode !== 'board' && (
                  <Select value={filterRoadmap} onValueChange={setFilterRoadmap}>
                    <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs">
                      <Filter className="w-3.5 h-3.5 mr-1.5" />
                      <SelectValue placeholder="Roteiro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">Todos</SelectItem>
                      {ROADMAP_OPTIONS.map(r => (
                        <SelectItem key={r.id} value={r.id} className="text-xs">{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {filtered.length > 0 && (
                  <Badge variant="outline" className="text-xs tabular-nums h-9 px-3">
                    {filtered.length} {filtered.length === 1 ? 'ideia' : 'ideias'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main area */}
          <div className={cn(
            'flex-1 overflow-auto flex flex-col',
            currentIdea && !isMobile && viewMode === 'table' && 'max-w-[60%]'
          )}>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-1">Nenhuma ideia encontrada</h3>
                  <p className="text-sm text-muted-foreground">Comece registrando suas ideias de produto</p>
                </div>
                <Button onClick={() => handleCreate()} className="gap-2">
                  <Plus className="w-4 h-4" /> Criar primeira ideia
                </Button>
              </div>
            ) : viewMode === 'board' ? (
              <IdeasBoardView
                ideas={filtered}
                onSelectIdea={setSelectedIdea}
                selectedIdeaId={currentIdea?.id}
                onCreateInRoadmap={(r) => handleCreate(r)}
              />
            ) : viewMode === 'timeline' ? (
              <IdeasTimelineView
                ideas={filtered}
                onSelectIdea={setSelectedIdea}
                selectedIdeaId={currentIdea?.id}
                rangeStart={timelineStart}
                rangeEnd={timelineEnd}
              />
            ) : (
              <>
                {/* Bulk action bar */}
                {selectedIds.size > 0 && (
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-destructive/10 border-b animate-fade-in">
                    <Badge variant="destructive" className="text-xs">{selectedIds.size} selecionada(s)</Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs gap-1.5"
                      onClick={handleBulkDelete}
                      disabled={bulkDelete.isPending}
                    >
                      {bulkDelete.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Excluir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs gap-1"
                      onClick={() => setSelectedIds(new Set())}
                    >
                      <X className="w-3 h-3" />
                      Cancelar
                    </Button>
                  </div>
                )}

                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                      <tr className="border-b">
                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground w-10">
                          <Checkbox
                            className="h-4 w-4"
                            checked={paginatedIdeas.length > 0 && selectedIds.size === paginatedIdeas.length}
                            onCheckedChange={toggleAll}
                          />
                        </th>
                        <th className="text-left px-3 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Resumo</th>
                        <th className="text-left px-3 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Tema</th>
                        <th className="text-center px-3 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Impacto</th>
                        <th className="text-center px-3 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Esforço</th>
                        <th className="text-left px-3 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Roteiro</th>
                        <th className="text-left px-3 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider w-36">Progresso</th>
                        <th className="text-left px-3 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Modificado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedIdeas.map((idea, index) => {
                        const theme = THEME_PRESETS.find(t => t.id === idea.theme) || THEME_PRESETS[5];
                        const roadmap = ROADMAP_OPTIONS.find(r => r.id === idea.roadmap);
                        const isActive = currentIdea?.id === idea.id;
                        const isChecked = selectedIds.has(idea.id);

                        return (
                          <tr
                            key={idea.id}
                            className={cn(
                              'border-b transition-all duration-150 cursor-pointer group/row',
                              isActive && 'bg-primary/[0.06] border-l-2 border-l-primary',
                              isChecked && 'bg-destructive/[0.04]',
                              !isActive && !isChecked && 'hover:bg-muted/40'
                            )}
                            onClick={() => setSelectedIdea(idea)}
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                className="h-4 w-4"
                                checked={isChecked}
                                onCheckedChange={() => toggleSelect(idea.id)}
                              />
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{theme.icon}</span>
                                <span className="font-medium text-sm truncate max-w-[220px] group-hover/row:text-primary transition-colors">{idea.title}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <Badge
                                variant="outline"
                                className="text-[10px] gap-1 font-medium border-0"
                                style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
                              >
                                {theme.label}
                              </Badge>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex justify-center">
                                <DotRating value={idea.impact} color="bg-blue-500" size="sm" />
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex justify-center">
                                <DotRating value={idea.effort} color="bg-amber-500" size="sm" />
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {roadmap && (
                                <Badge
                                  variant="secondary"
                                  className={cn('text-[10px] font-semibold border-0', roadmap.textColor, roadmap.bgLight)}
                                >
                                  {roadmap.label}
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <Progress value={idea.progress} className="h-2 flex-1" />
                                <span className={cn(
                                  'text-[11px] font-semibold tabular-nums w-8 text-right',
                                  idea.progress >= 80 ? 'text-emerald-500' : idea.progress >= 40 ? 'text-blue-500' : 'text-muted-foreground'
                                )}>
                                  {idea.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {(() => {
                                const profile = modifierProfiles?.[idea.last_modified_by || ''] || (idea.user_id === user?.id ? modifierProfiles?.[user.id] : null);
                                return profile ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6 ring-2 ring-background">
                                          <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                                          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                                            {(profile.full_name || '?').slice(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                          <span className="text-xs font-medium truncate block max-w-[85px]">{profile.full_name || 'Usuário'}</span>
                                          <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true, locale: ptBR })}
                                          </span>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      <p>{format(new Date(idea.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null;
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y">
                  {paginatedIdeas.map(idea => {
                    const theme = THEME_PRESETS.find(t => t.id === idea.theme) || THEME_PRESETS[5];
                    const roadmap = ROADMAP_OPTIONS.find(r => r.id === idea.roadmap);
                    const isChecked = selectedIds.has(idea.id);

                    return (
                      <div
                        key={idea.id}
                        className={cn(
                          'px-4 py-4 cursor-pointer transition-colors active:bg-muted/30',
                          isChecked && 'bg-destructive/[0.04]'
                        )}
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              className="h-4 w-4"
                              checked={isChecked}
                              onCheckedChange={() => toggleSelect(idea.id)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-base">{theme.icon}</span>
                              <p className="font-medium text-sm truncate flex-1">{idea.title}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                              <Badge
                                variant="outline"
                                className="text-[9px] h-5 border-0 font-medium"
                                style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
                              >
                                {theme.label}
                              </Badge>
                              {roadmap && (
                                <Badge variant="secondary" className={cn('text-[9px] h-5 border-0 font-semibold', roadmap.textColor, roadmap.bgLight)}>
                                  {roadmap.label}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground font-medium">Impacto</span>
                                <DotRating value={idea.impact} color="bg-blue-500" size="sm" />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground font-medium">Esforço</span>
                                <DotRating value={idea.effort} color="bg-amber-500" size="sm" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Progress value={idea.progress} className="h-1.5 flex-1" />
                              <span className={cn(
                                'text-[10px] font-semibold tabular-nums',
                                idea.progress >= 80 ? 'text-emerald-500' : idea.progress >= 40 ? 'text-blue-500' : 'text-muted-foreground'
                              )}>
                                {idea.progress}%
                              </span>
                            </div>
                            {(() => {
                              const profile = modifierProfiles?.[idea.last_modified_by || ''] || (idea.user_id === user?.id ? modifierProfiles?.[user.id] : null);
                              return profile ? (
                                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                  <Avatar className="w-5 h-5 ring-1 ring-background">
                                    <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                                    <AvatarFallback className="text-[7px] bg-primary/10 text-primary font-semibold">
                                      {(profile.full_name || '?').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-[10px] text-muted-foreground truncate">{profile.full_name || 'Usuário'}</span>
                                  <span className="text-[9px] text-muted-foreground/60 ml-auto">
                                    {formatDistanceToNow(new Date(idea.updated_at), { addSuffix: true, locale: ptBR })}
                                  </span>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Create row */}
                {!isLoading && (
                  <div
                    className="px-5 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 cursor-pointer transition-colors flex items-center gap-2 border-b group"
                    onClick={handleOpenCreate}
                  >
                    <div className="w-6 h-6 rounded-md border-2 border-dashed border-muted-foreground/30 group-hover:border-primary flex items-center justify-center transition-colors">
                      <Plus className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium">Adicionar nova ideia</span>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                      Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                        Math.max(0, currentPage - 3),
                        Math.min(totalPages, currentPage + 2)
                      ).map(page => (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="icon"
                          className="h-8 w-8 text-xs"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Detail Panel - Desktop */}
          {currentIdea && !isMobile && (
            <div className={cn(
              'border-l',
              viewMode === 'table' ? 'w-[40%] min-w-[320px]' : 'w-[380px] min-w-[320px]'
            )}>
              <IdeaDetailPanel idea={currentIdea} onClose={() => setSelectedIdea(null)} />
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel - Mobile (full screen overlay) */}
      {currentIdea && isMobile && (
        <div className="fixed inset-0 z-50 bg-background">
          <IdeaDetailPanel idea={currentIdea} onClose={() => setSelectedIdea(null)} />
        </div>
      )}
    </AppLayout>
  );
}
