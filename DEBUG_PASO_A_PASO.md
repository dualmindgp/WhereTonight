# 🔍 Debug Paso a Paso - Historia No Aparece

## 📋 Checklist de Verificación

Vamos a revisar TODO paso a paso:

---

## ✅ PASO 1: Consola del Navegador

**Abre la consola (F12) y compra un ticket. Dime qué ves:**

### **Logs Esperados:**
```javascript
✓ Usuario usando ticket: {venueId: "...", userId: "...", shareToStory: true}
✓ Creating ticket story with data: {
    userId: "...",
    venueName: "...",
    venueId: "...",
    photoUrl: "/api/photo?ref=...",
    city: "Madrid",
    cityLat: 40.4168,
    cityLng: -3.7038
  }
✓ Story created successfully: [{...}]
✓ Story created! Reloading to show it...
```

### **¿Qué ves TÚ?**
- [ ] Veo todos esos logs ✓
- [ ] Veo un error en ROJO
- [ ] No veo ningún log
- [ ] La página se recarga automáticamente
- [ ] La página NO se recarga

---

## ✅ PASO 2: Verificar en Supabase

**Ve a Supabase → SQL Editor y ejecuta:**

```sql
-- Ver tus últimos posts
SELECT 
  id,
  content,
  venue_name,
  is_ticket_story,
  city,
  city_lat,
  city_lng,
  created_at
FROM social_posts 
WHERE user_id = 'TU_USER_ID'  -- Reemplaza con tu ID real
ORDER BY created_at DESC 
LIMIT 5;
```

### **¿Qué ves?**
- [ ] Veo el post con `is_ticket_story = true`
- [ ] NO veo ningún post nuevo
- [ ] Veo un post pero `is_ticket_story` es NULL
- [ ] Veo un error

---

## ✅ PASO 3: Verificar Campos de BD

```sql
-- Verificar que los campos existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'social_posts' 
AND column_name IN ('is_ticket_story', 'venue_id', 'venue_name', 'venue_photo');
```

### **¿Cuántas filas devuelve?**
- [ ] 4 filas (CORRECTO)
- [ ] Menos de 4 filas (FALTA MIGRACIÓN)
- [ ] 0 filas (NO EJECUTASTE MIGRACIÓN)

---

## ✅ PASO 4: Verificar Ciudad

**¿En qué ciudad estás viendo el feed social?**

```sql
-- Ver la ciudad del post que creaste
SELECT city, city_lat, city_lng 
FROM social_posts 
WHERE user_id = 'TU_USER_ID'
ORDER BY created_at DESC 
LIMIT 1;
```

**¿Coincide con la ciudad seleccionada en el selector de ciudad del feed?**
- [ ] Sí, es la misma ciudad
- [ ] No, el post es de otra ciudad
- [ ] No sé qué ciudad está seleccionada

---

## ✅ PASO 5: Verificar Vista

```sql
-- Ver si la vista incluye los campos nuevos
SELECT * FROM social_posts_with_user 
WHERE user_id = 'TU_USER_ID'
ORDER BY created_at DESC 
LIMIT 1;
```

### **¿El resultado incluye estos campos?**
- [ ] is_ticket_story
- [ ] venue_id
- [ ] venue_name
- [ ] venue_photo

**Si NO los incluye:** La vista no se actualizó. Ejecuta:
```sql
DROP VIEW IF EXISTS social_posts_with_user CASCADE;

CREATE OR REPLACE VIEW social_posts_with_user AS
SELECT 
  sp.*,
  p.username,
  p.avatar_url
FROM social_posts sp
LEFT JOIN profiles p ON sp.user_id = p.id;

GRANT SELECT ON social_posts_with_user TO authenticated;
GRANT SELECT ON social_posts_with_user TO anon;
```

---

## ✅ PASO 6: Verificar Filtros del Feed

