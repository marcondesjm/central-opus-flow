import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectStatus, ProjectType } from '@/types/project';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface FilterBarProps {
  statusFilter: ProjectStatus | 'all';
  typeFilter: ProjectType | 'all';
  tagFilter: string | null;
  onStatusChange: (status: ProjectStatus | 'all') => void;
  onTypeChange: (type: ProjectType | 'all') => void;
  onTagChange: (tag: string | null) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  tags?: Tag[];
}

export function FilterBar({
  statusFilter,
  typeFilter,
  tagFilter,
  onStatusChange,
  onTypeChange,
  onTagChange,
  onClearFilters,
  hasActiveFilters,
  tags = [],
}: FilterBarProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const filterCount = [
    statusFilter !== 'all',
    typeFilter !== 'all',
    tagFilter !== null,
  ].filter(Boolean).length;

  // Mobile collapsed view
  if (isMobile && !isExpanded) {
    return (
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {filterCount}
              </Badge>
            )}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6">
      {/* Mobile header */}
      {isMobile && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="w-full justify-between mb-3"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </span>
          <ChevronUp className="w-4 h-4" />
        </Button>
      )}

      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
        {/* Filter selects */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as ProjectStatus | 'all')}>
            <SelectTrigger className={cn("bg-card text-xs sm:text-sm", isMobile ? "flex-1" : "w-[130px] sm:w-[140px]")}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(value) => onTypeChange(value as ProjectType | 'all')}>
            <SelectTrigger className={cn("bg-card text-xs sm:text-sm", isMobile ? "flex-1" : "w-[130px] sm:w-[140px]")}>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="landing">Landing Page</SelectItem>
              <SelectItem value="app">Aplicativo</SelectItem>
              <SelectItem value="funnel">Funil</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {tags.slice(0, isMobile ? 4 : 6).map((tag) => (
              <Badge
                key={tag.id}
                variant={tagFilter === tag.name ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                onClick={() => onTagChange(tagFilter === tag.name ? null : tag.name)}
              >
                {tag.name}
              </Badge>
            ))}
            {tags.length > (isMobile ? 4 : 6) && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{tags.length - (isMobile ? 4 : 6)}
              </Badge>
            )}
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1.5 text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 px-2"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
