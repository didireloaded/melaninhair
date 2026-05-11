-- These are trigger-only functions; revoke direct API execute from anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.notify_booking_created() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify_booking_status_changed() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;