En `SocialFeed.tsx`, los posts se filtran por:
1. **Ciudad seleccionada** → El post debe tener la misma city
2. **Últimas 24h** → El post debe ser reciente
3. **Audiencia** → Si es `public` se ve siempre

```sql
-- Ver si tu post cumple los filtros
SELECT 
  id,
  content,
  city,
  audience,
  created_at,
  NOW() - created_at as edad
FROM social_posts 
WHERE user_id = 'TU_USER_ID'
ORDER BY created_at DESC 
LIMIT 1;
```

### **Verificar:**
- [ ] `city` es la que tienes seleccionada en el feed
- [ ] `audience` es 'public'
- [ ] `created_at` es de hace menos de 24h

---

## ✅ PASO 7: Ver TODOS los Posts del Feed

En la consola del navegador, ejecuta:

```javascript
// Ver qué ciudad está seleccionada
console.log('Ciudad seleccionada:', localStorage.getItem('selectedCity'))

// Ver cuántos posts se cargaron
console.log('Posts cargados:', document.querySelectorAll('[class*="post"]').length)
```

---

## 🐛 Errores Comunes

### **Error A: Ciudad Diferente**
**Síntoma:** El post se crea pero no aparece  
**Causa:** El venue es de Madrid pero tienes seleccionada Barcelona  
**Solución:** Cambia el selector de ciudad en el feed

### **Error B: Vista No Actualizada**
**Síntoma:** El post existe en `social_posts` pero no en `social_posts_with_user`  
**Causa:** La vista no se actualizó  
**Solución:** Ejecutar DROP VIEW + CREATE VIEW (ver Paso 5)

### **Error C: Post Sin city_lat/city_lng**
**Síntoma:** Error en consola al crear  
**Causa:** Ya lo arreglamos  
**Solución:** Ya está corregido en el código

### **Error D: Checkbox Desmarcado**
**Síntoma:** No se crea historia  
**Causa:** El usuario desmarcó "Compartir en mi historia"  
**Solución:** Asegúrate de que el checkbox está ✓ marcado

---

## 🎯 Test Definitivo

**Crea un post MANUALMENTE para verificar que el sistema funciona:**

```sql
INSERT INTO social_posts (
  user_id, 
  content, 
  city, 
  city_lat, 
  city_lng,
  audience, 
  is_ticket_story, 
  venue_name,
  venue_id
)
VALUES (
  'TU_USER_ID',  -- Reemplaza con tu ID
  'Test manual de historia 🎉',
  'Madrid',      -- O la ciudad que tengas seleccionada
  40.4168,
  -3.7038,
  'public',
  true,
  'Test Venue',
  NULL
);
```

**Después refresca el feed y verifica:**
- [ ] El post aparece en el feed
- [ ] Aparece en las stories (si es reciente)

**Si el post manual SÍ aparece pero el automático NO:**
→ El problema está en el código de creación

**Si el post manual tampoco aparece:**
→ El problema está en los filtros del feed o la ciudad seleccionada

---

## 📸 Screenshots que Necesito

Por favor comparte:

1. **Consola del navegador** después de comprar ticket
2. **Resultado** de esta query:
   ```sql
   SELECT * FROM social_posts 
   WHERE user_id = 'TU_USER_ID'
   ORDER BY created_at DESC LIMIT 1;
   ```
3. **Ciudad seleccionada** en el feed social (esquina superior)

Con eso te doy la solución exacta! 🎯

---

## 💡 Solución Rápida

**Si tienes prisa, prueba esto:**

1. **Abre el feed social**
2. **Asegúrate de estar en la MISMA ciudad que el venue**
3. **Refresca con Ctrl+F5**
4. **Si sigue sin aparecer, ejecuta:**
   ```sql
   -- Ver TODO sin filtros
   SELECT * FROM social_posts_with_user 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
5. **Busca tu post en la lista**
6. **Compara la `city` del post con la ciudad seleccionada**

---

¿Qué encuentras en cada paso? 🔍
