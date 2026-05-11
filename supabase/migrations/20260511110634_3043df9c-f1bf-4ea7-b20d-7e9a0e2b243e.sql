-- Atomic double-booking prevention. A partial unique index lets us keep
-- cancelled/completed history but blocks two active bookings on the same slot.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_slot_unique
  ON public.bookings (booking_date, booking_time)
  WHERE status IN ('pending', 'confirmed');

-- Speed up the availability range queries the booking page runs.
CREATE INDEX IF NOT EXISTS bookings_date_status_idx
  ON public.bookings (booking_date, status);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

-- Auto-complete past confirmed bookings via pg_cron (SQL-only, no endpoint).
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE existing_jobid bigint;
BEGIN
  SELECT jobid INTO existing_jobid FROM cron.job WHERE jobname = 'auto-complete-bookings';
  IF existing_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(existing_jobid);
  END IF;
END $$;

SELECT cron.schedule(
  'auto-complete-bookings',
  '0 2 * * *',
  $$
  UPDATE public.bookings
     SET status = 'completed', updated_at = now()
   WHERE status = 'confirmed'
     AND booking_date < (now() AT TIME ZONE 'Africa/Windhoek')::date;
  $$
);