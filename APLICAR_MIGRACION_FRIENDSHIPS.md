# 🔧 Aplicar Migración de Friendships a Supabase

## ⚠️ IMPORTANTE - Debes hacer esto para que funcionen las solicitudes de amistad

La tabla `friendships` necesita ser creada en tu base de datos de Supabase.

---

## 📝 Pasos para aplicar la migración

### Opción 1: Usando Supabase Dashboard (RECOMENDADO)

1. **Abre tu proyecto en Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto "WhereTonight"

2. **Abre el SQL Editor**
   - En el menú lateral, click en **"SQL Editor"**
   - Click en **"New query"**

3. **Copia y pega este SQL**

```sql
-- Crear tabla friendships para el sistema de amigos
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT different_users CHECK (user_id != friend_id),
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
DROP POLICY IF EXISTS "view own friendships" ON public.friendships;
CREATE POLICY "view own friendships" 
ON public.friendships
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "create friendships" ON public.friendships;
CREATE POLICY "create friendships" 
ON public.friendships
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update friendships" ON public.friendships;
CREATE POLICY "update friendships" 
ON public.friendships
FOR UPDATE 
USING (auth.uid() = friend_id OR auth.uid() = user_id)
WITH CHECK (auth.uid() = friend_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "delete friendships" ON public.friendships;
CREATE POLICY "delete friendships" 
ON public.friendships
FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Crear tabla favorites si no existe
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT unique_favorite UNIQUE (user_id, venue_id)
);

-- Índices para favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_venue_id ON public.favorites(venue_id);

-- Enable RLS para favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies para favorites
DROP POLICY IF EXISTS "view own favorites" ON public.favorites;
CREATE POLICY "view own favorites" 
ON public.favorites
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "create own favorites" ON public.favorites;
CREATE POLICY "create own favorites" 
ON public.favorites
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete own favorites" ON public.favorites;
CREATE POLICY "delete own favorites" 
ON public.favorites
FOR DELETE 
USING (auth.uid() = user_id);
```

4. **Ejecuta la query**
   - Click en **"Run"** (o presiona `Ctrl+Enter`)
   - Deberías ver el mensaje: **"Success. No rows returned"**

5. **Verifica que se crearon las tablas**
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver las nuevas tablas:
     - ✅ `friendships`
     - ✅ `favorites`

---

## ✅ Verificación

Después de aplicar la migración, verifica en Supabase:

### Tabla `friendships` debe tener estas columnas:
- `id` (uuid)
- `user_id` (uuid) - Quien envía la solicitud
- `friend_id` (uuid) - Quien recibe la solicitud
- `status` (text) - 'pending', 'accepted', o 'rejected'
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Tabla `favorites` debe tener estas columnas:
- `id` (uuid)
- `user_id` (uuid)
- `venue_id` (uuid)
- `created_at` (timestamptz)

---

## 🔄 Después de aplicar la migración

1. **Recarga la aplicación** en tu navegador
2. **Abre la consola del navegador** (F12)
3. **Prueba enviar una solicitud de amistad**
4. **Verifica que aparezca en el modal de solicitudes**

Deberías ver logs en la consola como:
```
Cargando solicitudes para: [user-id]
Solicitudes obtenidas: [array de solicitudes]
IDs de usuarios: [array de IDs]
Perfiles obtenidos: [array de perfiles]
Solicitudes transformadas: [array final]
```

---

## 🐛 Si algo falla

1. **Verifica las políticas RLS**:
   - En Supabase Dashboard → Table Editor
   - Click en `friendships`
   - Tab "Policies"
   - Deberían estar 4 políticas activas

2. **Verifica los datos**:
   - En Table Editor → `friendships`
   - Deberías ver los registros con `status = 'pending'`

3. **Revisa la consola del navegador**:
   - Los logs te dirán exactamente qué está pasando

---

## 📊 Estructura de la Relación

```
Usuario A (user_id) → envía solicitud → Usuario B (friend_id)
Status: 'pending'

Usuario B acepta:
Status: 'accepted'

Ambos usuarios ahora ven esta fila como amistad
```

---

## 💡 Notas Importantes

- **RLS (Row Level Security)** está habilitado para seguridad
- Solo puedes ver tus propias solicitudes (enviadas o recibidas)
- No puedes enviar solicitudes duplicadas
- No puedes ser amigo de ti mismo
- Las solicitudes se pueden aceptar o rechazar

---

Una vez aplicada la migración, **el sistema de amigos funcionará completamente**. 🎉
