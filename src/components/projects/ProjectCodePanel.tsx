import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  useProjectFiles,
  useUploadProjectFile,
  useDeleteProjectFile,
  useCodeSnippets,
  useCreateCodeSnippet,
  useUpdateCodeSnippet,
  useDeleteCodeSnippet,
} from '@/hooks/useProjectFiles';
import {
  Upload, FileArchive, Download, Trash2, Plus, Code2, GitBranch, ExternalLink,
  Loader2, FileText, Clock, ChevronDown, ChevronUp, Save, Copy, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectCodePanelProps {
  projectId: string;
  repositoryUrl?: string | null;
  onRepositoryUrlChange?: (url: string | null) => void;
}

const languages = [
  'javascript', 'typescript', 'html', 'css', 'python', 'php', 'json', 'sql', 'bash', 'markdown', 'other'
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectCodePanel({ projectId, repositoryUrl, onRepositoryUrlChange }: ProjectCodePanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Repository URL state
  const [repoUrl, setRepoUrl] = useState(repositoryUrl || '');
  const [repoSaved, setRepoSaved] = useState(false);

  // File upload state
  const [uploadNotes, setUploadNotes] = useState('');
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  // Snippet state
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetLang, setNewSnippetLang] = useState('javascript');
  const [newSnippetCode, setNewSnippetCode] = useState('');
  const [editingSnippet, setEditingSnippet] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Queries
  const { data: files = [], isLoading: filesLoading } = useProjectFiles(projectId);
  const { data: snippets = [], isLoading: snippetsLoading } = useCodeSnippets(projectId);

  // Mutations
  const uploadFile = useUploadProjectFile();
  const deleteFile = useDeleteProjectFile();
  const createSnippet = useCreateCodeSnippet();
  const updateSnippet = useUpdateCodeSnippet();
  const deleteSnippet = useDeleteCodeSnippet();

  // Group files by name for versioning view
  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.file_name]) acc[file.file_name] = [];
    acc[file.file_name].push(file);
    return acc;
  }, {} as Record<string, typeof files>);

  const handleSaveRepoUrl = () => {
    onRepositoryUrlChange?.(repoUrl.trim() || null);
    setRepoSaved(true);
    setTimeout(() => setRepoSaved(false), 2000);
    toast({ title: 'Link do repositório salvo!' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    for (const file of Array.from(selectedFiles)) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: `${file.name} excede 50MB`, variant: 'destructive' });
        continue;
      }
      try {
        await uploadFile.mutateAsync({ projectId, file, notes: uploadNotes || undefined });
        toast({ title: 'Arquivo enviado!', description: file.name });
      } catch (err: any) {
        toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
      }
    }
    setUploadNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const { data } = supabase.storage.from('project-files').getPublicUrl(filePath);
    const a = document.createElement('a');
    a.href = data.publicUrl;
    a.download = fileName;
    a.target = '_blank';
    a.click();
  };

  const handleDeleteFile = async (id: string, filePath: string) => {
    try {
      await deleteFile.mutateAsync({ id, filePath, projectId });
      toast({ title: 'Arquivo excluído!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateSnippet = async () => {
    if (!newSnippetCode.trim()) return;
    try {
      await createSnippet.mutateAsync({
        projectId,
        title: newSnippetTitle.trim() || 'Sem título',
        language: newSnippetLang,
        code: newSnippetCode,
      });
      setNewSnippetTitle('');
      setNewSnippetCode('');
      toast({ title: 'Código salvo!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleSaveSnippet = async (id: string) => {
    try {
      await updateSnippet.mutateAsync({ id, projectId, code: editCode });
      setEditingSnippet(null);
      toast({ title: 'Código atualizado!' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Tabs defaultValue="files" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="files" className="gap-1.5 text-xs sm:text-sm">
          <FileArchive className="h-4 w-4" />
          Arquivos
        </TabsTrigger>
        <TabsTrigger value="code" className="gap-1.5 text-xs sm:text-sm">
          <Code2 className="h-4 w-4" />
          Código
        </TabsTrigger>
        <TabsTrigger value="repo" className="gap-1.5 text-xs sm:text-sm">
          <GitBranch className="h-4 w-4" />
          Repositório
        </TabsTrigger>
      </TabsList>

      {/* FILES TAB */}
      <TabsContent value="files" className="space-y-4 mt-4">
        {/* Upload area */}
        <div className="border-2 border-dashed border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="w-4 h-4" />
            <span>Enviar arquivos (ZIP, código, documentos - máx. 50MB)</span>
          </div>
          <Input
            placeholder="Notas sobre esta versão (opcional)"
            value={uploadNotes}
            onChange={(e) => setUploadNotes(e.target.value)}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept="*"
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFile.isPending}
          >
            {uploadFile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Selecionar Arquivos
          </Button>
        </div>

        {/* File list */}
        {filesLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : Object.keys(groupedFiles).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum arquivo enviado ainda.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(groupedFiles).map(([fileName, versions]) => (
              <div key={fileName} className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => setExpandedFile(expandedFile === fileName ? null : fileName)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-sm truncate">{fileName}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      v{versions[0].version}
                    </Badge>
                    {versions.length > 1 && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {versions.length} versões
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{formatFileSize(versions[0].file_size)}</span>
                    {expandedFile === fileName ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {expandedFile === fileName && (
                  <div className="border-t border-border bg-muted/20">
                    {versions.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">v{file.version}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(file.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            {file.notes && <p className="text-xs text-muted-foreground truncate">{file.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDownload(file.file_path, `${file.file_name}_v${file.version}`)}>
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteFile(file.id, file.file_path)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* CODE TAB */}
      <TabsContent value="code" className="space-y-4 mt-4">
        {/* New snippet */}
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Título do snippet"
              value={newSnippetTitle}
              onChange={(e) => setNewSnippetTitle(e.target.value)}
              className="flex-1"
            />
            <Select value={newSnippetLang} onValueChange={setNewSnippetLang}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Cole seu código aqui..."
            value={newSnippetCode}
            onChange={(e) => setNewSnippetCode(e.target.value)}
            rows={6}
            className="font-mono text-sm"
          />
          <Button
            className="w-full gap-2"
            onClick={handleCreateSnippet}
            disabled={!newSnippetCode.trim() || createSnippet.isPending}
          >
            {createSnippet.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Salvar Código
          </Button>
        </div>

        {/* Snippets list */}
        {snippetsLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : snippets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum snippet salvo ainda.</p>
        ) : (
          <div className="space-y-3">
            {snippets.map((snippet) => (
              <div key={snippet.id} className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{snippet.title}</span>
                    <Badge variant="secondary" className="text-xs">{snippet.language}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleCopyCode(snippet.code, snippet.id)}
                    >
                      {copiedId === snippet.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    {editingSnippet === snippet.id ? (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveSnippet(snippet.id)}>
                        <Save className="w-3.5 h-3.5 text-primary" />
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingSnippet(snippet.id); setEditCode(snippet.code); }}>
                        <Code2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={async () => {
                        await deleteSnippet.mutateAsync({ id: snippet.id, projectId });
                        toast({ title: 'Snippet excluído!' });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {editingSnippet === snippet.id ? (
                  <Textarea
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    rows={8}
                    className="font-mono text-sm rounded-none border-0 border-t border-border"
                  />
                ) : (
                  <pre className="p-3 overflow-x-auto text-xs font-mono bg-muted/10 max-h-[300px] overflow-y-auto">
                    <code>{snippet.code}</code>
                  </pre>
                )}
                <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border">
                  {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* REPO TAB */}
      <TabsContent value="repo" className="space-y-4 mt-4">
        <div className="space-y-3">
          <Label>Link do repositório (GitHub, GitLab, etc.)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveRepoUrl} variant={repoSaved ? 'default' : 'outline'} className="gap-2 shrink-0">
              {repoSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {repoSaved ? 'Salvo!' : 'Salvar'}
            </Button>
          </div>
          {repoUrl && (
            <Button variant="outline" className="gap-2" asChild>
              <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Abrir Repositório
              </a>
            </Button>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <GitBranch className="w-4 h-4 text-primary" />
            Dicas
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Cole o link do seu repositório GitHub ou GitLab</li>
            <li>Use a aba "Arquivos" para fazer upload de ZIPs do código</li>
            <li>Use a aba "Código" para salvar snippets importantes</li>
            <li>Cada upload cria uma nova versão automaticamente</li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  );
}
