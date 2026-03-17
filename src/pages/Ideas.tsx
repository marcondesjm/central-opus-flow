import { useState } from 'react';
import { useIdeas, useCreateIdea, Idea, ROADMAP_OPTIONS, THEME_PRESETS } from '@/hooks/useIdeas';
import { IdeaDetailPanel } from '@/components/ideas/IdeaDetailPanel';
import { DotRating } from '@/components/ideas/DotRating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/layout/Header';
import { Plus, Lightbulb, Search, Filter, ArrowLeft, Loader2, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Ideas() {
  const { data: ideas, isLoading } = useIdeas();
  const createIdea = useCreateIdea();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [search, setSearch] = useState('');
  const [filterRoadmap, setFilterRoadmap] = useState<string>('all');

  const filtered = (ideas || []).filter(idea => {
    const matchesSearch = !search || idea.title.toLowerCase().includes(search.toLowerCase());
    const matchesRoadmap = filterRoadmap === 'all' || idea.roadmap === filterRoadmap;
    return matchesSearch && matchesRoadmap;
  });

  const handleCreate = () => {
    createIdea.mutate({
      title: 'Nova ideia',
      theme: 'geral',
      theme_color: '#6b7280',
      position: (ideas?.length || 0),
    });
  };

  // Update selected idea from fresh data
  const currentIdea = selectedIdea ? (ideas || []).find(i => i.id === selectedIdea.id) || selectedIdea : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-card px-3 md:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/kanban')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h1 className="text-base md:text-lg font-semibold">Ideias</h1>
                <Badge variant="secondary" className="text-xs">{filtered.length}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar ideias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

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

              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleCreate}>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Criar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table */}
          <div className={cn(
            'flex-1 overflow-auto',
            currentIdea && !isMobile && 'max-w-[60%]'
          )}>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <Lightbulb className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhuma ideia encontrada</p>
                <Button size="sm" variant="outline" onClick={handleCreate}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Criar primeira ideia
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/50 z-10">
                      <tr className="border-b">
                        <th className="text-left px-4 py-2.5 font-medium text-xs text-muted-foreground w-8"></th>
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
                        const isSelected = currentIdea?.id === idea.id;

                        return (
                          <tr
                            key={idea.id}
                            className={cn(
                              'border-b cursor-pointer transition-colors hover:bg-muted/30',
                              isSelected && 'bg-primary/5'
                            )}
                            onClick={() => setSelectedIdea(idea)}
                          >
                            <td className="px-4 py-2.5">
                              <Checkbox className="h-4 w-4" />
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
              </>
            )}

            {/* Create row */}
            {!isLoading && (
              <div
                className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 cursor-pointer transition-colors flex items-center gap-2 border-b"
                onClick={handleCreate}
              >
                <Plus className="w-3.5 h-3.5" />
                Criar
              </div>
            )}
          </div>

          {/* Detail Panel - Desktop */}
          {currentIdea && !isMobile && (
            <div className="w-[40%] min-w-[320px] border-l">
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
    </div>
  );
}
