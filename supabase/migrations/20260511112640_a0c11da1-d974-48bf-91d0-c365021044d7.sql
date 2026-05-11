
-- 1. Restrict notifications UPDATE: only allow toggling read; freeze other fields
DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND booking_id IS NOT DISTINCT FROM (SELECT booking_id FROM public.notifications n WHERE n.id = notifications.id)
    AND kind       IS NOT DISTINCT FROM (SELECT kind       FROM public.notifications n WHERE n.id = notifications.id)
    AND title      IS NOT DISTINCT FROM (SELECT title      FROM public.notifications n WHERE n.id = notifications.id)
    AND body       IS NOT DISTINCT FROM (SELECT body       FROM public.notifications n WHERE n.id = notifications.id)
    AND link       IS NOT DISTINCT FROM (SELECT link       FROM public.notifications n WHERE n.id = notifications.id)
    AND user_id    IS NOT DISTINCT FROM (SELECT user_id    FROM public.notifications n WHERE n.id = notifications.id)
    AND created_at IS NOT DISTINCT FROM (SELECT created_at FROM public.notifications n WHERE n.id = notifications.id)
  );

-- 2. Revoke EXECUTE on trigger-only SECURITY DEFINER functions so they cannot be called as RPC
REVOKE ALL ON FUNCTION public.notify_booking_created()         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_booking_status_changed()  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user()                FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at()                 FROM PUBLIC, anon, authenticated;

-- has_role is intentionally callable (used in RLS); keep EXECUTE for anon + authenticated.

-- 3. Realtime channel authorization: lock down realtime.messages so users
-- can only subscribe to their own per-user channels (e.g. "user:<uid>").
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_channel_read"  ON realtime.messages;
DROP POLICY IF EXISTS "users_own_channel_write" ON realtime.messages;

CREATE POLICY "users_own_channel_read" ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.topic() = 'user:' || auth.uid()::text
  );

CREATE POLICY "users_own_channel_write" ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() = 'user:' || auth.uid()::text
  );
