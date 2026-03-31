import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBookingPage, useMeetingTypes, useAvailabilitySlots, useBookings } from '@/hooks/useBooking';
import { useLeadPipelines } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import {
  Calendar, Clock, Settings2, Copy, ExternalLink, Plus, Trash2, Loader2, Video, Phone, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

interface SlotEntry {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

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

  // Meeting type modal
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [newMeetingDuration, setNewMeetingDuration] = useState('30');
  const [newMeetingColor, setNewMeetingColor] = useState('#ef4444');
  const [newMeetingLocation, setNewMeetingLocation] = useState('Google Meet');
  const [newMeetingDescription, setNewMeetingDescription] = useState('');

  // Availability state - multiple intervals per day
  const [availSlots, setAvailSlots] = useState<SlotEntry[]>([]);

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
    }
  }, [slots]);

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
      description: newMeetingDescription || undefined,
    });
    setNewMeetingName('');
    setNewMeetingDescription('');
    setShowNewMeeting(false);
  };

  const handleSaveAvailability = () => {
    if (!bookingPage?.id) return toast.error('Salve as configurações primeiro');
    upsertSlots.mutate(availSlots.filter(s => s.is_active));
  };

  const addSlotToDay = (dayIndex: number) => {
    setAvailSlots(prev => [...prev, { day_of_week: dayIndex, start_time: '09:00', end_time: '17:00', is_active: true }]);
  };

  const removeSlot = (dayIndex: number, slotIdx: number) => {
    const daySlots = availSlots.filter(s => s.day_of_week === dayIndex);
    const target = daySlots[slotIdx];
    if (!target) return;
    // Find the actual index in the full array
    let count = 0;
    const actualIdx = availSlots.findIndex(s => {
      if (s.day_of_week === dayIndex) {
        if (count === slotIdx) return true;
        count++;
      }
      return false;
    });
    if (actualIdx >= 0) {
      setAvailSlots(prev => prev.filter((_, i) => i !== actualIdx));
    }
  };

  const updateSlotTime = (dayIndex: number, slotIdx: number, field: 'start_time' | 'end_time', value: string) => {
    let count = 0;
    setAvailSlots(prev => prev.map((s, i) => {
      if (s.day_of_week === dayIndex) {
        if (count === slotIdx) {
          count++;
          return { ...s, [field]: value };
        }
        count++;
      }
      return s;
    }));
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      {/* Header + Tabs unified */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Agendamento Online</h1>
                <p className="text-xs text-muted-foreground">Configure sua página de agendamento estilo Calendly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLink} className="gap-2 text-xs">
                <Copy className="w-3.5 h-3.5" /> Copiar Link
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open(bookingUrl, '_blank')} className="gap-2 text-xs">
                <ExternalLink className="w-3.5 h-3.5" /> Visualizar
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="config">
          <div className="px-6">
            <TabsList className="w-full justify-start bg-muted/50 rounded-xl p-1">
              <TabsTrigger value="config" className="gap-2 rounded-lg flex-1 text-xs"><Settings2 className="w-3.5 h-3.5" /> Configurações</TabsTrigger>
              <TabsTrigger value="meetings" className="gap-2 rounded-lg flex-1 text-xs"><Video className="w-3.5 h-3.5" /> Tipos de Reunião</TabsTrigger>
              <TabsTrigger value="availability" className="gap-2 rounded-lg flex-1 text-xs"><Calendar className="w-3.5 h-3.5" /> Disponibilidade</TabsTrigger>
            </TabsList>
          </div>

          {/* Config Tab */}
          <TabsContent value="config" className="p-6 pt-4 space-y-5">
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

            <div className="space-y-3 pt-2">
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
          </TabsContent>

          {/* Meeting Types Tab */}
          <TabsContent value="meetings" className="p-6 pt-4 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Configure os tipos de reunião que seus clientes podem agendar</p>
              <Button onClick={() => setShowNewMeeting(true)} className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Novo Tipo
              </Button>
            </div>

            {meetingTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Video className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhum tipo de reunião configurado</p>
                <p className="text-sm text-muted-foreground/70">Crie seu primeiro tipo para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetingTypes.map((mt: any) => (
                  <div key={mt.id} className="flex items-center gap-4 border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors">
                    <div className="w-1 h-10 rounded-full" style={{ backgroundColor: mt.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{mt.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mt.duration_minutes} min</span>
                        <span className="flex items-center gap-1">
                          {mt.location === 'Google Meet' || mt.location === 'Zoom' ? <Video className="w-3 h-3" /> : mt.location === 'Telefone' ? <Phone className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                          {mt.location}
                        </span>
                      </p>
                    </div>
                    <Switch
                      checked={mt.is_active}
                      onCheckedChange={(v) => updateMeeting.mutate({ id: mt.id, is_active: v })}
                    />
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeMeeting.mutate(mt.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="p-6 pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure os dias e horários em que você está disponível. Você pode adicionar múltiplos intervalos por dia.
            </p>

            <div className="space-y-3">
              {DAY_NAMES.map((dayName, i) => {
                const daySlots = availSlots.filter(s => s.day_of_week === i && s.is_active);
                return (
                  <div key={i} className="border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <span className="text-sm font-semibold text-foreground">{dayName}</span>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => addSlotToDay(i)}>
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </Button>
                    </div>

                    {daySlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground pl-4">Nenhum horário configurado para este dia</p>
                    ) : (
                      <div className="space-y-2 pl-4">
                        {daySlots.map((slot, slotIdx) => (
                          <div key={slotIdx} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={slot.start_time}
                              onChange={e => updateSlotTime(i, slotIdx, 'start_time', e.target.value)}
                              className="w-28 text-sm"
                            />
                            <span className="text-xs text-muted-foreground">até</span>
                            <Input
                              type="time"
                              value={slot.end_time}
                              onChange={e => updateSlotTime(i, slotIdx, 'end_time', e.target.value)}
                              className="w-28 text-sm"
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeSlot(i, slotIdx)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={handleSaveAvailability} disabled={upsertSlots.isPending} className="bg-primary hover:bg-primary/90">
              {upsertSlots.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar Disponibilidade
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Meeting Type Modal */}
      <Dialog open={showNewMeeting} onOpenChange={setShowNewMeeting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Tipo de Reunião</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input placeholder="Ex: Reunião de 30min" value={newMeetingName} onChange={e => setNewMeetingName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Duração</Label>
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
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Select value={newMeetingLocation} onValueChange={setNewMeetingLocation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google Meet">Google Meet</SelectItem>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea placeholder="Descreva o tipo de reunião..." value={newMeetingDescription} onChange={e => setNewMeetingDescription(e.target.value)} rows={2} />
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Cor:</Label>
              <input type="color" value={newMeetingColor} onChange={e => setNewMeetingColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowNewMeeting(false)}>Cancelar</Button>
              <Button onClick={handleAddMeetingType} disabled={createMeeting.isPending} className="gap-2">
                {createMeeting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Criar Tipo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
