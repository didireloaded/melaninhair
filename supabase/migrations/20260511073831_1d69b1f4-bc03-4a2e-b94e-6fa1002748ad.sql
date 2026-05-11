
-- Drop broad listing policies; public buckets still serve files via direct public URLs
DROP POLICY IF EXISTS "style_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "gallery_media_public_read" ON storage.objects;

-- Revoke API exposure of internal helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
