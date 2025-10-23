-- CREAR TABLA DE POSTS SOCIALES
-- Esta tabla almacena los mensajes que los usuarios publican en el feed social

-- 1. Tabla de posts sociales
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  city text NOT NULL, -- Nombre de la ciudad donde se publica el post
  city_lat double precision NOT NULL, -- Latitud de la ciudad
  city_lng double precision NOT NULL, -- Longitud de la ciudad
  audience text DEFAULT 'public', -- 'public' o 'friends_only'
  image_url text, -- URL de la imagen opcional
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT check_audience CHECK (audience IN ('public', 'friends_only')),
  CONSTRAINT check_content_length CHECK (char_length(content) <= 500)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_city ON public.social_posts(city);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_audience ON public.social_posts(audience);

-- Índice compuesto para filtros comunes
CREATE INDEX IF NOT EXISTS idx_social_posts_city_created ON public.social_posts(city, created_at DESC);

-- Enable RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver posts públicos de cualquier ciudad
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.social_posts;
CREATE POLICY "Anyone can view public posts"
ON public.social_posts FOR SELECT
USING (audience = 'public' OR auth.uid() = user_id);

-- Policy: Los usuarios autenticados pueden ver posts de amigos
DROP POLICY IF EXISTS "Users can view friends posts" ON public.social_posts;
CREATE POLICY "Users can view friends posts"
ON public.social_posts FOR SELECT
USING (
  audience = 'public' 
  OR auth.uid() = user_id
  OR (
    audience = 'friends_only' 
    AND EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (
        (user_id = auth.uid() AND friend_id = social_posts.user_id)
        OR (friend_id = auth.uid() AND user_id = social_posts.user_id)
      )
      AND status = 'accepted'
    )
  )
);

-- Policy: Los usuarios pueden crear sus propios posts
DROP POLICY IF EXISTS "Users can create own posts" ON public.social_posts;
CREATE POLICY "Users can create own posts"
ON public.social_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden actualizar sus propios posts
DROP POLICY IF EXISTS "Users can update own posts" ON public.social_posts;
CREATE POLICY "Users can update own posts"
ON public.social_posts FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden eliminar sus propios posts
DROP POLICY IF EXISTS "Users can delete own posts" ON public.social_posts;
CREATE POLICY "Users can delete own posts"
ON public.social_posts FOR DELETE
USING (auth.uid() = user_id);

-- Vista para posts con información del usuario
CREATE OR REPLACE VIEW public.social_posts_with_user AS
SELECT 
  sp.id,
  sp.user_id,
  sp.content,
  sp.city,
  sp.city_lat,
  sp.city_lng,
  sp.audience,
  sp.image_url,
  sp.created_at,
  sp.updated_at,
  p.username,
  p.avatar_url
FROM public.social_posts sp
LEFT JOIN public.profiles p ON sp.user_id = p.id;

-- Grant permisos
GRANT ALL ON public.social_posts TO authenticated;
GRANT SELECT ON public.social_posts TO anon;
GRANT SELECT ON public.social_posts_with_user TO authenticated;
GRANT SELECT ON public.social_posts_with_user TO anon;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_social_posts_updated_at ON public.social_posts;
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
