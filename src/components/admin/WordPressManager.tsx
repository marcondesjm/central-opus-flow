import { useState, useRef } from 'react';
import { Upload, Trash2, Globe, Key, User, Plus, FileText, Loader2, ExternalLink, Download, Database, Archive, FolderOpen, Github } from 'lucide-react';
import JSZip from 'jszip';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  useWordPressConnections,
  useCreateWordPressConnection,
  useDeleteWordPressConnection,
  parseWordPressXML,
} from '@/hooks/useWordPress';
import { useCreateBlogPost } from '@/hooks/useBlog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useUploadFile } from '@/hooks/useUserFiles';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function WordPressManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: connections = [], isLoading } = useWordPressConnections();
  const createConnection = useCreateWordPressConnection();
  const deleteConnection = useDeleteWordPressConnection();
  const createPost = useCreateBlogPost();
  const uploadFile = useUploadFile();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);
  const [importResults, setImportResults] = useState<{ total: number; imported: number } | null>(null);
  const [savedToFileManager, setSavedToFileManager] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    site_url: '',
    username: '',
    app_password: '',
    site_name: '',
  });

  const resetForm = () => {
    setForm({ site_url: '', username: '', app_password: '', site_name: '' });
    setShowAddDialog(false);
  };

  const handleSaveConnection = async () => {
    if (!form.site_url || !form.username || !form.app_password) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    await createConnection.mutateAsync({
      site_url: form.site_url.replace(/\/$/, ''),
      username: form.username,
      app_password: form.app_password,
      site_name: form.site_name || undefined,
    });
    resetForm();
  };

  const extractXmlFromZip = async (file: File): Promise<string | null> => {
    try {
      const zip = await JSZip.loadAsync(file);

      for (const [name, entry] of Object.entries(zip.files)) {
        if (!entry.dir && name.toLowerCase().endsWith('.xml')) {
          return await entry.async('text');
        }
      }

      for (const [, entry] of Object.entries(zip.files)) {
        if (!entry.dir) {
          try {
            const content = await entry.async('text');
            if (content.trimStart().startsWith('<?xml') || content.trimStart().startsWith('<rss') || content.includes('<wp:wxr_version>')) {
              return content;
            }
          } catch {
            // Binary file, skip
          }
        }
      }

      return null;
    } catch (err) {
      console.error('Erro ao processar ZIP:', err);
      return null;
    }
  };

  const extractXmlFromFile = async (file: File): Promise<string | null> => {
    const ext = file.name.toLowerCase().split('.').pop();

    if (ext === 'xml') {
      return await file.text();
    }

    if (ext === 'zip') {
      const xml = await extractXmlFromZip(file);
      if (!xml) {
        return null;
      }
      return xml;
    }

    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('[WP Upload] Nenhum arquivo selecionado');
      return;
    }

    console.log('[WP Upload] Arquivo selecionado:', file.name, file.type, file.size);
    setImporting(true);
    setImportResults(null);
    setSavedToFileManager(null);

    try {
      const xmlText = await extractXmlFromFile(file);
      console.log('[WP Upload] XML encontrado:', !!xmlText);

      if (!xmlText) {
        console.log('[WP Upload] Salvando no gerenciador de arquivos...');
        try {
          await uploadFile.mutateAsync({
            file,
            module: 'general',
            description: `Arquivo WordPress importado: ${file.name}`,
          });
          console.log('[WP Upload] Salvo com sucesso no gerenciador');
          setSavedToFileManager(file.name);
          toast.success(`Arquivo "${file.name}" salvo no Gerenciador de Arquivos!`);
        } catch (uploadErr: any) {
          console.error('[WP Upload] Erro ao salvar no gerenciador:', uploadErr?.message || uploadErr);
          toast.error(`Erro ao salvar arquivo: ${uploadErr?.message || 'erro desconhecido'}`);
        }
        return;
      }

      const posts = parseWordPressXML(xmlText);
      console.log('[WP Upload] Posts encontrados:', posts.length);

      if (posts.length === 0) {
        try {
          await uploadFile.mutateAsync({
            file,
            module: 'general',
            description: `Arquivo WordPress sem posts: ${file.name}`,
          });
          setSavedToFileManager(file.name);
          toast.info('Nenhum post encontrado, mas o arquivo foi salvo no Gerenciador de Arquivos.');
        } catch (uploadErr: any) {
          console.error('[WP Upload] Erro ao salvar no gerenciador:', uploadErr?.message || uploadErr);
          toast.error(`Erro ao salvar arquivo: ${uploadErr?.message || 'erro desconhecido'}`);
        }
        return;
      }

      let imported = 0;
      for (const post of posts) {
        try {
          await createPost.mutateAsync({
            author_id: user?.id || '',
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || null,
            cover_image: null,
            category_id: null,
            locale: 'pt',
            tags: post.categories,
            is_published: post.status === 'publish',
            published_at: post.published_at,
          });
          imported++;
        } catch (err) {
          console.error(`Erro ao importar "${post.title}":`, err);
        }
      }

      setImportResults({ total: posts.length, imported });
      toast.success(`${imported} de ${posts.length} posts importados!`);
    } catch (err: any) {
      console.error('[WP Upload] Erro geral:', err?.message || err);
      toast.error('Erro ao processar o arquivo.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportWPBackup = () => {
    if (connections.length === 0) {
      toast.error('Nenhuma conexão WordPress para exportar.');
      return;
    }

    const backupData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      type: 'wordpress-connections',
      data: connections.map(c => ({
        siteUrl: c.site_url,
        username: c.username,
        appPassword: c.app_password,
        siteName: c.site_name,
        lastSyncAt: c.last_sync_at,
        createdAt: c.created_at,
      })),
      summary: { total: connections.length },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wordpress-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${connections.length} conexões WordPress exportadas!`);
  };

  const handleImportWPBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingBackup(true);
    try {
      let text: string;
      const ext = file.name.toLowerCase().split('.').pop();

      if (ext === 'rar') {
        toast.error('Arquivo .rar não é suportado para importar conexões. Use .json, .zip ou .wpress.');
        return;
      }

      if (ext === 'zip' || ext === 'wpress') {
        const zip = await JSZip.loadAsync(file);
        let jsonContent: string | null = null;
        for (const [name, entry] of Object.entries(zip.files)) {
          if (!entry.dir && name.toLowerCase().endsWith('.json')) {
            jsonContent = await entry.async('text');
            break;
          }
        }
        if (!jsonContent) {
          toast.error(`Nenhum arquivo JSON de backup encontrado dentro de "${file.name}".`);
          return;
        }
        text = jsonContent;
      } else {
        text = await file.text();
      }

      const backup = JSON.parse(text);

      if (!backup.data || !Array.isArray(backup.data)) {
        toast.error('Arquivo de backup WordPress inválido.');
        return;
      }

      let imported = 0;
      for (const wp of backup.data) {
        const exists = connections.find(
          c => c.site_url === wp.siteUrl && c.username === wp.username
        );
        if (exists) {
          console.log('Conexão já existe:', wp.siteUrl);
          continue;
        }
        try {
          await createConnection.mutateAsync({
            site_url: wp.siteUrl,
            username: wp.username,
            app_password: wp.appPassword,
            site_name: wp.siteName || undefined,
          });
          imported++;
        } catch (err) {
          console.error(`Erro ao importar conexão "${wp.siteUrl}":`, err);
        }
      }
      toast.success(`${imported} de ${backup.data.length} conexões importadas!`);
    } catch (err) {
      toast.error('Erro ao processar o arquivo de backup.');
      console.error(err);
    } finally {
      setImportingBackup(false);
      if (backupFileInputRef.current) backupFileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4 text-primary" />
            Backup de Conexões WordPress
          </CardTitle>
          <CardDescription className="text-xs">
            Exporte e importe conexões WordPress.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportWPBackup}
              disabled={connections.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar Conexões
            </Button>

            <input
              ref={backupFileInputRef}
              type="file"
              accept=".json,.zip,.wpress"
              onChange={handleImportWPBackup}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => backupFileInputRef.current?.click()}
              disabled={importingBackup}
              className="gap-2"
            >
              {importingBackup ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {importingBackup ? 'Importando...' : 'Importar Conexões'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Incluídas no backup geral do sistema.
          </p>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4 text-primary" />
            Importar Backup WordPress
          </CardTitle>
          <CardDescription className="text-xs">
            XML importa posts, outros formatos vão para o Gerenciador de Arquivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div
            onClick={() => !importing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
              importing
                ? 'border-primary/50 bg-primary/5 cursor-wait'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            {importing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processando...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <Archive className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Clique para selecionar o arquivo</p>
                <p className="text-xs text-muted-foreground">
                  XML, ZIP, RAR ou qualquer arquivo (máx. 50MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
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
              className="gap-2"
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
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://github.com', '_blank');
              }}
            >
              <Github className="w-4 h-4" />
              GitHub
            </Button>
          </div>

          {savedToFileManager && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Arquivo salvo no Gerenciador de Arquivos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {savedToFileManager} foi salvo com sucesso e já pode ser acessado na área de Arquivos.
                </p>
              </div>
              <div>
                <Button type="button" variant="outline" className="gap-2" onClick={() => navigate('/files')}>
                  <FolderOpen className="w-4 h-4" />
                  Abrir Gerenciador de Arquivos
                </Button>
              </div>
            </div>
          )}

          {importResults && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium">
                Resultado da importação:
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {importResults.imported} de {importResults.total} posts importados com sucesso.
              </p>
              {importResults.imported < importResults.total && (
                <p className="text-xs text-muted-foreground mt-1">
                  {importResults.total - importResults.imported} posts falharam (possível duplicação de slug).
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="w-5 h-5 text-primary" />
                Conexões WordPress
              </CardTitle>
              <CardDescription>
                Salve as credenciais dos seus sites WordPress para referência.
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
          ) : connections.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma conexão WordPress cadastrada.
            </p>
          ) : (
            <div className="space-y-3">
              {connections.map(conn => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {conn.site_name || conn.site_url.replace(/^https?:\/\//, '')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{conn.username}</span>
                        <span>•</span>
                        <span>{format(new Date(conn.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={conn.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteConnection.mutate(conn.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Nova Conexão WordPress
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do site (opcional)</Label>
              <Input
                placeholder="Meu Blog WordPress"
                value={form.site_name}
                onChange={e => setForm(prev => ({ ...prev, site_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>URL do site *</Label>
              <Input
                placeholder="https://meublog.com.br"
                value={form.site_url}
                onChange={e => setForm(prev => ({ ...prev, site_url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Usuário *</Label>
              <Input
                placeholder="admin"
                value={form.username}
                onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Senha de aplicação *</Label>
              <Input
                type="password"
                placeholder="xxxx xxxx xxxx xxxx"
                value={form.app_password}
                onChange={e => setForm(prev => ({ ...prev, app_password: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Gere em: WordPress → Usuários → Perfil → Senhas de Aplicação
              </p>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveConnection}
                disabled={createConnection.isPending}
              >
                {createConnection.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
