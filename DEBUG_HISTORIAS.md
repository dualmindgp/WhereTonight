# 🐛 Debug: Historias No Aparecen

## 🔍 Pasos para Verificar

### **1. Abre la Consola del Navegador**
Presiona `F12` o `Ctrl+Shift+I` y ve a la pestaña **Console**

### **2. Compra un Ticket**
- Selecciona un venue
- Click en "Voy a ir"
- Deja marcado ✓ "Compartir en mi historia"
- Click "Sí, voy a ir"

### **3. Revisa los Logs en Consola**

Deberías ver algo como esto:

```javascript
// 1. Inicio del proceso
Creating ticket story with data: {
  userId: "abc-123-def-456",
  venueName: "Ejemplo Club",
  venueId: "xyz-789",
  photoUrl: "/api/photo?ref=...",
  city: "Madrid"
}

// 2. Si todo va bien
Story created successfully: [{
  id: "post-id-123",
  user_id: "abc-123-def-456",
  content: "¡Voy a Ejemplo Club esta noche! 🎉",
  venue_id: "xyz-789",
  venue_name: "Ejemplo Club",
  venue_photo: "/api/photo?ref=...",
  is_ticket_story: true,
  city: "Madrid",
  created_at: "2025-11-16T..."
}]

// 3. Recarga automática
Story created! Reloading to show it...
```

---

## ❌ Errores Comunes

### **Error 1: Campos No Existen**
```javascript
Error creating ticket story (with new fields): {
  code: "42703",
  message: "column \"is_ticket_story\" of relation \"social_posts\" does not exist"
}
```

**Causa:** No has ejecutado la migración SQL  
**Solución:** 
1. Ve a Supabase → SQL Editor
2. Ejecuta `migrations/add_ticket_story_fields.sql`
3. Prueba de nuevo

---

### **Error 2: Vista No Actualizada**
```javascript
// Si ves esto en la consola de Supabase
ERROR: column "is_ticket_story" does not exist
LINE 1: SELECT id, user_id, content, is_ticket_story...
```

**Causa:** La vista `social_posts_with_user` no se actualizó  
**Solución:**
```sql
-- Ejecutar en Supabase SQL Editor
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

---

### **Error 3: Post Se Crea Pero No Aparece**

**Verificar en Supabase:**
```sql
-- 1. Ver últimos posts creados
SELECT * FROM social_posts 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Buscar TU post específicamente (reemplaza con tu user_id)
SELECT * FROM social_posts 
WHERE user_id = 'TU_USER_ID_AQUI'
AND content LIKE '%esta noche%'
ORDER BY created_at DESC;

-- 3. Verificar la vista
SELECT * FROM social_posts_with_user 
WHERE user_id = 'TU_USER_ID_AQUI'
ORDER BY created_at DESC 
LIMIT 5;
```

**Posibles causas:**
- ✓ Post se creó pero con ciudad diferente a la seleccionada
- ✓ Post es de hace más de 24h (improbable)
- ✓ Problemas con permisos RLS
- ✓ Cache del navegador

---

### **Error 4: No Hay Logs en Consola**

Si no ves NINGÚN log:

**Causa:** El código no se está ejecutando  
**Soluciones:**
1. Verifica que el archivo `VenueSheet.tsx` se actualizó correctamente
2. Haz hard refresh: `Ctrl+F5` o `Cmd+Shift+R`
3. Limpia cache del navegador
4. Prueba en modo incógnito

---

## ✅ Verificación Paso a Paso

### **Paso 1: Verificar Usuario**
```javascript
// En consola del navegador, ejecuta:
console.log('User ID:', localStorage.getItem('supabase.auth.token'))
```

### **Paso 2: Verificar Ciudad Seleccionada**
```javascript
// En consola del navegador, ejecuta:
console.log('Selected city:', sessionStorage.getItem('selectedCity'))
```

### **Paso 3: Verificar Venue**
Cuando abras el modal del venue, debería aparecer:
```javascript
{
  id: "...",
  name: "Nombre del Venue",
  city: "Ciudad",
  photos: [...],
  type: "..."
}
```

### **Paso 4: Ver Todos los Posts del Usuario**
```sql
-- En Supabase SQL Editor
SELECT 
  id,
  content,
  city,
  created_at,
  is_ticket_story,
  venue_name
