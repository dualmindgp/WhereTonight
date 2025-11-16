# 🔧 Solución: Las Historias no Aparecen Tras Comprar Ticket

## 🐛 Problema
Cuando aceptas compartir la historia al comprar un ticket, la historia no aparece en el feed social.

## ✅ Solución

### **Paso 1: Ejecutar Migración de Base de Datos**

**IMPORTANTE:** Los campos nuevos (`is_ticket_story`, `venue_id`, `venue_name`, `venue_photo`) no existen aún en tu base de datos.

#### **Ejecutar en Supabase:**

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Ejecuta el siguiente script:

```sql
-- Migración: Añadir campos para historias de tickets
-- Fecha: 16 de Noviembre, 2025

-- Añadir columna para identificar historias de tickets
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS is_ticket_story BOOLEAN DEFAULT FALSE;

-- Añadir columna para guardar el ID del venue asociado
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;

-- Añadir columna para guardar el nombre del venue (denormalizado para performance)
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_name TEXT;

-- Añadir columna para guardar la URL de la foto del venue
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_photo TEXT;

-- Crear índice para consultas por venue_id
CREATE INDEX IF NOT EXISTS idx_social_posts_venue_id ON social_posts(venue_id) WHERE venue_id IS NOT NULL;

-- Crear índice para identificar historias de tickets
CREATE INDEX IF NOT EXISTS idx_social_posts_is_ticket_story ON social_posts(is_ticket_story) WHERE is_ticket_story = TRUE;

-- Comentarios para documentación
COMMENT ON COLUMN social_posts.is_ticket_story IS 'Indica si el post fue creado automáticamente al comprar una entrada';
COMMENT ON COLUMN social_posts.venue_id IS 'ID del venue al que se refiere este post (si es historia de ticket)';
COMMENT ON COLUMN social_posts.venue_name IS 'Nombre del venue (denormalizado para performance)';
COMMENT ON COLUMN social_posts.venue_photo IS 'URL de la foto del venue para mostrar en la historia';

-- Actualizar la vista social_posts_with_user para incluir los nuevos campos
DROP VIEW IF EXISTS social_posts_with_user CASCADE;

CREATE OR REPLACE VIEW social_posts_with_user AS
SELECT 
  sp.id,
  sp.user_id,
  sp.content,
  sp.image_url,
  sp.audience,
  sp.city,
  sp.created_at,
  sp.updated_at,
  sp.is_ticket_story,
  sp.venue_id,
  sp.venue_name,
  sp.venue_photo,
  p.username,
  p.avatar_url
FROM social_posts sp
LEFT JOIN profiles p ON sp.user_id = p.id;

-- Grant permisos necesarios
GRANT SELECT ON social_posts_with_user TO authenticated;
GRANT SELECT ON social_posts_with_user TO anon;
```

4. Click **RUN** o presiona `Ctrl+Enter`

---

### **Paso 2: Verificar que Funcionó**

Ejecuta esto en el SQL Editor para verificar:

```sql
-- Verificar columnas añadidas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'social_posts' 
AND column_name IN ('is_ticket_story', 'venue_id', 'venue_name', 'venue_photo');

-- Debería devolver 4 filas (una por cada campo)
```

---

### **Paso 3: Probar la Funcionalidad**

1. **Abre la consola del navegador** (F12 → Console)
2. **Compra un ticket** aceptando compartir en historia
3. **Observa los logs:**

```
Creating ticket story with data: {
  userId: "...",
  venueName: "...",
  venueId: "...",
  photoUrl: "...",
  city: "..."
}
```

4. **Si todo va bien:**
   - Verás: `Story created successfully: [...]`
   - Toast: "¡Historia compartida! 🎉"

5. **Si hay error:**
   - Verás el error en consola
   - Se intentará modo fallback (sin campos nuevos)

---

## 🔍 Debug

### **Si sigue sin aparecer la historia:**

#### **1. Verifica que el post se creó:**
```sql
-- En Supabase SQL Editor
SELECT * FROM social_posts 
WHERE user_id = 'TU_USER_ID'
ORDER BY created_at DESC 
LIMIT 5;

-- Deberías ver el post con content "¡Voy a [venue] esta noche! 🎉"
```

#### **2. Verifica la vista:**
```sql
SELECT * FROM social_posts_with_user 
WHERE user_id = 'TU_USER_ID'
ORDER BY created_at DESC 
LIMIT 5;

-- Debería incluir los campos: is_ticket_story, venue_id, venue_name, venue_photo
```

#### **3. Verifica permisos:**
```sql
-- En Supabase → Authentication → Policies
-- Asegúrate de que existen políticas para INSERT en social_posts
```

#### **4. Revisa la consola del navegador:**
- Abre DevTools (F12)
- Ve a Console
- Busca errores en rojo
- Comparte el error conmigo si lo hay

---

## 🎯 Modo Fallback

Si los campos nuevos no existen (no ejecutaste la migración), el código ahora usa un **modo fallback**:

```typescript
// Si falla con campos nuevos, crea post básico:
{
  user_id: userId,
  content: `¡Voy a ${venue.name} esta noche! 🎉 (${venue.id})`,
  audience: 'public',
  city: city
}
```

**Limitaciones del modo fallback:**
- ❌ No tendrá la foto del venue
- ❌ No tendrá el botón "¿Te apuntas?"
- ❌ Aparecerá como post normal (sin formato especial)
- ✅ Pero SÍ aparecerá en el feed

---

## ✅ Checklist

Marca cada paso cuando lo completes:

- [ ] **Ejecuté la migración SQL** en Supabase
- [ ] **Verifiqué** que las 4 columnas existen
- [ ] **Actualicé** la vista `social_posts_with_user`
- [ ] **Probé** comprar un ticket
- [ ] **Vi** los logs en consola del navegador
- [ ] **Confirmé** que aparece el toast "¡Historia compartida! 🎉"
- [ ] **Verifiqué** que la historia aparece en el feed
- [ ] **Probé** que el botón "¿Te apuntas?" funciona

---

## 🚨 Errores Comunes

### **Error: "column does not exist"**
```
ERROR: column "is_ticket_story" of relation "social_posts" does not exist
```
**Solución:** Ejecutar la migración SQL (Paso 1)

---

### **Error: "relation social_posts_with_user does not exist"**
```
ERROR: relation "social_posts_with_user" does not exist
```
**Solución:** La vista se eliminó y necesita recrearse con la migración

---

### **Historia se crea pero no aparece**
**Posibles causas:**
1. **Filtro de ciudad:** Asegúrate de estar en la misma ciudad que el venue
2. **Filtro de tiempo:** Solo se muestran posts de últimas 24h
3. **Cache del navegador:** Prueba refrescar (Ctrl+F5)
4. **Permisos RLS:** Verifica políticas de Supabase

---

## 📞 Soporte

Si después de seguir todos los pasos sigue sin funcionar:

1. **Abre la consola del navegador** (F12)
2. **Copia todos los logs** en rojo
3. **Ejecuta esta query** en Supabase SQL Editor:
   ```sql
   SELECT * FROM social_posts 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;
   ```
4. **Comparte** los resultados

---

¡Con estos pasos debería funcionar perfectamente! 🎉
