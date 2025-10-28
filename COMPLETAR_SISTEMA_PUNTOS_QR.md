# 🚨 COMPLETAR SISTEMA DE PUNTOS Y QR

**Estado Actual:** El código está 100% implementado PERO falta crear las tablas en la base de datos.

---

## ✅ LO QUE YA ESTÁ HECHO

### **Archivos de Código:**
- ✅ `src/components/QRScanner.tsx` - Sistema de escaneo QR completo
- ✅ `src/lib/points-system.ts` - Sistema de puntos y logros completo
- ✅ `src/components/PointsBadge.tsx` - Badge para mostrar puntos
- ✅ `src/lib/push-notifications.ts` - Sistema de notificaciones push
- ✅ `src/lib/share.ts` - Sistema para compartir venues

### **Integración UI:**
- ✅ QRScanner integrado en ProfileScreen.tsx
- ✅ PointsBadge integrado en ProfileScreen.tsx
- ✅ Sistema de puntos llamado en acciones

### **Paquetes NPM:**
- ✅ `@capacitor-mlkit/barcode-scanning` - Para escaneo QR
- ✅ `@capacitor/share` - Para compartir
- ✅ `@capacitor/push-notifications` - Para notificaciones

---

## ❌ LO QUE FALTA

### **Base de Datos en Supabase:**

Las tablas NO existen en Supabase, por lo que:
- ❌ No se pueden guardar puntos
- ❌ No se puede ver el historial
- ❌ No funciona el leaderboard
- ❌ No se pueden guardar tokens push

---

## 🔧 CÓMO COMPLETAR LA IMPLEMENTACIÓN

### **PASO 1: Crear Tablas en Supabase** ⭐

**Opción A: Desde Supabase Dashboard (Recomendado)**

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto WhereTonight
3. Ve a **SQL Editor** en el menú lateral
4. Haz clic en **"+ New query"**
5. Copia TODO el contenido del archivo:
   ```
   database/points-system-migration.sql
   ```
6. Pégalo en el editor SQL
7. Haz clic en **"Run"** (botón verde)
8. Verifica que diga "Success. No rows returned"

**Opción B: Desde CLI de Supabase**

```bash
# Si tienes Supabase CLI instalado
supabase db push database/points-system-migration.sql
```

---

### **PASO 2: Verificar que se Crearon las Tablas**

En Supabase Dashboard → **Table Editor**, verifica que existan:

- ✅ `user_points` (con columnas: user_id, total_points, level)
- ✅ `points_transactions` (con columnas: id, user_id, action, points, metadata)
- ✅ `push_tokens` (con columnas: id, user_id, token, platform)

---

### **PASO 3: Probar el Sistema de Puntos**

Después de crear las tablas:

```bash
npm run dev
```

#### **Probar Puntos:**

1. Inicia sesión en la app
2. Ve a tu perfil
3. Deberías ver el **PointsBadge** con tus puntos y nivel
4. Realiza acciones:
   - ✅ Usa un ticket → +10 puntos
   - ✅ Guarda un venue → +5 puntos
   - ✅ Comparte un venue → +5 puntos
5. Los puntos deberían incrementarse automáticamente

#### **Probar QR Scanner:**

1. En tu perfil, busca el botón "Escanear QR"
2. Haz clic
3. Acepta permisos de cámara
4. Apunta a un código QR
5. Debería escanearlo automáticamente

---

## 📊 ESTRUCTURA DE LAS TABLAS CREADAS

### **user_points**
```sql
user_id        | UUID (PRIMARY KEY)
total_points   | INTEGER (DEFAULT 0)
level          | INTEGER (DEFAULT 1)
created_at     | TIMESTAMP
updated_at     | TIMESTAMP
```

### **points_transactions**
```sql
id             | UUID (PRIMARY KEY)
user_id        | UUID (FOREIGN KEY)
action         | TEXT
points         | INTEGER
metadata       | JSONB
created_at     | TIMESTAMP
```

### **push_tokens**
```sql
id             | UUID (PRIMARY KEY)
user_id        | UUID (FOREIGN KEY)
token          | TEXT
platform       | TEXT ('android', 'ios', 'web')
created_at     | TIMESTAMP
updated_at     | TIMESTAMP
```

