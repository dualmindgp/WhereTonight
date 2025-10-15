-- Crear tabla friendships para el sistema de amigos
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- No puede ser amigo de sí mismo
  CONSTRAINT different_users CHECK (user_id != friend_id),
  
  -- No puede haber solicitudes duplicadas (en ninguna dirección)
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON public.friendships(created_at DESC);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies para friendships

-- Ver solicitudes donde soy el user_id o friend_id
DROP POLICY IF EXISTS "view own friendships" ON public.friendships;
CREATE POLICY "view own friendships" 
ON public.friendships
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Crear solicitudes (solo si eres el user_id)
DROP POLICY IF EXISTS "create friendships" ON public.friendships;
CREATE POLICY "create friendships" 
ON public.friendships
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Actualizar solicitudes (solo si eres el friend_id, para aceptar)
DROP POLICY IF EXISTS "update friendships" ON public.friendships;
CREATE POLICY "update friendships" 
ON public.friendships
FOR UPDATE 
USING (auth.uid() = friend_id OR auth.uid() = user_id)
WITH CHECK (auth.uid() = friend_id OR auth.uid() = user_id);

-- Eliminar solicitudes (solo si eres el user_id o friend_id)
DROP POLICY IF EXISTS "delete friendships" ON public.friendships;
CREATE POLICY "delete friendships" 
ON public.friendships
FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Crear tabla favorites si no existe (para favoritos de venues)
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- No puede haber duplicados
  CONSTRAINT unique_favorite UNIQUE (user_id, venue_id)
);

-- Índices para favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_venue_id ON public.favorites(venue_id);

-- Enable RLS para favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies para favorites

-- Ver propios favoritos
DROP POLICY IF EXISTS "view own favorites" ON public.favorites;
CREATE POLICY "view own favorites" 
ON public.favorites
FOR SELECT 
USING (auth.uid() = user_id);

-- Crear propios favoritos
DROP POLICY IF EXISTS "create own favorites" ON public.favorites;
CREATE POLICY "create own favorites" 
ON public.favorites
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Eliminar propios favoritos
DROP POLICY IF EXISTS "delete own favorites" ON public.favorites;
CREATE POLICY "delete own favorites" 
ON public.favorites
FOR DELETE 
USING (auth.uid() = user_id);