FROM social_posts 
WHERE user_id = 'TU_USER_ID'
ORDER BY created_at DESC;
```

---

## 🔧 Solución Temporal (Modo Fallback)

Si los campos nuevos NO EXISTEN en la BD, el código usa modo fallback:

**Logs esperados:**
```javascript
Error creating ticket story (with new fields): {...}
Trying to create story without new fields...
Story created successfully (fallback mode): [{
  id: "...",
  user_id: "...",
  content: "¡Voy a Ejemplo Club esta noche! 🎉 (venue-id-123)",
  audience: "public",
  city: "Madrid"
}]
```

En este modo:
- ✅ El post SÍ se crea
- ✅ Aparece en el feed
- ❌ NO tiene foto del venue
- ❌ NO tiene botón "¿Te apuntas?"
- ❌ Aparece como post normal

---

## 🎯 Checklist de Debug

Marca cada uno cuando lo verifiques:

- [ ] La consola del navegador está abierta (F12)
- [ ] Puedo ver logs cuando compro el ticket
- [ ] Veo el log "Creating ticket story with data: {...}"
- [ ] Veo el log "Story created successfully: [...]"
- [ ] NO veo errores en rojo en la consola
- [ ] La migración SQL está ejecutada en Supabase
- [ ] Los 4 campos existen en la tabla `social_posts`
- [ ] La vista `social_posts_with_user` incluye los campos nuevos
- [ ] El post aparece en la query de Supabase
- [ ] Estoy en la MISMA ciudad que el venue
- [ ] He hecho refresh después de crear (la página debería recargar automáticamente)

---

## 📸 Screenshots Útiles

### **1. Logs Correctos en Consola:**
```
✓ Creating ticket story with data: {...}
✓ Story created successfully: [...]
✓ Story created! Reloading to show it...
```

### **2. Query en Supabase:**
```sql
-- Deberías ver tu post aquí
SELECT * FROM social_posts_with_user 
WHERE content LIKE '%esta noche%'
ORDER BY created_at DESC;
```

### **3. Verificar Campos en BD:**
```sql
-- Debería devolver 4 filas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'social_posts' 
AND column_name IN ('is_ticket_story', 'venue_id', 'venue_name', 'venue_photo');
```

---

## 🚨 Si Nada Funciona

1. **Comparte conmigo:**
   - Screenshot de la consola del navegador
   - Screenshot de la query en Supabase
   - Tu `user_id` (puedes encontrarlo en Supabase → Authentication → Users)

2. **Prueba esto:**
```sql
-- Crear un post manualmente para verificar que el sistema funciona
INSERT INTO social_posts (user_id, content, city, audience, is_ticket_story, venue_name)
VALUES (
  'TU_USER_ID', 
  'Test manual de historia 🎉', 
  'Madrid', 
  'public',
  true,
  'Test Venue'
);

-- Luego verifica si aparece
SELECT * FROM social_posts_with_user 
WHERE content LIKE '%Test manual%';
```

Si este post manual aparece en el feed, el problema está en el código.  
Si NO aparece, el problema está en la BD o permisos.

---

## 💡 Actualización Reciente

He añadido un **reload automático** después de crear la historia:
- Espera 500ms para que la BD procese
- Recarga la página automáticamente
- La historia debería aparecer inmediatamente

Si sigue sin aparecer después del reload, entonces:
1. El post no se está creando (revisa logs)
2. O hay un problema con la ciudad/filtros

---

¡Sígueme reportando qué ves en la consola! 🔍
