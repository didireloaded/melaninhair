-- Update notification trigger to link customer to the booking status page
CREATE OR REPLACE FUNCTION public.notify_booking_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_record RECORD;
  pretty_date text;
BEGIN
  pretty_date := to_char(NEW.booking_date, 'Dy, Mon DD') || ' · ' || NEW.booking_time;

  INSERT INTO public.notifications (user_id, title, body, link, kind, booking_id)
  VALUES (
    NEW.user_id,
    'Booking received',
    NEW.style_title || ' — ' || pretty_date || '. We''ll confirm shortly.',
    '/booking/' || NEW.id,
    'booking',
    NEW.id
  );

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
$function$;

-- Notify customer when booking status changes (e.g. confirmed, cancelled)
CREATE OR REPLACE FUNCTION public.notify_booking_status_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  pretty_date text;
  title text;
  body text;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  pretty_date := to_char(NEW.booking_date, 'Dy, Mon DD') || ' · ' || NEW.booking_time;

  IF NEW.status = 'confirmed' THEN
    title := 'Booking confirmed ✨';
    body := 'Hermine confirmed ' || NEW.style_title || ' for ' || pretty_date || '.';
  ELSIF NEW.status = 'cancelled' THEN
    title := 'Booking cancelled';
    body := 'Your ' || NEW.style_title || ' booking was cancelled.';
  ELSIF NEW.status = 'completed' THEN
    title := 'Hope you loved it';
    body := 'Your ' || NEW.style_title || ' session is complete.';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, title, body, link, kind, booking_id)
  VALUES (NEW.user_id, title, body, '/booking/' || NEW.id, 'booking', NEW.id);

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS booking_status_changed ON public.bookings;
CREATE TRIGGER booking_status_changed
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_status_changed();

-- Make sure bookings updates stream over realtime so the status page can react live
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;