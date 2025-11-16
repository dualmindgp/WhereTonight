# ⚠️ Error: "No se pudo compartir la historia"

## 🔍 Necesito que Hagas Esto YA

### **1. Abre la Consola del Navegador**
- Presiona `F12`
- Ve a la pestaña **Console**

### **2. Busca Mensajes en ROJO**

Deberías ver algo como esto en rojo:

```javascript
Error creating ticket story: {
  code: "42703",
  message: "column \"is_ticket_story\" does not exist",
  details: "..."
}
```

O tal vez:

```javascript
Error creating ticket story: {
  code: "23503",
  message: "insert or update on table \"social_posts\" violates foreign key constraint",
  details: "..."
}
```

### **3. COPIA el Error Completo**

Necesito ver:
- El mensaje de error exacto
- El código de error
- Cualquier detalle adicional

---

## 🎯 Causas Más Probables

### **Causa #1: No Ejecutaste la Migración SQL** (90% probable)

**Error esperado:**
```
column "is_ticket_story" does not exist
```

**Solución:**
1. Ve a **Supabase** → **SQL Editor**
2. Ejecuta este código:

```sql
-- Añadir columnas necesarias
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS is_ticket_story BOOLEAN DEFAULT FALSE;

ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;

ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_name TEXT;

ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_photo TEXT;

-- Recrear la vista
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

GRANT SELECT ON social_posts_with_user TO authenticated;
GRANT SELECT ON social_posts_with_user TO anon;
```

3. Click **RUN**
4. Prueba de nuevo comprar un ticket

---

### **Causa #2: Campo `city` No Está en la Tabla**

**Error esperado:**
```
column "city" does not exist
```

**Solución:**
```sql
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS city TEXT;
```

---

### **Causa #3: Problema con `venue_id` (Foreign Key)**

**Error esperado:**
```
violates foreign key constraint
```

Esto pasa si el `venue.id` no existe en la tabla `venues`.

**Solución temporal - permitir venue_id NULL:**
```sql
-- Quitar la constraint temporalmente
ALTER TABLE social_posts 
DROP CONSTRAINT IF EXISTS social_posts_venue_id_fkey;

-- Añadir sin constraint
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_id UUID;

-- O volver a añadir con ON DELETE SET NULL
ALTER TABLE social_posts
ADD CONSTRAINT social_posts_venue_id_fkey 
FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;
```

---

## 📋 Verificación Rápida

### **¿Ejecutaste la Migración?**

Corre esto en Supabase SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'social_posts' 
AND column_name IN ('is_ticket_story', 'venue_id', 'venue_name', 'venue_photo', 'city');
```

**Resultado esperado:** Deberías ver 5 filas

**Si ves menos de 5 filas:** Falta ejecutar la migración

---

## 🚀 Fix Rápido: Modo Fallback Mejorado

Si no quieres ejecutar la migración ahora mismo, puedo hacer que funcione SIN los campos nuevos.

El post se creará pero:
- ❌ Sin foto del venue
- ❌ Sin botón "¿Te apuntas?"
- ✅ Pero SÍ aparecerá en el feed

**¿Quieres que active el modo fallback?**

---

## 📸 Screenshot que Necesito

Por favor, toma un screenshot de:

1. **La consola del navegador** con el error en rojo
2. **El resultado** de esta query en Supabase:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'social_posts';
   ```

Con eso te doy una solución exacta en 30 segundos.

---

## ⚡ Mientras Tanto...

Prueba esto para verificar que TODO lo demás funciona:

```sql
-- Ejecutar en Supabase SQL Editor
-- Esto crea un post de prueba MANUALMENTE
INSERT INTO social_posts (user_id, content, city, audience)
VALUES (
  'TU_USER_ID_AQUI',  -- Reemplaza con tu user_id
  'Prueba manual de post 🎉',
  'Madrid',
  'public'
);
```

Si este post aparece en tu feed → el sistema funciona, solo falta la migración  
Si NO aparece → hay un problema más profundo con permisos o filtros

---

## 🎯 Responde Esto

1. **¿Qué error exacto ves en la consola?**
2. **¿Has ejecutado la migración SQL?** (Sí/No)
3. **¿Cuántas columnas te devuelve la query de verificación?** (debería ser 5)

¡Con esa info te lo arreglo al instante! 🚀
