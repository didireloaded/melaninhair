-- 1. Booking contact fields
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

-- 2. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  kind text NOT NULL DEFAULT 'system',
  read boolean NOT NULL DEFAULT false,
  booking_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx
  ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own_or_admin"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_admin_all"
  ON public.notifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Trigger: notify customer + admins when a booking is created
CREATE OR REPLACE FUNCTION public.notify_booking_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
  pretty_date text;
BEGIN
  pretty_date := to_char(NEW.booking_date, 'Dy, Mon DD') || ' · ' || NEW.booking_time;

  -- Customer
  INSERT INTO public.notifications (user_id, title, body, link, kind, booking_id)
  VALUES (
    NEW.user_id,
    'Booking received',
    NEW.style_title || ' — ' || pretty_date || '. We''ll confirm shortly.',
    '/profile',
    'booking',
    NEW.id
  );

  -- Admins
  FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, title, body, link, kind, booking_id)
    VALUES (
      admin_record.user_id,
      'New booking request',
      COALESCE(NEW.contact_name, 'A guest') || ' booked ' || NEW.style_title || ' — ' || pretty_date,
      '/admin',
      'booking',
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_booking_created ON public.bookings;
CREATE TRIGGER trg_notify_booking_created
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_booking_created();

-- 4. Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;