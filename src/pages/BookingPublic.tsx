import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, CheckCircle2, Loader2, ArrowLeft, Video, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, addDays, isBefore, startOfDay, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const LOCATION_ICONS: Record<string, any> = {
  'Google Meet': Video,
  'Zoom': Video,
  'Presencial': MapPin,
  'Telefone': Phone,
};

export default function BookingPublic() {
  const { slug } = useParams<{ slug: string }>();
  const [bookingPage, setBookingPage] = useState<any>(null);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wizard state
  const [step, setStep] = useState<'type' | 'date' | 'form' | 'done'>('type');
  const [selectedType, setSelectedType] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: page, error: pageErr } = await supabase
        .from('booking_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      if (pageErr || !page) {
        setError('Página de agendamento não encontrada');
        setLoading(false);
        return;
      }
      setBookingPage(page);

      const [typesRes, slotsRes] = await Promise.all([
        supabase.from('meeting_types').select('*').eq('booking_page_id', page.id).eq('is_active', true).order('position'),
        supabase.from('availability_slots').select('*').eq('booking_page_id', page.id).eq('is_active', true).order('day_of_week'),
      ]);
      setMeetingTypes(typesRes.data || []);
      setAvailability(slotsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  // Generate available dates
  const availableDates = useMemo(() => {
    if (!bookingPage || availability.length === 0) return [];
    const days: Date[] = [];
    const today = startOfDay(new Date());
    const minDate = addDays(today, Math.ceil((bookingPage.min_advance_hours || 24) / 24));
    const maxDate = addDays(today, bookingPage.max_future_days || 60);
    const activeDays = new Set(availability.map((s: any) => s.day_of_week));

    let current = minDate;
    while (isBefore(current, maxDate) || current.getTime() === maxDate.getTime()) {
      if (activeDays.has(current.getDay())) {
        days.push(new Date(current));
      }
      current = addDays(current, 1);
    }
    return days;
  }, [bookingPage, availability]);

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedType) return [];
    const dayOfWeek = selectedDate.getDay();
    const daySlot = availability.find((s: any) => s.day_of_week === dayOfWeek);
    if (!daySlot) return [];

    const [startH, startM] = daySlot.start_time.split(':').map(Number);
    const [endH, endM] = daySlot.end_time.split(':').map(Number);
    const duration = selectedType.duration_minutes || 30;
    const slots: string[] = [];

    let currentMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    while (currentMin + duration <= endMin) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      currentMin += duration;
    }
    return slots;
  }, [selectedDate, selectedType, availability]);

  const handleSubmit = async () => {
    if (!guestName.trim() || !guestEmail.trim()) return toast.error('Preencha nome e email');
    if (!selectedDate || !selectedTime || !selectedType || !bookingPage) return;

    setSubmitting(true);
    const duration = selectedType.duration_minutes || 30;
    const [h, m] = selectedTime.split(':').map(Number);
    const endMin = h * 60 + m + duration;
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

    const { error } = await supabase.from('bookings').insert({
      booking_page_id: bookingPage.id,
      meeting_type_id: selectedType.id,
      owner_user_id: bookingPage.user_id,
      guest_name: guestName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim() || null,
      booking_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: selectedTime,
      end_time: endTime,
      notes: notes.trim() || null,
    } as any);

    setSubmitting(false);
    if (error) {
      toast.error('Erro ao agendar. Tente novamente.');
    } else {
      setStep('done');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-lg text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Agendamento</h1>
          {bookingPage?.welcome_message && (
            <p className="text-muted-foreground">{bookingPage.welcome_message}</p>
          )}
        </div>

        {/* Step: Select Type */}
        {step === 'type' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Escolha o tipo de reunião</h2>
            <div className="space-y-3">
              {meetingTypes.map((mt: any) => {
                const Icon = LOCATION_ICONS[mt.location] || Video;
                return (
                  <button
                    key={mt.id}
                    onClick={() => { setSelectedType(mt); setStep('date'); }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="w-3 h-10 rounded-full" style={{ backgroundColor: mt.color }} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{mt.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" /> {mt.duration_minutes} min
                        <Icon className="w-3 h-3 ml-2" /> {mt.location}
                      </p>
                    </div>
                  </button>
                );
              })}
              {meetingTypes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum tipo de reunião disponível</p>
              )}
            </div>
          </div>
        )}

        {/* Step: Select Date & Time */}
        {step === 'date' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <button onClick={() => { setStep('type'); setSelectedDate(null); setSelectedTime(''); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="font-semibold text-foreground">Escolha a data e horário</h2>
            <p className="text-sm text-muted-foreground">{selectedType?.name} • {selectedType?.duration_minutes} min</p>

            {/* Date selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {availableDates.slice(0, 28).map(d => (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setSelectedDate(d); setSelectedTime(''); }}
                    className={cn(
                      'p-2 rounded-lg border text-center text-sm transition-all',
                      selectedDate?.toISOString() === d.toISOString()
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="text-xs text-muted-foreground">{format(d, 'EEE', { locale: ptBR })}</div>
                    <div className="font-medium">{format(d, 'd MMM', { locale: ptBR })}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time selector */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Horário</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {timeSlots.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={cn(
                        'p-2 rounded-lg border text-sm font-medium transition-all',
                        selectedTime === t
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTime && (
              <Button className="w-full" onClick={() => setStep('form')}>
                Continuar
              </Button>
            )}
          </div>
        )}

        {/* Step: Guest form */}
        {step === 'form' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <button onClick={() => setStep('date')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="font-semibold text-foreground">Seus dados</h2>
            <p className="text-sm text-muted-foreground">
              {selectedType?.name} • {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Nome *</Label>
                <Input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Seu nome completo" />
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-1">
                <Label>Observações</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Algo que devemos saber?" rows={3} />
              </div>
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar Agendamento
            </Button>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Agendamento Confirmado!</h2>
            <p className="text-muted-foreground">{bookingPage?.confirmation_message}</p>
            <div className="bg-muted/30 rounded-xl p-4 space-y-1 text-sm">
              <p><strong>Reunião:</strong> {selectedType?.name}</p>
              <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              <p><strong>Horário:</strong> {selectedTime}</p>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Powered by <span className="font-semibold text-primary">Central Flow</span>
        </p>
      </div>
    </div>
  );
}
