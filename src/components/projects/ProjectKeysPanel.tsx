import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjectKeys, ProjectKeys } from '@/hooks/useProjectKeys';
import { useToast } from '@/hooks/use-toast';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Trash2, 
  Save, 
  Plus, 
  Shield, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface ProjectKeysPanelProps {
  projectId: string;
  projectName: string;
}

export function ProjectKeysPanel({ projectId, projectName }: ProjectKeysPanelProps) {
  const { keys, saveKeys, deleteKeys, isLoaded } = useProjectKeys(projectId);
  const [editingKeys, setEditingKeys] = useState<ProjectKeys | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Inicializa edição se não houver
  const currentKeys = editingKeys ?? keys;

  const startEditing = () => {
    setEditingKeys({ ...keys });
  };

  const cancelEditing = () => {
    setEditingKeys(null);
  };

  const handleSave = () => {
    if (!editingKeys) return;
    setIsSaving(true);
    
    saveKeys(editingKeys);
    setEditingKeys(null);
    
    toast({
      title: 'Keys salvas!',
      description: `As keys do projeto "${projectName}" foram salvas localmente.`,
    });
    
    setIsSaving(false);
  };

  const handleDelete = () => {
    deleteKeys();
    setEditingKeys(null);
    toast({
      title: 'Keys removidas',
      description: 'Todas as keys do projeto foram removidas.',
    });
  };

  const updateKey = (field: keyof ProjectKeys, value: string) => {
    if (editingKeys) {
      setEditingKeys({ ...editingKeys, [field]: value });
    } else {
      setEditingKeys({ ...keys, [field]: value });
    }
  };

  const toggleShowValue = (keyId: string) => {
    setShowValues(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const addCustomKey = () => {
    const keysToEdit = editingKeys || keys;
    const customKeys = keysToEdit.custom_keys || [];
    setEditingKeys({
      ...keysToEdit,
      custom_keys: [...customKeys, { name: '', value: '' }]
    });
  };

  const updateCustomKey = (index: number, field: 'name' | 'value', value: string) => {
    const keysToEdit = editingKeys || keys;
    const customKeys = [...(keysToEdit.custom_keys || [])];
    customKeys[index] = { ...customKeys[index], [field]: value };
    setEditingKeys({
      ...keysToEdit,
      custom_keys: customKeys
    });
  };

  const removeCustomKey = (index: number) => {
    const keysToEdit = editingKeys || keys;
    const customKeys = (keysToEdit.custom_keys || []).filter((_, i) => i !== index);
    setEditingKeys({
      ...keysToEdit,
      custom_keys: customKeys
    });
  };

  const isEditing = editingKeys !== null;
  const hasAnyKeys = !!(keys.supabase_url || keys.anon_key || keys.service_role_key || 
    keys.openai_key || keys.stripe_key || keys.resend_key || 
    (keys.custom_keys && keys.custom_keys.length > 0));

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerta de segurança */}
      <Alert className="bg-amber-500/10 border-amber-500/30">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-xs">
          <strong>Armazenamento Local:</strong> As keys são salvas apenas neste navegador. 
          Não compartilhe seu dispositivo para manter suas credenciais seguras.
        </AlertDescription>
      </Alert>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {/* Supabase URL */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            URL Supabase
          </Label>
          {isEditing ? (
            <Input
              value={currentKeys.supabase_url || ''}
              onChange={(e) => updateKey('supabase_url', e.target.value)}
              placeholder="https://xxx.supabase.co"
            />
          ) : (
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
              {keys.supabase_url || 'Não configurado'}
            </div>
          )}
        </div>

        {/* Anon Key */}
        <div className="space-y-2">
          <Label className="text-sm">Anon Key</Label>
          {isEditing ? (
            <Input
              value={currentKeys.anon_key || ''}
              onChange={(e) => updateKey('anon_key', e.target.value)}
              placeholder="eyJhbGciOi..."
            />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                {keys.anon_key 
                  ? (showValues.anon ? keys.anon_key : '••••••••••••••••••••')
                  : 'Não configurado'}
              </code>
              {keys.anon_key && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleShowValue('anon')}
                >
                  {showValues.anon ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Service Role Key */}
        <div className="space-y-2">
          <Label className="text-sm">Service Role Key</Label>
          {isEditing ? (
            <Input
              value={currentKeys.service_role_key || ''}
              onChange={(e) => updateKey('service_role_key', e.target.value)}
              placeholder="eyJhbGciOi..."
            />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                {keys.service_role_key 
                  ? (showValues.service ? keys.service_role_key : '••••••••••••••••••••')
                  : 'Não configurado'}
              </code>
              {keys.service_role_key && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleShowValue('service')}
                >
                  {showValues.service ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* OpenAI Key */}
        <div className="space-y-2">
          <Label className="text-sm">OpenAI Key</Label>
          {isEditing ? (
            <Input
              value={currentKeys.openai_key || ''}
              onChange={(e) => updateKey('openai_key', e.target.value)}
              placeholder="sk-..."
            />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                {keys.openai_key 
                  ? (showValues.openai ? keys.openai_key : '••••••••••••••••••••')
                  : 'Não configurado'}
              </code>
              {keys.openai_key && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleShowValue('openai')}
                >
                  {showValues.openai ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stripe Key */}
        <div className="space-y-2">
          <Label className="text-sm">Stripe Key</Label>
          {isEditing ? (
            <Input
              value={currentKeys.stripe_key || ''}
              onChange={(e) => updateKey('stripe_key', e.target.value)}
              placeholder="sk_live_..."
            />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                {keys.stripe_key 
                  ? (showValues.stripe ? keys.stripe_key : '••••••••••••••••••••')
                  : 'Não configurado'}
              </code>
              {keys.stripe_key && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleShowValue('stripe')}
                >
                  {showValues.stripe ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Resend Key */}
        <div className="space-y-2">
          <Label className="text-sm">Resend Key</Label>
          {isEditing ? (
            <Input
              value={currentKeys.resend_key || ''}
              onChange={(e) => updateKey('resend_key', e.target.value)}
              placeholder="re_..."
            />
          ) : (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                {keys.resend_key 
                  ? (showValues.resend ? keys.resend_key : '••••••••••••••••••••')
                  : 'Não configurado'}
              </code>
              {keys.resend_key && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleShowValue('resend')}
                >
                  {showValues.resend ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Custom Keys */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Keys Personalizadas
            </span>
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCustomKey}
                className="h-6 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            )}
          </Label>
          
          {currentKeys.custom_keys?.length === 0 && !isEditing && (
            <p className="text-xs text-muted-foreground">Nenhuma key personalizada</p>
          )}
          
          {currentKeys.custom_keys?.map((customKey, index) => (
            <div key={index} className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Input
                    value={customKey.name}
                    onChange={(e) => updateCustomKey(index, 'name', e.target.value)}
                    placeholder="Nome da key"
                    className="flex-1"
                  />
                  <Input
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
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <div className="flex-1 flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                  <span className="text-sm font-medium">{customKey.name}:</span>
                  <code className="flex-1 text-xs truncate">
                    {showValues[`custom-${index}`] ? customKey.value : '••••••••••••'}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleShowValue(`custom-${index}`)}
                  >
                    {showValues[`custom-${index}`] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm">Notas</Label>
          {isEditing ? (
            <Textarea
              value={currentKeys.notes || ''}
              onChange={(e) => updateKey('notes', e.target.value)}
              placeholder="Anotações sobre as keys..."
              rows={2}
            />
          ) : (
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md min-h-[60px]">
              {keys.notes || 'Sem notas'}
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t">
        {isEditing ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={cancelEditing}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              size="sm"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Keys
            </Button>
          </>
        ) : (
          <>
            {hasAnyKeys && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remover Todas
              </Button>
            )}
            <Button
              type="button"
              onClick={startEditing}
              size="sm"
              className={!hasAnyKeys ? 'w-full' : ''}
            >
              <Key className="w-4 h-4 mr-2" />
              {hasAnyKeys ? 'Editar Keys' : 'Adicionar Keys'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
