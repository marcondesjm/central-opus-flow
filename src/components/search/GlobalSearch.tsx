import { useEffect, useState, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star, 
  Tag as TagIcon, 
  Globe, 
  FileText, 
  ExternalLink,
  Archive,
} from 'lucide-react';
import { useProjects, useAccounts, useTags, Project, LovableAccount, Tag as TagType } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProject?: (projectId: string) => void;
  onSelectAccount?: (accountId: string) => void;
  onSelectTag?: (tagName: string) => void;
}

export function GlobalSearch({ 
  open, 
  onOpenChange,
  onSelectProject,
  onSelectAccount,
  onSelectTag,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const { data: projects = [] } = useProjects();
  const { data: accounts = [] } = useAccounts();
  const { data: tags = [] } = useTags();

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        projects: projects.slice(0, 5),
        accounts: accounts.slice(0, 3),
        tags: tags.slice(0, 5),
        hasQuery: false,
      };
    }

    const q = query.toLowerCase();

    // Search projects by name, description, tags
    const matchedProjects = projects.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.url?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.name.toLowerCase().includes(q))
    ).slice(0, 10);

    // Search accounts by name or email
    const matchedAccounts = accounts.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    ).slice(0, 5);

    // Search tags by name
    const matchedTags = tags.filter(t =>
      t.name.toLowerCase().includes(q)
    ).slice(0, 5);

    return {
      projects: matchedProjects,
      accounts: matchedAccounts,
      tags: matchedTags,
      hasQuery: true,
    };
  }, [query, projects, accounts, tags]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <Globe className="w-3 h-3 text-emerald-500" />;
      case 'draft': return <FileText className="w-3 h-3 text-amber-500" />;
      case 'archived': return <Archive className="w-3 h-3 text-muted-foreground" />;
      default: return null;
    }
  };

  const getAccountColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      violet: 'bg-violet-500',
    };
    return colors[color] || 'bg-primary';
  };

  const handleSelectProject = (project: Project) => {
    onSelectProject?.(project.id);
    if (project.url) {
      window.open(project.url, '_blank');
    }
    onOpenChange(false);
  };

  const handleSelectAccount = (account: LovableAccount) => {
    onSelectAccount?.(account.id);
    onOpenChange(false);
  };

  const handleSelectTag = (tag: TagType) => {
    onSelectTag?.(tag.name);
    onOpenChange(false);
  };

  const totalResults = results.projects.length + results.accounts.length + results.tags.length;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Buscar projetos, contas, tags..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center py-6">
            <Search className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum resultado encontrado para "{query}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tente buscar por nome, tag, conta ou data
            </p>
          </div>
        </CommandEmpty>

        {/* Projects */}
        {results.projects.length > 0 && (
          <CommandGroup heading="Projetos">
            {results.projects.map((project) => {
              const account = accounts.find(a => a.id === project.account_id);
              return (
                <CommandItem
                  key={project.id}
                  value={`project-${project.id}`}
                  onSelect={() => handleSelectProject(project)}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(project.status)}
                    <span className="font-medium truncate">{project.name}</span>
                    {project.is_favorite && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {account && (
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getAccountColor(account.color)}`} />
                        <span className="text-xs text-muted-foreground">{account.name}</span>
                      </div>
                    )}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex gap-1">
                        {project.tags.slice(0, 2).map(tag => (
                          <Badge key={tag.id} variant="secondary" className="text-[10px] px-1 py-0">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(project.updated_at), 'dd MMM', { locale: ptBR })}
                    </span>
                    {project.url && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {results.projects.length > 0 && (results.accounts.length > 0 || results.tags.length > 0) && (
          <CommandSeparator />
        )}

        {/* Accounts */}
        {results.accounts.length > 0 && (
          <CommandGroup heading="Contas">
            {results.accounts.map((account) => {
              const projectCount = projects.filter(p => p.account_id === account.id).length;
              return (
                <CommandItem
                  key={account.id}
                  value={`account-${account.id}`}
                  onSelect={() => handleSelectAccount(account)}
                  className="flex items-center gap-3 py-2"
                >
                  <div className={`w-3 h-3 rounded-full ${getAccountColor(account.color)}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{account.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{account.email}</span>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {projectCount} projeto{projectCount !== 1 ? 's' : ''}
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {results.accounts.length > 0 && results.tags.length > 0 && (
          <CommandSeparator />
        )}

        {/* Tags */}
        {results.tags.length > 0 && (
          <CommandGroup heading="Tags">
            {results.tags.map((tag) => {
              const tagProjectCount = projects.filter(p => 
                p.tags?.some(t => t.id === tag.id)
              ).length;
              return (
                <CommandItem
                  key={tag.id}
                  value={`tag-${tag.id}`}
                  onSelect={() => handleSelectTag(tag as TagType)}
                  className="flex items-center gap-3 py-2"
                >
                  <TagIcon className="w-3 h-3 text-muted-foreground" />
                  <Badge
                    variant="secondary" 
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {tagProjectCount} projeto{tagProjectCount !== 1 ? 's' : ''}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* Search tips when no query */}
        {!results.hasQuery && totalResults > 0 && (
          <>
            <CommandSeparator />
            <div className="px-2 py-3 text-center">
              <p className="text-xs text-muted-foreground">
                💡 Dica: busque por nome, descrição, tag ou conta
              </p>
            </div>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
