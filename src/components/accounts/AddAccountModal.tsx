import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAccount } from '@/hooks/useProjects';
import { saveAccountLocalKeys, AccountLocalKeys } from '@/hooks/useLocalKeys';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Coins, Key, Globe, User, Mail, FileText, HardDrive, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colors = [
  { id: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { id: 'emerald', label: 'Verde', class: 'bg-emerald-500' },
  { id: 'amber', label: 'Amarelo', class: 'bg-amber-500' },
  { id: 'rose', label: 'Rosa', class: 'bg-rose-500' },
  { id: 'violet', label: 'Violeta', class: 'bg-violet-500' },
] as const;

interface CustomKey {
  name: string;
  value: string;
}

export function AddAccountModal({ open, onOpenChange }: AddAccountModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [credits, setCredits] = useState('');
  const [supabaseProjectId, setSupabaseProjectId] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [customKeys, setCustomKeys] = useState<CustomKey[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState<'blue' | 'emerald' | 'amber' | 'rose' | 'violet'>('blue');
  
  const createAccount = useCreateAccount();
  const { toast } = useToast();

  const addCustomKey = () => {
    setCustomKeys([...customKeys, { name: '', value: '' }]);
  };

  const removeCustomKey = (index: number) => {
    setCustomKeys(customKeys.filter((_, i) => i !== index));
  };

  const updateCustomKey = (index: number, field: 'name' | 'value', value: string) => {
    const updated = [...customKeys];
    updated[index][field] = value;
    setCustomKeys(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e email da conta.',
        variant: 'destructive',
      });
      return;
    }

    const creditsValue = credits.trim() ? parseInt(credits, 10) : 0;
    if (isNaN(creditsValue) || creditsValue < 0) {
      toast({
        title: 'Créditos inválidos',
        description: 'Digite um número válido para os créditos.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Criar conta no banco SEM as keys (elas vão para localStorage)
      const newAccount = await createAccount.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        admin_email: adminEmail.trim() || null,
        color: selectedColor,
        credits: creditsValue,
        supabase_project_id: supabaseProjectId.trim() || null,
        supabase_url: null, // Não salvar no banco, vai para localStorage
        anon_key: null,
        service_role_key: null,
        notes: notes.trim() || null,
      });

      // Salvar keys localmente se fornecidas
      if (newAccount) {
        const localKeys: AccountLocalKeys = {};
        if (supabaseUrl.trim()) localKeys.supabase_url = supabaseUrl.trim();
        if (anonKey.trim()) localKeys.anon_key = anonKey.trim();
        if (serviceRoleKey.trim()) localKeys.service_role_key = serviceRoleKey.trim();
        if (openaiKey.trim()) localKeys.openai_key = openaiKey.trim();
        
        const validCustomKeys = customKeys.filter(k => k.name.trim() && k.value.trim());
        if (validCustomKeys.length > 0) {
          localKeys.custom_keys = validCustomKeys;
        }
        
        if (Object.keys(localKeys).length > 0) {
          saveAccountLocalKeys(newAccount.id, localKeys);
        }
      }
      
      toast({
        title: 'Conta adicionada!',
        description: `A conta "${name}" foi adicionada com sucesso.`,
      });
      
      // Reset form
      setName('');
      setEmail('');
      setAdminEmail('');
      setCredits('');
      setSupabaseProjectId('');
      setSupabaseUrl('');
      setAnonKey('');
      setServiceRoleKey('');
      setOpenaiKey('');
      setCustomKeys([]);
      setNotes('');
      setSelectedColor('blue');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar conta',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle>Adicionar Conta Lovable</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta Lovable com informações do projeto Supabase.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 px-6 max-h-[calc(85vh-180px)]">
            <div className="space-y-4 py-4">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome da conta *
                  </Label>
                  <Input
                    id="account-name"
                    placeholder="Ex: Projetos Pessoais"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email de cadastro Lovable *
                  </Label>
                  <Input
                    id="account-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email de administrador
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-credits" className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Créditos disponíveis
                  </Label>
                  <Input
                    id="account-credits"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Cor de identificação</Label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all duration-200',
                          color.class,
                          selectedColor === color.id 
                            ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                            : 'hover:scale-105'
                        )}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Configurações Supabase (Accordion) */}
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="supabase" className="border rounded-lg px-3">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Configurações Supabase (opcional)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <Label htmlFor="supabase-project-id">Project ID</Label>
                      <Input
                        id="supabase-project-id"
                        placeholder="Ex: abcdefghijklmnop"
                        value={supabaseProjectId}
                        onChange={(e) => setSupabaseProjectId(e.target.value)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="keys" className="border rounded-lg px-3 mt-2">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-primary" />
                      API Keys & Credenciais
                      <Badge variant="outline" className="ml-2 text-xs gap-1">
                        <HardDrive className="w-3 h-3" />
                        Local
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-4">
                    {/* Aviso de armazenamento local */}
                    <Alert variant="default" className="bg-amber-500/10 border-amber-500/30">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <AlertDescription className="text-xs">
                        <strong>⚠️ Importante:</strong> As keys são salvas apenas neste navegador/dispositivo 
                        (localStorage) e nunca são enviadas para o servidor. Se você limpar os dados do navegador 
                        ou usar outro dispositivo, precisará cadastrá-las novamente.
                      </AlertDescription>
                    </Alert>

                    {/* URL Supabase */}
                    <div className="space-y-2">
                      <Label htmlFor="supabase-url">URL Supabase</Label>
                      <Input
                        id="supabase-url"
                        placeholder="https://xxx.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                      />
                    </div>

                    {/* Anon Key Supabase */}
                    <div className="space-y-2">
                      <Label htmlFor="anon-key">Anon Key Supabase</Label>
                      <Input
                        id="anon-key"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
                        value={anonKey}
                        onChange={(e) => setAnonKey(e.target.value)}
                      />
                    </div>

                    {/* Service Role Key */}
                    <div className="space-y-2">
                      <Label htmlFor="service-role-key">Service Role Key Supabase</Label>
                      <Input
                        id="service-role-key"
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."
                        value={serviceRoleKey}
                        onChange={(e) => setServiceRoleKey(e.target.value)}
                      />
                    </div>

                    {/* OpenAI Key */}
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">Key OpenAI</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                      />
                    </div>

                    {/* Keys Customizadas */}
                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Keys Personalizadas</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addCustomKey}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      
                      {customKeys.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Adicione keys personalizadas como Stripe, Twilio, etc.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {customKeys.map((key, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Nome (ex: STRIPE_KEY)"
                                value={key.name}
                                onChange={(e) => updateCustomKey(index, 'name', e.target.value)}
                                className="flex-1"
                              />
                              <Input
                                type="password"
                                placeholder="Valor"
                                value={key.value}
                                onChange={(e) => updateCustomKey(index, 'value', e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCustomKey(index)}
                                className="h-10 w-10 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="notes" className="border rounded-lg px-3 mt-2">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Notas e observações (opcional)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <Textarea
                      id="notes"
                      placeholder="Adicione notas, observações ou informações adicionais sobre esta conta..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex-shrink-0 p-6 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createAccount.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Conta'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
