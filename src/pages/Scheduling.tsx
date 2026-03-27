import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBookingPage, useMeetingTypes, useAvailabilitySlots } from '@/hooks/useBooking';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar, Clock, Settings2, Copy, ExternalLink, Plus, Trash2, Loader2, Video, Phone, MapPin, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function SchedulingContent() {
  const { user } = useAuth();
  const { bookingPage, isLoading, upsert } = useBookingPage();
  const { meetingTypes, create: createMeeting, update: updateMeeting, remove: removeMeeting } = useMeetingTypes(bookingPage?.id);
  const { slots, upsertSlots } = useAvailabilitySlots(bookingPage?.id);

  // Config state
  const [slug, setSlug] = useState('');
  const [minAdvance, setMinAdvance] = useState('24');
  const [maxDays, setMaxDays] = useState('60');
  const [pipeline, setPipeline] = useState('none');
  const [welcomeMsg, setWelcomeMsg] = useState('Olá! Escolha o melhor horário para nossa conversa.');
  const [confirmMsg, setConfirmMsg] = useState('Reunião confirmada! Você receberá um e-mail com os detalhes.');
  const [autoLead, setAutoLead] = useState(true);
  const [redirectBooking, setRedirectBooking] = useState(false);

  // Meeting type form
  const [newMeetingName, setNewMeetingName] = useState('');
  const [newMeetingDuration, setNewMeetingDuration] = useState('30');
  const [newMeetingColor, setNewMeetingColor] = useState('#ef4444');
  const [newMeetingLocation, setNewMeetingLocation] = useState('Google Meet');

  // Availability state
  const [availSlots, setAvailSlots] = useState<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }[]>([]);

  useEffect(() => {
    if (bookingPage) {
      setSlug(bookingPage.slug || '');
      setMinAdvance(String(bookingPage.min_advance_hours || 24));
      setMaxDays(String(bookingPage.max_future_days || 60));
      setPipeline(bookingPage.pipeline_id || 'none');
      setWelcomeMsg(bookingPage.welcome_message || '');
      setConfirmMsg(bookingPage.confirmation_message || '');
      setAutoLead(bookingPage.auto_create_lead ?? true);
      setRedirectBooking(bookingPage.redirect_to_booking ?? false);
    } else if (!isLoading && user) {
      // Default slug from email
      const defaultSlug = user.email?.split('@')[0]?.replace(/[^a-z0-9]/gi, '') || 'meu-agendamento';
      setSlug(defaultSlug);
    }
  }, [bookingPage, isLoading, user]);

  useEffect(() => {
    if (slots.length > 0) {
      setAvailSlots(slots.map(s => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
        is_active: s.is_active,
      })));
    } else if (!isLoading) {
      // Default: Mon-Fri 9-17
      setAvailSlots([1, 2, 3, 4, 5].map(d => ({ day_of_week: d, start_time: '09:00', end_time: '17:00', is_active: true })));
    }
  }, [slots, isLoading]);

  const handleSaveConfig = () => {
    upsert.mutate({
      slug,
      min_advance_hours: parseInt(minAdvance) || 24,
      max_future_days: parseInt(maxDays) || 60,
      pipeline_id: pipeline === 'none' ? null : pipeline,
      welcome_message: welcomeMsg,
      confirmation_message: confirmMsg,
      auto_create_lead: autoLead,
      redirect_to_booking: redirectBooking,
    });
  };

  const handleAddMeetingType = () => {
    if (!newMeetingName.trim()) return toast.error('Digite o nome da reunião');
    if (!bookingPage?.id) return toast.error('Salve as configurações primeiro');
    createMeeting.mutate({
      name: newMeetingName,
      duration_minutes: parseInt(newMeetingDuration) || 30,
      color: newMeetingColor,
      location: newMeetingLocation,
    });
    setNewMeetingName('');
  };

  const handleSaveAvailability = () => {
    if (!bookingPage?.id) return toast.error('Salve as configurações primeiro');
    upsertSlots.mutate(availSlots);
  };

  const toggleDay = (dayIndex: number) => {
    setAvailSlots(prev => {
      const existing = prev.find(s => s.day_of_week === dayIndex);
      if (existing) {
        return prev.map(s => s.day_of_week === dayIndex ? { ...s, is_active: !s.is_active } : s);
      }
      return [...prev, { day_of_week: dayIndex, start_time: '09:00', end_time: '17:00', is_active: true }];
    });
  };

  const updateSlotTime = (dayIndex: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailSlots(prev => prev.map(s => s.day_of_week === dayIndex ? { ...s, [field]: value } : s));
  };

  const bookingUrl = `${window.location.origin}/agendar/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast.success('Link copiado!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Agendamento Online</h1>
              <p className="text-sm text-muted-foreground">Configure sua página de agendamento estilo Calendly</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
              <Copy className="w-4 h-4" /> Copiar Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(bookingUrl, '_blank')} className="gap-2">
              <ExternalLink className="w-4 h-4" /> Visualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="w-full justify-start bg-card border border-border rounded-xl p-1">
          <TabsTrigger value="config" className="gap-2 rounded-lg"><Settings2 className="w-4 h-4" /> Configurações</TabsTrigger>
          <TabsTrigger value="meetings" className="gap-2 rounded-lg"><Video className="w-4 h-4" /> Tipos de Reunião</TabsTrigger>
          <TabsTrigger value="availability" className="gap-2 rounded-lg"><Clock className="w-4 h-4" /> Disponibilidade</TabsTrigger>
        </TabsList>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Slug da página *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground italic">/agendar/</span>
                  <Input value={slug} onChange={e => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())} placeholder="seu-nome" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Antecedência mínima (horas)</Label>
                <Input type="number" value={minAdvance} onChange={e => setMinAdvance(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Máximo de dias no futuro</Label>
                <Input type="number" value={maxDays} onChange={e => setMaxDays(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Pipeline para novos leads</Label>
                <Select value={pipeline} onValueChange={setPipeline}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (padrão)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mensagem de boas-vindas</Label>
              <Textarea value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mensagem de confirmação</Label>
              <Textarea value={confirmMsg} onChange={e => setConfirmMsg(e.target.value)} rows={3} />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium">Criar lead automaticamente</p>
                  <p className="text-xs text-muted-foreground">Quando alguém agendar, criar um novo lead com os dados</p>
                </div>
                <Switch checked={autoLead} onCheckedChange={setAutoLead} />
              </div>
              <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium">Redirecionar formulários para agendamento</p>
                  <p className="text-xs text-muted-foreground">Após preencher um formulário, o visitante será redirecionado para agendar uma reunião</p>
                </div>
                <Switch checked={redirectBooking} onCheckedChange={setRedirectBooking} />
              </div>
            </div>

            <Button onClick={handleSaveConfig} disabled={upsert.isPending} className="bg-primary hover:bg-primary/90">
              {upsert.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>

        {/* Meeting Types Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Tipos de Reunião</h3>

            {/* Existing meeting types */}
            <div className="space-y-3">
              {meetingTypes.map((mt: any) => (
                <div key={mt.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mt.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{mt.name}</p>
                    <p className="text-xs text-muted-foreground">{mt.duration_minutes} min • {mt.location}</p>
                  </div>
                  <Switch
                    checked={mt.is_active}
                    onCheckedChange={(v) => updateMeeting.mutate({ id: mt.id, is_active: v })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeMeeting.mutate(mt.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Adicionar novo tipo</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Nome (ex: Reunião de 30min)" value={newMeetingName} onChange={e => setNewMeetingName(e.target.value)} />
                <Select value={newMeetingDuration} onValueChange={setNewMeetingDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newMeetingLocation} onValueChange={setNewMeetingLocation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Cor:</Label>
                  <input type="color" value={newMeetingColor} onChange={e => setNewMeetingColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                </div>
              </div>
              <Button onClick={handleAddMeetingType} disabled={createMeeting.isPending} className="gap-2">
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-foreground">Horários Disponíveis</h3>
            <p className="text-sm text-muted-foreground">Defina os horários em que você está disponível para reuniões</p>

            <div className="space-y-3">
              {DAY_NAMES.map((dayName, i) => {
                const slot = availSlots.find(s => s.day_of_week === i);
                const isActive = slot?.is_active ?? false;
                return (
                  <div key={i} className="flex items-center gap-4 bg-muted/30 rounded-xl p-4">
                    <Switch checked={isActive} onCheckedChange={() => toggleDay(i)} />
                    <span className={cn('w-24 text-sm font-medium', !isActive && 'text-muted-foreground')}>{dayName}</span>
                    {isActive && slot ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={e => updateSlotTime(i, 'start_time', e.target.value)}
                          className="w-28"
                        />
                        <span className="text-sm text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={e => updateSlotTime(i, 'end_time', e.target.value)}
                          className="w-28"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Indisponível</span>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={handleSaveAvailability} disabled={upsertSlots.isPending}>
              {upsertSlots.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Disponibilidade
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Scheduling() {
  return (
    <AppLayout>
      <SchedulingContent />
    </AppLayout>
  );
}
