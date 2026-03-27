
-- Booking pages config
CREATE TABLE public.booking_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  min_advance_hours INTEGER NOT NULL DEFAULT 24,
  max_future_days INTEGER NOT NULL DEFAULT 60,
  pipeline_id TEXT DEFAULT NULL,
  welcome_message TEXT DEFAULT 'Olá! Escolha o melhor horário para nossa conversa.',
  confirmation_message TEXT DEFAULT 'Reunião confirmada! Você receberá um e-mail com os detalhes.',
  auto_create_lead BOOLEAN NOT NULL DEFAULT true,
  redirect_to_booking BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(slug)
);

-- Meeting types
CREATE TABLE public.meeting_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_page_id UUID NOT NULL REFERENCES public.booking_pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  color TEXT NOT NULL DEFAULT '#ef4444',
  description TEXT,
  location TEXT DEFAULT 'Google Meet',
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Availability slots
CREATE TABLE public.availability_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_page_id UUID NOT NULL REFERENCES public.booking_pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '17:00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings (public-facing)
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_page_id UUID NOT NULL REFERENCES public.booking_pages(id) ON DELETE CASCADE,
  meeting_type_id UUID NOT NULL REFERENCES public.meeting_types(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.booking_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Booking pages: owner only
CREATE POLICY "Users manage own booking pages" ON public.booking_pages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Meeting types: owner only
CREATE POLICY "Users manage own meeting types" ON public.meeting_types FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Availability: owner only
CREATE POLICY "Users manage own availability" ON public.availability_slots FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Bookings: owner can see their bookings
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL TO authenticated USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());

-- Public: anyone can read active booking pages by slug
CREATE POLICY "Public can read active booking pages" ON public.booking_pages FOR SELECT TO anon USING (is_active = true);
-- Public: anyone can read meeting types for active pages
CREATE POLICY "Public can read meeting types" ON public.meeting_types FOR SELECT TO anon USING (is_active = true);
-- Public: anyone can read availability
CREATE POLICY "Public can read availability" ON public.availability_slots FOR SELECT TO anon USING (is_active = true);
-- Public: anyone can insert bookings
CREATE POLICY "Public can create bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);

-- Updated at triggers
CREATE TRIGGER update_booking_pages_updated_at BEFORE UPDATE ON public.booking_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meeting_types_updated_at BEFORE UPDATE ON public.meeting_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
