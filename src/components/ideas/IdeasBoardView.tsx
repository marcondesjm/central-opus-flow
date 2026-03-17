import { Idea, ROADMAP_OPTIONS, THEME_PRESETS } from '@/hooks/useIdeas';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface IdeasBoardViewProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  selectedIdeaId?: string;
  onCreateInRoadmap: (roadmap: string) => void;
}

export function IdeasBoardView({ ideas, onSelectIdea, selectedIdeaId, onCreateInRoadmap }: IdeasBoardViewProps) {
  return (
    <div className="flex-1 overflow-x-auto p-3 md:p-4">
      <div className="flex gap-3 md:gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-4">
        {ROADMAP_OPTIONS.map(roadmap => {
          const columnIdeas = ideas.filter(i => i.roadmap === roadmap.id);
          return (
            <div key={roadmap.id} className="w-72 md:w-auto flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs font-semibold', roadmap.color, 'text-white border-0')}>
                    {roadmap.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{columnIdeas.length}</span>
                </div>
                <button
                  onClick={() => onCreateInRoadmap(roadmap.id)}
                  className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-2 flex-1">
                {columnIdeas.map(idea => {
                  const theme = THEME_PRESETS.find(t => t.id === idea.theme) || THEME_PRESETS[5];
                  const score = idea.impact * (6 - idea.effort);

                  return (
                    <div
                      key={idea.id}
                      onClick={() => onSelectIdea(idea)}
                      className={cn(
                        'rounded-lg border bg-card p-3 cursor-pointer transition-all hover:shadow-md',
                        selectedIdeaId === idea.id && 'ring-2 ring-primary'
                      )}
                    >
                      <h4 className="text-sm font-medium mb-1 line-clamp-2">{idea.title}</h4>
                      {idea.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {idea.description?.replace(/<[^>]*>/g, '').slice(0, 80)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-[9px] gap-1" style={{ borderColor: theme.color, color: theme.color }}>
                          {theme.icon} {theme.label}
                        </Badge>
                        <span className="text-[10px] font-bold text-primary">{score.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
