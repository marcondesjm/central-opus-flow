import { useState, useMemo } from 'react';
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
import { Plus, Lightbulb, Search, Filter, ArrowLeft, Loader2, List, LayoutGrid, Calendar, Trash2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subMonths, addMonths, format } from 'date-fns';

type ViewMode = 'table' | 'board' | 'timeline';

export default function Ideas() {
  const { data: ideas, isLoading } = useIdeas();
  const { user } = useAuth();
  const createIdea = useCreateIdea();
  const bulkDelete = useBulkDeleteIdeas();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => setSelectedIds(new Set()),
    });
  };

  const filtered = useMemo(() => (ideas || []).filter(idea => {
    const matchesSearch = !search || idea.title.toLowerCase().includes(search.toLowerCase());
    const matchesRoadmap = filterRoadmap === 'all' || idea.roadmap === filterRoadmap;
    return matchesSearch && matchesRoadmap;
  }), [ideas, search, filterRoadmap]);

  const handleCreate = (roadmap?: string) => {
    createIdea.mutate({
      title: 'Nova ideia',
      theme: 'geral',
      theme_color: '#6b7280',
      roadmap: roadmap || 'now',
      position: (ideas?.length || 0),
    });
  };

  const currentIdea = selectedIdea ? (ideas || []).find(i => i.id === selectedIdea.id) || selectedIdea : null;

  const timelineStart = subMonths(new Date(), 6);
  const timelineEnd = addMonths(new Date(), 6);

  const viewButtons: { mode: ViewMode; icon: typeof List; label: string }[] = [
    { mode: 'table', icon: List, label: 'Lista' },
    { mode: 'board', icon: LayoutGrid, label: 'Roteiro' },
    { mode: 'timeline', icon: Calendar, label: 'Cronograma' },
  ];

  return (
    <AppLayout>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-card px-3 md:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h1 className="text-base md:text-lg font-semibold">
                  {viewMode === 'table' ? 'Todas as ideias' : viewMode === 'board' ? 'Roteiro do produto' : 'Cronograma do produto'}
                </h1>
                <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              {/* View switcher */}
              <div className="flex items-center border rounded-md bg-muted/30">
                {viewButtons.map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors rounded-md',
                      viewMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar ideias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              {viewMode !== 'board' && (
                <Select value={filterRoadmap} onValueChange={setFilterRoadmap}>
                  <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
                    <Filter className="w-3 h-3 mr-1" />
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

              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleCreate()}>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Criar</span>
              </Button>
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
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Lightbulb className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma ideia encontrada</p>
                <Button size="sm" variant="outline" onClick={() => handleCreate()}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Criar primeira ideia
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
                  <div className="flex items-center gap-3 px-4 py-2 bg-destructive/10 border-b">
                    <span className="text-xs font-medium">{selectedIds.size} selecionada(s)</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs gap-1.5"
                      onClick={handleBulkDelete}
                      disabled={bulkDelete.isPending}
                    >
                      {bulkDelete.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Excluir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
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
                    <thead className="sticky top-0 bg-muted/50 z-10">
                      <tr className="border-b">
                        <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground w-8">
                          <Checkbox
                            className="h-4 w-4"
                            checked={filtered.length > 0 && selectedIds.size === filtered.length}
                            onCheckedChange={toggleAll}
                          />
                        </th>
                        <th className="text-left px-3 py-2.5 font-medium text-xs text-muted-foreground">Resumo</th>
                        <th className="text-left px-3 py-2.5 font-medium text-xs text-muted-foreground">Tema</th>
                        <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground">Impacto</th>
                        <th className="text-center px-3 py-2.5 font-medium text-xs text-muted-foreground">Esforço</th>
                        <th className="text-left px-3 py-2.5 font-medium text-xs text-muted-foreground">Roteiro</th>
                        <th className="text-left px-3 py-2.5 font-medium text-xs text-muted-foreground w-32">Progresso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(idea => {
                        const theme = THEME_PRESETS.find(t => t.id === idea.theme) || THEME_PRESETS[5];
                        const roadmap = ROADMAP_OPTIONS.find(r => r.id === idea.roadmap);
                        const isActive = currentIdea?.id === idea.id;
                        const isChecked = selectedIds.has(idea.id);

                        return (
                          <tr
                            key={idea.id}
                            className={cn(
                              'border-b cursor-pointer transition-colors hover:bg-muted/30',
                              isActive && 'bg-primary/5',
                              isChecked && 'bg-destructive/5'
                            )}
                            onClick={() => setSelectedIdea(idea)}
                          >
                            <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                className="h-4 w-4"
                                checked={isChecked}
                                onCheckedChange={() => toggleSelect(idea.id)}
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="font-medium text-sm truncate block max-w-[220px]">{idea.title}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="outline" className="text-[10px] gap-1" style={{ borderColor: theme.color, color: theme.color }}>
                                {theme.icon} {theme.label}
                              </Badge>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-center">
                                <DotRating value={idea.impact} color="bg-blue-500" size="sm" />
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-center">
                                <DotRating value={idea.effort} color="bg-amber-500" size="sm" />
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              {roadmap && (
                                <Badge variant="secondary" className={cn('text-[10px]', roadmap.textColor, roadmap.bgLight)}>
                                  {roadmap.label}
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <Progress value={idea.progress} className="h-1.5 flex-1" />
                                <span className="text-[10px] text-muted-foreground w-7">{idea.progress}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden divide-y">
                  {filtered.map(idea => {
                    const theme = THEME_PRESETS.find(t => t.id === idea.theme) || THEME_PRESETS[5];
                    const roadmap = ROADMAP_OPTIONS.find(r => r.id === idea.roadmap);

                    return (
                      <div
                        key={idea.id}
                        className="px-3 py-3 active:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">{theme.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{idea.title}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-[9px] h-5" style={{ borderColor: theme.color, color: theme.color }}>
                                {theme.label}
                              </Badge>
                              {roadmap && (
                                <Badge variant="secondary" className={cn('text-[9px] h-5', roadmap.textColor, roadmap.bgLight)}>
                                  {roadmap.label}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground">Imp:</span>
                                <DotRating value={idea.impact} color="bg-blue-500" size="sm" />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-muted-foreground">Esf:</span>
                                <DotRating value={idea.effort} color="bg-amber-500" size="sm" />
                              </div>
                              <div className="flex items-center gap-1 flex-1">
                                <Progress value={idea.progress} className="h-1 flex-1 max-w-16" />
                                <span className="text-[9px] text-muted-foreground">{idea.progress}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Create row */}
                {!isLoading && (
                  <div
                    className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 cursor-pointer transition-colors flex items-center gap-2 border-b"
                    onClick={() => handleCreate()}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Criar
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
