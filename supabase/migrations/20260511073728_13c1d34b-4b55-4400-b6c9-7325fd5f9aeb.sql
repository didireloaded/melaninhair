
-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','cancelled','completed');
CREATE TYPE public.media_type AS ENUM ('image','video');

-- ===== Profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== User roles =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ===== Styles =====
CREATE TABLE public.styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_cents INTEGER,
  duration_minutes INTEGER,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;

-- ===== Gallery =====
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT NOT NULL,
  media_type media_type NOT NULL DEFAULT 'image',
  caption TEXT,
  instagram_id TEXT,
  instagram_permalink TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- ===== Favorites =====
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID REFERENCES public.styles(id) ON DELETE CASCADE,
  gallery_item_id UUID REFERENCES public.gallery_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((style_id IS NOT NULL)::int + (gallery_item_id IS NOT NULL)::int = 1)
);
CREATE UNIQUE INDEX favorites_user_style_uniq ON public.favorites(user_id, style_id) WHERE style_id IS NOT NULL;
CREATE UNIQUE INDEX favorites_user_gallery_uniq ON public.favorites(user_id, gallery_item_id) WHERE gallery_item_id IS NOT NULL;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ===== Bookings =====
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID REFERENCES public.styles(id) ON DELETE SET NULL,
  style_title TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  notes TEXT,
  inspiration_url TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  price_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ===== Availability blocks =====
CREATE TABLE public.availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  blocked_time TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

-- ===== updated_at trigger =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER styles_set_updated_at BEFORE UPDATE ON public.styles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== RLS policies =====
-- profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_roles
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- styles
CREATE POLICY "styles_public_select" ON public.styles FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "styles_admin_all" ON public.styles FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- gallery
CREATE POLICY "gallery_public_select" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "gallery_admin_all" ON public.gallery_items FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- favorites
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- bookings
CREATE POLICY "bookings_select_own_or_admin" ON public.bookings FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "bookings_insert_own" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_admin_update" ON public.bookings FOR UPDATE
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- availability
CREATE POLICY "availability_public_select" ON public.availability_blocks FOR SELECT USING (true);
CREATE POLICY "availability_admin_all" ON public.availability_blocks FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== Storage buckets =====
INSERT INTO storage.buckets (id, name, public) VALUES ('style-media','style-media', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-media','gallery-media', true) ON CONFLICT DO NOTHING;

CREATE POLICY "style_media_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'style-media');
CREATE POLICY "style_media_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'style-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "style_media_admin_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'style-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "style_media_admin_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'style-media' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "gallery_media_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-media');
CREATE POLICY "gallery_media_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "gallery_media_admin_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "gallery_media_admin_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-media' AND public.has_role(auth.uid(),'admin'));
