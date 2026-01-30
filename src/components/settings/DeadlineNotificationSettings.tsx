import { useState, useEffect } from 'react';
import { useDeadlineSettings } from '@/hooks/useDeadlineSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Save, Loader2 } from 'lucide-react';

export function DeadlineNotificationSettings() {
  const { settings, isLoading, upsertSettings } = useDeadlineSettings();
  
  const [daysBefore, setDaysBefore] = useState(2);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notifyOwner, setNotifyOwner] = useState(true);
  const [notifyCollaborators, setNotifyCollaborators] = useState(true);

  useEffect(() => {
    if (settings) {
      setDaysBefore(settings.days_before);
      setMessageTemplate(settings.message_template);
      setIsActive(settings.is_active);
      setNotifyOwner(settings.notify_owner);
      setNotifyCollaborators(settings.notify_collaborators);
    }
  }, [settings]);

  const handleSave = () => {
    upsertSettings.mutate({
      days_before: daysBefore,
      message_template: messageTemplate,
      is_active: isActive,
      notify_owner: notifyOwner,
      notify_collaborators: notifyCollaborators,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações de Prazo
        </CardTitle>
        <CardDescription>
          Configure lembretes automáticos para projetos com prazos próximos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Ativar notificações</Label>
            <p className="text-sm text-muted-foreground">
              Receber lembretes automáticos de prazos
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="space-y-2">
          <Label>Dias antes do prazo</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={daysBefore}
            onChange={(e) => setDaysBefore(parseInt(e.target.value) || 2)}
            className="w-24"
          />
          <p className="text-sm text-muted-foreground">
            Quantos dias antes do prazo enviar a notificação
          </p>
        </div>

        <div className="space-y-2">
          <Label>Mensagem do lembrete</Label>
          <Textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows={3}
            placeholder="O projeto tem prazo em breve..."
          />
          <p className="text-xs text-muted-foreground">
            Variáveis disponíveis: {"{{project_name}}"}, {"{{days}}"}, {"{{deadline_date}}"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar proprietário</Label>
              <p className="text-sm text-muted-foreground">
                O dono do projeto recebe notificação
              </p>
            </div>
            <Switch
              checked={notifyOwner}
              onCheckedChange={setNotifyOwner}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar colaboradores</Label>
              <p className="text-sm text-muted-foreground">
                Colaboradores do projeto também recebem
              </p>
            </div>
            <Switch
              checked={notifyCollaborators}
              onCheckedChange={setNotifyCollaborators}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={upsertSettings.isPending}
          className="w-full"
        >
          {upsertSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
}
