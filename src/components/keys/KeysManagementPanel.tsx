import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { useAccounts } from '@/hooks/useProjects';
import { 
  getLocalKeys, 
  getAccountLocalKeys, 
  saveAccountLocalKeys,
  deleteAccountLocalKeys,
  AccountLocalKeys 
} from '@/hooks/useLocalKeys';
import { KeysBackupButtons } from './KeysBackupButtons';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  HardDrive, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Trash2, 
  Save,
  Plus,
  Shield,
  FileText,
  FileJson
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeysManagementPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditingKeys {
  accountId: string;
  keys: AccountLocalKeys;
}

export function KeysManagementPanel({ open, onOpenChange }: KeysManagementPanelProps) {
  const { data: accounts = [] } = useAccounts();
  const [allKeys, setAllKeys] = useState<Record<string, AccountLocalKeys>>({});
  const [editingAccount, setEditingAccount] = useState<EditingKeys | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [quickAddKeys, setQuickAddKeys] = useState<AccountLocalKeys>({});
  const [selectedQuickAccount, setSelectedQuickAccount] = useState<string>('');
  const { toast } = useToast();

  // Carregar todas as keys
  useEffect(() => {
    if (open) {
      setAllKeys(getLocalKeys());
    }
  }, [open]);

  const refreshKeys = () => {
    setAllKeys(getLocalKeys());
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'Conta desconhecida';
  };

  const getAccountColor = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.color || 'blue';
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  };

  const countKeys = (keys: AccountLocalKeys) => {
    let count = 0;
    if (keys.supabase_url) count++;
    if (keys.anon_key) count++;
    if (keys.service_role_key) count++;
    if (keys.openai_key) count++;
    if (keys.custom_keys) count += keys.custom_keys.length;
    return count;
  };

  const toggleShowValue = (keyId: string) => {
    setShowValues(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const startEditing = (accountId: string) => {
    const keys = getAccountLocalKeys(accountId);
    setEditingAccount({ accountId, keys: { ...keys } });
  };

  const cancelEditing = () => {
    setEditingAccount(null);
  };

  const saveEditing = () => {
    if (!editingAccount) return;
    
    saveAccountLocalKeys(editingAccount.accountId, editingAccount.keys);
    refreshKeys();
    setEditingAccount(null);
    
    toast({
      title: 'Keys salvas!',
      description: `As keys da conta "${getAccountName(editingAccount.accountId)}" foram atualizadas.`,
    });
  };

  const handleDeleteKeys = (accountId: string) => {
    deleteAccountLocalKeys(accountId);
    refreshKeys();
    setDeleteConfirm(null);
    
    toast({
      title: 'Keys removidas',
      description: `Todas as keys da conta "${getAccountName(accountId)}" foram removidas.`,
    });
  };

  const updateEditingKey = (field: keyof AccountLocalKeys, value: string) => {
    if (!editingAccount) return;
    setEditingAccount({
      ...editingAccount,
      keys: { ...editingAccount.keys, [field]: value }
    });
  };

  const addCustomKey = () => {
    if (!editingAccount) return;
    const customKeys = editingAccount.keys.custom_keys || [];
    setEditingAccount({
      ...editingAccount,
      keys: { 
        ...editingAccount.keys, 
        custom_keys: [...customKeys, { name: '', value: '' }] 
      }
    });
  };

  const updateCustomKey = (index: number, field: 'name' | 'value', value: string) => {
    if (!editingAccount) return;
    const customKeys = [...(editingAccount.keys.custom_keys || [])];
    customKeys[index] = { ...customKeys[index], [field]: value };
    setEditingAccount({
      ...editingAccount,
      keys: { ...editingAccount.keys, custom_keys: customKeys }
    });
  };

  const removeCustomKey = (index: number) => {
    if (!editingAccount) return;
    const customKeys = (editingAccount.keys.custom_keys || []).filter((_, i) => i !== index);
    setEditingAccount({
      ...editingAccount,
      keys: { ...editingAccount.keys, custom_keys: customKeys }
    });
  };

  const accountsWithKeys = Object.keys(allKeys);
  const accountsWithoutKeys = accounts.filter(a => !allKeys[a.id]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Gerenciador de Keys
            </DialogTitle>
            <DialogDescription>
              Gerencie todas as API Keys armazenadas localmente no navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-shrink-0 px-6 pb-4">
              <Alert className="bg-amber-500/10 border-amber-500/30">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-xs">
                  <strong>⚠️ Armazenamento Local:</strong> Todas as keys são salvas apenas neste navegador. 
                  Use o backup para transferir para outros dispositivos.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex-shrink-0 px-6 pb-4 flex justify-between items-center border-b">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <HardDrive className="w-3 h-3" />
                  {accountsWithKeys.length} conta(s) com keys
                </Badge>
              </div>
              <KeysBackupButtons onImportSuccess={refreshKeys} />
            </div>

            <ScrollArea className="flex-1 min-h-0">
            <div className="py-4 px-6 space-y-4">
              {accountsWithKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma key cadastrada</p>
                  <p className="text-xs mt-1">Adicione keys nas configurações de cada conta</p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {accountsWithKeys.map((accountId) => {
                    const keys = allKeys[accountId];
                    const isEditing = editingAccount?.accountId === accountId;
                    const currentKeys = isEditing ? editingAccount.keys : keys;
                    
                    return (
                      <AccordionItem 
                        key={accountId} 
                        value={accountId}
                        className="border rounded-lg px-3"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-3 h-3 rounded-full',
                              colorClasses[getAccountColor(accountId)]
                            )} />
                            <span className="font-medium">{getAccountName(accountId)}</span>
                            <Badge variant="outline" className="text-xs">
                              {countKeys(keys)} key(s)
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-4">
                            {/* Supabase URL */}
                            {(currentKeys.supabase_url || isEditing) && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">URL Supabase</Label>
                                {isEditing ? (
                                  <Input
                                    value={currentKeys.supabase_url || ''}
                                    onChange={(e) => updateEditingKey('supabase_url', e.target.value)}
                                    placeholder="https://xxx.supabase.co"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                                      {currentKeys.supabase_url}
                                    </code>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Anon Key */}
                            {(currentKeys.anon_key || isEditing) && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Anon Key</Label>
                                {isEditing ? (
                                  <Input
                                    value={currentKeys.anon_key || ''}
                                    onChange={(e) => updateEditingKey('anon_key', e.target.value)}
                                    placeholder="eyJhbGciOi..."
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                                      {showValues[`${accountId}-anon`] 
                                        ? currentKeys.anon_key 
                                        : '••••••••••••••••••••'}
                                    </code>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => toggleShowValue(`${accountId}-anon`)}
                                    >
                                      {showValues[`${accountId}-anon`] ? (
                                        <EyeOff className="w-3 h-3" />
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Service Role Key */}
                            {(currentKeys.service_role_key || isEditing) && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Service Role Key</Label>
                                {isEditing ? (
                                  <Input
                                    type="password"
                                    value={currentKeys.service_role_key || ''}
                                    onChange={(e) => updateEditingKey('service_role_key', e.target.value)}
                                    placeholder="eyJhbGciOi..."
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                                      {showValues[`${accountId}-service`] 
                                        ? currentKeys.service_role_key 
                                        : '••••••••••••••••••••'}
                                    </code>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => toggleShowValue(`${accountId}-service`)}
                                    >
                                      {showValues[`${accountId}-service`] ? (
                                        <EyeOff className="w-3 h-3" />
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* OpenAI Key */}
                            {(currentKeys.openai_key || isEditing) && (
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">OpenAI Key</Label>
                                {isEditing ? (
                                  <Input
                                    type="password"
                                    value={currentKeys.openai_key || ''}
                                    onChange={(e) => updateEditingKey('openai_key', e.target.value)}
                                    placeholder="sk-..."
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                                      {showValues[`${accountId}-openai`] 
                                        ? currentKeys.openai_key 
                                        : '••••••••••••••••••••'}
                                    </code>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => toggleShowValue(`${accountId}-openai`)}
                                    >
                                      {showValues[`${accountId}-openai`] ? (
                                        <EyeOff className="w-3 h-3" />
                                      ) : (
                                        <Eye className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Custom Keys */}
                            {(currentKeys.custom_keys && currentKeys.custom_keys.length > 0) && (
                              <div className="space-y-2 pt-2 border-t">
                                <Label className="text-xs text-muted-foreground">Keys Personalizadas</Label>
                                {currentKeys.custom_keys.map((customKey, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    {isEditing ? (
                                      <>
                                        <Input
                                          value={customKey.name}
                                          onChange={(e) => updateCustomKey(index, 'name', e.target.value)}
                                          placeholder="Nome"
                                          className="flex-1"
                                        />
                                        <Input
                                          type="password"
                                          value={customKey.value}
                                          onChange={(e) => updateCustomKey(index, 'value', e.target.value)}
                                          placeholder="Valor"
                                          className="flex-1"
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive"
                                          onClick={() => removeCustomKey(index)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Badge variant="outline" className="text-xs">
                                          {customKey.name}
                                        </Badge>
                                        <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                                          {showValues[`${accountId}-custom-${index}`] 
                                            ? customKey.value 
                                            : '••••••••••••••••••••'}
                                        </code>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => toggleShowValue(`${accountId}-custom-${index}`)}
                                        >
                                          {showValues[`${accountId}-custom-${index}`] ? (
                                            <EyeOff className="w-3 h-3" />
                                          ) : (
                                            <Eye className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add custom key button when editing */}
                            {isEditing && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addCustomKey}
                                className="w-full"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Adicionar Key Personalizada
                              </Button>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-2 border-t">
                              {isEditing ? (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditing}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={saveEditing}
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    Salvar
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditing(accountId)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteConfirm(accountId)}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Remover
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}

              {/* Campos disponíveis e templates - formulário rápido */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">
                    Adicionar keys rapidamente:
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/templates/keys-template.txt';
                        link.download = 'keys-template.txt';
                        link.click();
                      }}
                    >
                      <FileText className="w-3 h-3" />
                      TXT
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = '/templates/keys-template.json';
                        link.download = 'keys-template.json';
                        link.click();
                      }}
                    >
                      <FileJson className="w-3 h-3" />
                      JSON
                    </Button>
                  </div>
                </div>

                {/* Seletor de conta */}
                {accountsWithoutKeys.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">Selecione uma conta:</Label>
                    <div className="flex flex-wrap gap-2">
                      {accountsWithoutKeys.map((account) => (
                        <Badge 
                          key={account.id} 
                          variant={selectedQuickAccount === account.id ? "default" : "outline"} 
                          className={cn(
                            "gap-1 cursor-pointer transition-all",
                            selectedQuickAccount === account.id ? "opacity-100" : "opacity-60 hover:opacity-100"
                          )}
                          onClick={() => {
                            setSelectedQuickAccount(account.id);
                            setQuickAddKeys({});
                          }}
                        >
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            colorClasses[account.color]
                          )} />
                          {account.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campos editáveis */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">URL Supabase</Label>
                    <Input
                      placeholder="https://xxx.supabase.co"
                      value={quickAddKeys.supabase_url || ''}
                      onChange={(e) => setQuickAddKeys(prev => ({ ...prev, supabase_url: e.target.value }))}
                      disabled={!selectedQuickAccount && accountsWithoutKeys.length > 0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Anon Key</Label>
                    <Input
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={quickAddKeys.anon_key || ''}
                      onChange={(e) => setQuickAddKeys(prev => ({ ...prev, anon_key: e.target.value }))}
                      disabled={!selectedQuickAccount && accountsWithoutKeys.length > 0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Service Role Key</Label>
                    <Input
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={quickAddKeys.service_role_key || ''}
                      onChange={(e) => setQuickAddKeys(prev => ({ ...prev, service_role_key: e.target.value }))}
                      disabled={!selectedQuickAccount && accountsWithoutKeys.length > 0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">OpenAI Key</Label>
                    <Input
                      placeholder="sk-proj-..."
                      value={quickAddKeys.openai_key || ''}
                      onChange={(e) => setQuickAddKeys(prev => ({ ...prev, openai_key: e.target.value }))}
                      disabled={!selectedQuickAccount && accountsWithoutKeys.length > 0}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Outros (notas, tokens, etc.)</Label>
                    <textarea
                      placeholder="Cole aqui outras keys, tokens ou anotações..."
                      value={quickAddKeys.notes || ''}
                      onChange={(e) => setQuickAddKeys(prev => ({ ...prev, notes: e.target.value }))}
                      disabled={!selectedQuickAccount && accountsWithoutKeys.length > 0}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>

                  {/* Botão salvar */}
                  {selectedQuickAccount && (
                    <Button
                      className="w-full mt-2"
                      onClick={() => {
                        if (!selectedQuickAccount) return;
                        
                        const hasAnyKey = quickAddKeys.supabase_url || quickAddKeys.anon_key || 
                                         quickAddKeys.service_role_key || quickAddKeys.openai_key || quickAddKeys.notes;
                        
                        if (!hasAnyKey) {
                          toast({
                            title: 'Preencha pelo menos um campo',
                            variant: 'destructive',
                          });
                          return;
                        }

                        saveAccountLocalKeys(selectedQuickAccount, quickAddKeys);
                        refreshKeys();
                        setQuickAddKeys({});
                        setSelectedQuickAccount('');
                        toast({
                          title: 'Keys salvas!',
                          description: `Keys adicionadas para ${getAccountName(selectedQuickAccount)}`,
                        });
                      }}
                      disabled={!selectedQuickAccount}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Keys para {selectedQuickAccount ? getAccountName(selectedQuickAccount) : 'conta'}
                    </Button>
                  )}

                  {!selectedQuickAccount && accountsWithoutKeys.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Selecione uma conta acima para preencher as keys
                    </p>
                  )}

                  {accountsWithoutKeys.length === 0 && accounts.length > 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Todas as contas já possuem keys cadastradas
                    </p>
                  )}
                </div>
              </div>

            </div>
          </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover todas as keys?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá remover todas as keys salvas para a conta "{deleteConfirm ? getAccountName(deleteConfirm) : ''}". 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteKeys(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
