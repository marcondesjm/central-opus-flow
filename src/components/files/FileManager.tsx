import { useState, useRef, useCallback } from 'react';
import { useUserFiles, useUploadFile, useDeleteFile, getFileUrl, formatFileSize, UserFile } from '@/hooks/useUserFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Upload,
  Search,
  Image,
  Video,
  FileText,
  File,
  Trash2,
  Download,
  ExternalLink,
  Grid3X3,
  List,
  Filter,
  Loader2,
  FolderOpen,
  Plus,
  Github,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FileManagerProps {
  module?: string;
  moduleItemId?: string;
  compact?: boolean;
}

const MODULE_LABELS: Record<string, string> = {
  general: 'Geral',
  ideas: 'Ideias',
  projects: 'Projetos',
  proposals: 'Propostas',
};

const TYPE_ICONS: Record<string, typeof Image> = {
  image: Image,
  video: Video,
  pdf: FileText,
  document: FileText,
  archive: File,
  other: File,
};

const TYPE_COLORS: Record<string, string> = {
  image: 'text-emerald-500 bg-emerald-500/10',
  video: 'text-purple-500 bg-purple-500/10',
  pdf: 'text-red-500 bg-red-500/10',
  document: 'text-blue-500 bg-blue-500/10',
  archive: 'text-amber-500 bg-amber-500/10',
  other: 'text-muted-foreground bg-muted',
};

export function FileManager({ module, moduleItemId, compact = false }: FileManagerProps) {
  const { data: files = [], isLoading } = useUserFiles(module, moduleItemId);
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const promises = Array.from(fileList).map(file =>
      uploadFile.mutateAsync({ file, module: module || 'general', moduleItemId })
    );
    await Promise.allSettled(promises);
  }, [uploadFile, module, moduleItemId]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const filteredFiles = files.filter(f => {
    if (typeFilter && f.file_type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.file_name.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q);
    }
    return true;
  });

  const typeGroups = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.file_type] = (acc[f.file_type] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {!compact && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arquivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Type filters */}
            {Object.entries(typeGroups).map(([type, count]) => {
              const Icon = TYPE_ICONS[type] || File;
              return (
                <Button
                  key={type}
                  variant={typeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-xl gap-1.5"
                  onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {count}
                </Button>
              );
            })}
            <div className="flex border rounded-lg">
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}>
                <Grid3X3 className="w-3.5 h-3.5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('list')}>
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-border/60',
          compact && 'p-4'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        {uploadFile.isPending ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Enviando...</span>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              Arraste arquivos ou clique para enviar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Imagens, vídeos, PDFs, documentos (máx. 50MB)
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <FolderOpen className="w-4 h-4" />
                Meu Computador
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('https://drive.google.com', '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Google Drive
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('https://github.com', '_blank');
                }}
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Files */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {files.length === 0 ? 'Nenhum arquivo ainda' : 'Nenhum arquivo encontrado'}
          </p>
          <p className="text-xs text-muted-foreground">
            {files.length === 0 ? 'Faça upload para começar' : 'Tente alterar os filtros'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className={cn(
          'grid gap-3',
          compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        )}>
          {filteredFiles.map((file) => (
            <FileCard key={file.id} file={file} onDelete={setDeleteTarget} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredFiles.map((file) => (
            <FileListItem key={file.id} file={file} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir arquivo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.file_name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteFile.mutate(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FileCard({ file, onDelete }: { file: UserFile; onDelete: (f: UserFile) => void }) {
  const url = getFileUrl(file.file_path);
  const Icon = TYPE_ICONS[file.file_type] || File;
  const colorClass = TYPE_COLORS[file.file_type] || TYPE_COLORS.other;
  const isImage = file.file_type === 'image';
  const isVideo = file.file_type === 'video';

  return (
    <div className="group relative bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]">
      {/* Preview */}
      <div className="aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={url} alt={file.file_name} className="w-full h-full object-cover" loading="lazy" />
        ) : isVideo ? (
          <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
        ) : (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-medium text-foreground truncate" title={file.file_name}>
          {file.file_name}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatFileSize(file.file_size)}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={url}
          download={file.file_name}
          className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur border flex items-center justify-center hover:bg-card transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="w-3.5 h-3.5" />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur border flex items-center justify-center hover:bg-card transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={() => onDelete(file)}
          className="w-7 h-7 rounded-lg bg-card/90 backdrop-blur border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function FileListItem({ file, onDelete }: { file: UserFile; onDelete: (f: UserFile) => void }) {
  const url = getFileUrl(file.file_path);
  const Icon = TYPE_ICONS[file.file_type] || File;
  const colorClass = TYPE_COLORS[file.file_type] || TYPE_COLORS.other;

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.file_size)}</span>
          <span>•</span>
          <span>{format(new Date(file.created_at), "dd MMM yyyy", { locale: ptBR })}</span>
          {file.module !== 'general' && (
            <>
              <span>•</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {MODULE_LABELS[file.module] || file.module}
              </Badge>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={url}
          download={file.file_name}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </a>
        <button onClick={() => onDelete(file)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