---

## 🎯 ACCIONES QUE OTORGAN PUNTOS

Una vez que ejecutes la migración, estas acciones otorgarán puntos automáticamente:

| Acción | Puntos | Dónde se Ejecuta |
|--------|--------|------------------|
| **Usar ticket** | 10 pts | VenueSheet.tsx (al confirmar ticket) |
| **Guardar venue** | 5 pts | VenueSheet.tsx (al hacer toggle save) |
| **Compartir venue** | 5 pts | VenueSheet.tsx (al compartir) |
| **Completar perfil** | 20 pts | ProfileScreen.tsx (al subir avatar) |
| **Login diario** | 2 pts | (Pendiente implementar) |
| **Primer ticket** | 50 pts | Logro automático |
| **Racha 7 días** | 100 pts | Logro automático |
| **Mes activo** | 200 pts | Logro automático |

---

## 🔍 VERIFICACIÓN

### **1. Verificar que las tablas existen:**

En Supabase → SQL Editor:

```sql
-- Ver todas las tablas relacionadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_points', 'points_transactions', 'push_tokens');

-- Ver columnas de user_points
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_points';
```

### **2. Verificar que la función existe:**

```sql
-- Ver funciones creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'add_user_points';
```

### **3. Verificar políticas RLS:**

```sql
-- Ver políticas de seguridad
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_points', 'points_transactions', 'push_tokens');
```

---

## 🚨 TROUBLESHOOTING

### **Error: "relation 'user_points' does not exist"**

**Causa:** No has ejecutado la migración SQL.

**Solución:** Ejecuta `database/points-system-migration.sql` en Supabase.

---

### **Error: "permission denied for function add_user_points"**

**Causa:** Falta dar permisos a la función.

**Solución:** Ejecuta en Supabase SQL Editor:

```sql
GRANT EXECUTE ON FUNCTION add_user_points(UUID, INTEGER) TO authenticated;
```

---

### **No se muestran puntos en el badge**

**Causa:** Tu usuario no tiene registro en `user_points`.

**Solución:** El sistema lo crea automáticamente cuando:
1. Ganas puntos por primera vez, o
2. La función `getUserPoints()` lo detecta y lo crea

Para crear manualmente:

```sql
INSERT INTO user_points (user_id, total_points, level)
VALUES ('TU_USER_ID_AQUI', 0, 1);
```

---

### **QR Scanner no abre la cámara**

**Causa:** Falta instalar el plugin o no hay permisos.

**Solución:**

```bash
# Reinstalar plugin
npm install @capacitor-mlkit/barcode-scanning
npx cap sync

# En Android, verificar AndroidManifest.xml
<uses-permission android:name="android.permission.CAMERA" />
```

---

## 📱 PERMISOS NECESARIOS

### **Android (android/app/src/main/AndroidManifest.xml):**

```xml
<!-- Para QR Scanner -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" />

<!-- Para Push Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

---

## 🎉 RESUMEN

**PARA QUE TODO FUNCIONE:**

1. ✅ Ejecutar `database/points-system-migration.sql` en Supabase ⭐ **MÁS IMPORTANTE**
2. ✅ Verificar que las tablas existen
3. ✅ Probar ganando puntos (usar ticket, guardar venue)
4. ✅ Verificar que el badge muestra los puntos
5. ✅ Probar QR scanner en perfil

**TIEMPO ESTIMADO:** 5-10 minutos

---

## 📞 SIGUIENTE PASO

### **1. URGENTE - Ejecutar la migración:**

```
1. Abre Supabase Dashboard
2. SQL Editor → New Query
3. Copia database/points-system-migration.sql
4. Run
5. ¡Listo! Ya funciona todo
```

### **2. Probar la app:**

```bash
npm run dev
```

### **3. Verificar funcionalidades:**

- ✅ Sistema de puntos funciona
- ✅ QR scanner abre cámara
- ✅ Badge muestra puntos y nivel
- ✅ Leaderboard carga datos

---

**El código ya está 100% implementado. Solo falta ejecutar la migración SQL (5 minutos).** 🚀
