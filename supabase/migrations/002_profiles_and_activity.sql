-- Actualizar tabla profiles con nuevos camposssssssssssssssssssss
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text CHECK (char_length(bio) <= 160),
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('es', 'en'));

-- Crear índice para búsqueda por username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Crear tabla activity_feed
CREATE TABLE IF NOT EXISTS public.activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('ticket_used')),
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_venue_id ON public.activity_feed(venue_id);

-- Evitar duplicados del mismo día (mismo user, venue, fecha)
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_feed_unique_daily 
ON public.activity_feed(user_id, venue_id, date(created_at AT TIME ZONE 'UTC'));

-- Enable RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Policies para activity_feed
-- Lectura pública (todos pueden ver el feed)
DROP POLICY IF EXISTS "feed readable" ON public.activity_feed;
CREATE POLICY "feed readable" 
ON public.activity_feed
FOR SELECT 
USING (true);

-- Inserción solo del propio user
DROP POLICY IF EXISTS "insert own feed" ON public.activity_feed;
CREATE POLICY "insert own feed" 
ON public.activity_feed
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policies para profiles actualizadas
-- Lectura pública de perfiles
DROP POLICY IF EXISTS "profiles readable" ON public.profiles;
CREATE POLICY "profiles readable" 
ON public.profiles
FOR SELECT 
USING (true);

-- Actualización solo del propio perfil
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
CREATE POLICY "update own profile" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Vista para el feed con joins
CREATE OR REPLACE VIEW public.activity_feed_view AS
SELECT 
  af.id,
  af.user_id,
  af.venue_id,
  af.type,
  af.created_at,
  p.username,
  p.avatar_url,
  v.name as venue_name,
  v.lat,
  v.lng
FROM public.activity_feed af
LEFT JOIN public.profiles p ON af.user_id = p.id
LEFT JOIN public.venues v ON af.venue_id = v.id
ORDER BY af.created_at DESC;

-- Grant permisos
GRANT SELECT ON public.activity_feed_view TO anon, authenticated;
