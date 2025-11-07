# 🧪 GUÍA DE TESTING COMPLETA - WHERETONIGHT

**Versión:** 1.0  
**Última actualización:** 7 de noviembre de 2025

---

## 📋 CHECKLIST DE TESTING PRE-LANZAMIENTO

### **FASE 1: SETUP Y CONFIGURACIÓN**

#### **1.1 Migraciones de Base de Datos**
```bash
# Ejecutar en Supabase SQL Editor:

# ✅ Paso 1: Sistema de Puntos
database/points-system-migration.sql

# ✅ Paso 2: Sistema de Afiliados
database/affiliate-system-migration.sql

# ✅ Paso 3: Verificar tablas creadas
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

# Deberías ver:
# - user_points
# - points_transactions
# - push_tokens
# - affiliate_partners
# - venue_affiliate_links
# - affiliate_clicks
# - affiliate_conversions
# - affiliate_payouts
```

**Resultado Esperado:**
- 8 nuevas tablas creadas
- 0 errores
- Datos de ejemplo en `affiliate_partners` (4 registros)

---

#### **1.2 Firebase Setup**
```bash
# 1. Crear proyecto Firebase
https://console.firebase.google.com

# 2. Configurar Cloud Messaging
# 3. Descargar google-services.json
# 4. Colocar en: android/app/

# 5. Verificar archivo:
cat android/app/google-services.json

# 6. Rebuild:
npx cap sync
npx cap open android
```

**Resultado Esperado:**
- Archivo google-services.json en lugar correcto
- Build sin errores
- App inicia correctamente

---

### **FASE 2: TESTING FUNCIONAL**

#### **2.1 Sistema de Autenticación**

**Test 1: Login con Email**
```
1. Abrir app
2. Click "Login"
3. Email: test@wheretonight.com
4. Password: Test123!
5. Click "Login"

✅ Resultado Esperado:
- Login exitoso
- Redirige a mapa
- Usuario en navbar
```

**Test 2: Login con Google**
```
1. Click "Login with Google"
2. Seleccionar cuenta
3. Autorizar

✅ Resultado Esperado:
- OAuth flow correcto
- Login exitoso
- Perfil creado automáticamente
```

**Test 3: Logout**
```
1. Ir a Perfil
2. Click "Configuración"
3. Click "Cerrar Sesión"

✅ Resultado Esperado:
- Logout exitoso
- Redirige a pantalla login
- Estado limpiado
```

---

#### **2.2 Sistema de Puntos y Gamificación**

**Test 1: Ver Puntos en Perfil**
```
1. Login
2. Ir a pestaña "Perfil"
3. Buscar sección con ⭐

✅ Resultado Esperado:
- Muestra "0 Puntos" (usuario nuevo)
- Muestra "Nivel 1"
- Cards con gradiente amarillo/naranja visible
```

**Test 2: Ganar Puntos Guardando Venue**
```
1. Ir al Mapa
2. Click en cualquier venue (marcador)
3. En VenueSheet, click en ⭐ (Guardar)
4. Esperar toast "¡+5 puntos! ⭐"
5. Volver a Perfil

✅ Resultado Esperado:
- Toast de confirmación aparece
- Puntos actualizados: "5 Puntos"
- Nivel sigue en 1
```

**Test 3: Ganar Puntos Compartiendo**
```
1. Abrir venue
2. Click en botón compartir (Share2 icon)
3. Seleccionar método (WhatsApp, etc.)
4. Confirmar share
5. Volver a app
6. Verificar puntos

✅ Resultado Esperado:
- Share funciona
- Toast "¡+5 puntos! ⭐"
- Total: 10 puntos
```

**Test 4: Verificar en Base de Datos**
```sql
-- En Supabase SQL Editor:
SELECT * FROM user_points WHERE user_id = 'TU_USER_ID';
SELECT * FROM points_transactions WHERE user_id = 'TU_USER_ID' ORDER BY created_at DESC;

✅ Resultado Esperado:
- user_points: total_points = 10, level = 1
- points_transactions: 2 registros (VENUE_SAVED, VENUE_SHARED)
```

---

#### **2.3 QR Scanner**

**Test 1: Abrir Scanner**
```
1. Ir a Perfil
2. Buscar botón "🔳 Escanear Código QR"
3. Click en botón

✅ Resultado Esperado:
- Se abre modal fullscreen
- Fondo oscuro/negro
- Marco de escaneo visible
- Línea animada moviéndose
- Botón "Cerrar" visible
```

**Test 2: Permisos de Cámara**
```
1. Primera vez: sistema pide permiso cámara
2. Aceptar permiso

✅ Resultado Esperado:
- Permiso solicitado
- Al aceptar: video de cámara visible
- Al rechazar: mensaje de error claro
```

**Test 3: Escanear Código QR**
```
1. Generar QR de prueba: https://www.qr-code-generator.com/
2. Contenido: "WHERETONIGHT_TEST_123"
3. Escanear con la app

✅ Resultado Esperado:
- QR detectado automáticamente
- Toast o alert con contenido
- Scanner se cierra
```

**Test 4: Botón de Prueba**
```
1. Abrir scanner
2. Click "🧪 Probar Escáner (Demo)"

✅ Resultado Esperado:
- Toast: "QR escaneado: DEMO_CODE_12345"
- Scanner permanece abierto
```

---

#### **2.4 Sistema de Compartir**

**Test 1: Compartir Venue (Móvil)**
```
1. Abrir venue en VenueSheet
2. Click botón Share2
3. Ver menú del sistema

✅ Resultado Esperado (Android):
- Share sheet nativo de Android
- Opciones: WhatsApp, Instagram, Telegram, etc.
- Al compartir: mensaje con nombre del venue

✅ Resultado Esperado (iOS):
- Activity sheet nativo de iOS
- Opciones disponibles del sistema
```

**Test 2: Compartir Venue (Web)**
```
1. Abrir en navegador: http://localhost:3001
2. Login
3. Abrir venue
4. Click compartir

✅ Resultado Esperado:
- Si browser soporta Web Share API: menú nativo
- Si no: toast "Link copiado al portapapeles"
- Clipboard contiene: "Nombre del Venue | Dirección"
```

---

#### **2.5 Push Notifications**

**Test 1: Registro de Token**
```
1. Abrir app en móvil
2. Aceptar permisos de notificaciones
3. Verificar en Supabase:

SELECT * FROM push_tokens WHERE user_id = 'TU_USER_ID';

✅ Resultado Esperado:
- Token registrado en tabla
- Platform: 'android' o 'ios'
- created_at: fecha actual
```

**Test 2: Recibir Notificación (Firebase Console)**
```
1. Ir a Firebase Console
2. Cloud Messaging
3. "Send your first message"
4. Target: token específico (copiar de DB)
5. Send

✅ Resultado Esperado:
- Notificación recibida en device
- Al tap: app se abre
- Contenido correcto
```

**Test 3: Notificación en Background**
```
1. Minimizar app
2. Enviar notificación desde Firebase
3. Verificar en bandeja de notificaciones

✅ Resultado Esperado:
- Notificación aparece
- Sonido/vibración
- Al tap: app se abre en pantalla correcta
```

---

#### **2.6 Búsqueda y Filtros**

**Test 1: Búsqueda Básica**
```
1. Ir al Mapa
2. Usar barra de búsqueda
3. Escribir: "Bar"
4. Esperar resultados

✅ Resultado Esperado:
- Resultados aparecen mientras escribes
- Lista ordenada por relevancia
- Al menos 5-10 resultados
- Click en resultado: centra mapa
```

**Test 2: Filtros**
```
1. Click en botón de filtros
2. Seleccionar "Bar"
3. Aplicar filtro

✅ Resultado Esperado:
- Solo marcadores de tipo "Bar" visibles
- Contador actualizado
- Otros tipos ocultos
```

**Test 3: Búsqueda con Ciudad**
```
1. Click selector de ciudad
2. Cambiar a otra ciudad
3. Verificar venues

✅ Resultado Esperado:
- Mapa se centra en nueva ciudad
- Venues de esa ciudad se cargan
- Búsqueda se actualiza
```

---

#### **2.7 Sistema de Amigos**

**Test 1: Añadir Amigo**
```
1. Ir a Perfil
2. Sección "Amigos"
3. Click "➕ Añadir Amigo"
4. Buscar por nombre de usuario
5. Enviar solicitud

✅ Resultado Esperado:
- Búsqueda funciona
- Solicitud enviada
- Estado: "Pendiente"
```

**Test 2: Aceptar Solicitud**
```
1. Con otra cuenta, recibir solicitud
2. Ir a notificaciones/solicitudes
3. Aceptar

✅ Resultado Esperado:
- Ambos usuarios ahora amigos
- Aparecen en lista de amigos
- Pueden ver actividad mutua
```

**Test 3: Ver Actividad de Amigos**
```
1. Ir a Feed/Home
2. Ver actividad de amigos

✅ Resultado Esperado:
- Lista de actividades recientes
- "Juan guardó X venue"
- "María fue a Y lugar"
- Timestamps correctos
```

---

#### **2.8 Mapa Interactivo**

**Test 1: Ver Marcadores**
```
1. Abrir mapa
2. Esperar carga

✅ Resultado Esperado:
- Marcadores visibles
- Diferentes colores por tipo
- Clusters en zoom out
- Individual en zoom in
```

**Test 2: Click en Marcador**
```
1. Click en marcador
2. Ver popup/tooltip
3. Click en popup

✅ Resultado Esperado:
- Popup muestra nombre venue
- Tipo y dirección visible
- Click abre VenueSheet completo
```

**Test 3: Navegación del Mapa**
```
1. Zoom in/out
2. Pan (arrastrar)
3. Rotar (2 dedos)

✅ Resultado Esperado:
- Movimiento fluido
- Sin lag
- Marcadores se actualizan correctamente
```

---

### **FASE 3: TESTING DE PERFORMANCE**

#### **3.1 Tiempo de Carga**

**Test: Initial Load**
```
1. Cerrar app completamente
2. Abrir app
3. Medir tiempo hasta mapa visible

✅ Objetivo:
- < 3 segundos en WiFi
- < 5 segundos en 4G
```

**Test: Load de Venues**
```
1. Cambiar de ciudad
2. Medir tiempo de carga

✅ Objetivo:
- < 2 segundos
- Spinner/loading visible
```

---

#### **3.2 Memoria y CPU**

**Test: Memory Leaks**
```
1. Usar app por 10 minutos
2. Navegar entre pantallas repetidamente
3. Monitorear memoria en Android Studio

✅ Objetivo:
- Memoria estable (no crece indefinidamente)
- < 200MB usage normal
```

**Test: CPU Usage**
```
1. Monitor CPU durante uso normal

✅ Objetivo:
- < 20% en idle
- < 60% durante uso activo
```

---

#### **3.3 Batería**

**Test: Battery Drain**
```
1. Usar app por 1 hora continua
2. Medir consumo de batería

✅ Objetivo:
- < 15% consumo por hora
- No drain en background
```

---

### **FASE 4: TESTING DE ERRORES**

#### **4.1 Sin Conexión**

**Test: Offline**
```
1. Activar modo avión
2. Intentar usar app

✅ Resultado Esperado:
- Mensaje claro: "Sin conexión"
- No crash
- Datos cacheados visibles
- Reconexión automática al restaurar internet
```

---

#### **4.2 Datos Corruptos**

**Test: Venue Sin Imagen**
```
1. Crear venue en DB sin imagen
2. Abrir en app

✅ Resultado Esperado:
- Placeholder image
- No error
- Todo lo demás funciona
```

---

#### **4.3 Estados Edge**

**Test: Usuario Sin Puntos**
```
1. Usuario nuevo
2. Ver perfil

✅ Resultado Esperado:
- Muestra "0 Puntos"
- No error
```

**Test: Venue Sin Datos Opcionales**
```
1. Venue sin precio, sin horario
2. Abrir VenueSheet

✅ Resultado Esperado:
- Secciones ocultas o con placeholder
- No crash
```

---

### **FASE 5: TESTING MULTIPLATAFORMA**

#### **5.1 Android**

**Dispositivos a Probar:**
- [ ] Android 12+
- [ ] Android 11
- [ ] Android 10
- [ ] Diferentes tamaños: phone, tablet

**Checklist:**
- [ ] Todas las funcionalidades funcionan
- [ ] UI se ve bien en todos los tamaños
- [ ] Push notifications funcionan
- [ ] QR scanner funciona
- [ ] Share funciona

---

#### **5.2 iOS** (Si aplica)

**Dispositivos a Probar:**
- [ ] iOS 16+
- [ ] iOS 15
- [ ] iPhone y iPad

**Checklist:**
- [ ] Todas las funcionalidades funcionan
- [ ] UI se adapta a notch/dynamic island
- [ ] Push notifications funcionan
- [ ] QR scanner funciona
- [ ] Share funciona

---

#### **5.3 Web**

**Browsers a Probar:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Checklist:**
- [ ] Todas las funcionalidades funcionan
- [ ] Responsive design
- [ ] PWA installable
- [ ] Offline funciona

---

### **FASE 6: TESTING DE SEGURIDAD**

#### **6.1 Autenticación**

**Test: Session Persistence**
```
1. Login
2. Cerrar app
3. Abrir app

✅ Resultado Esperado:
- Session persiste
- No necesita login de nuevo
```

**Test: Session Expiry**
```
1. Esperar 7 días (o modificar token manually)
2. Intentar acción autenticada

✅ Resultado Esperado:
- Token refresh automático
- O redirect a login si expiró
```

---

#### **6.2 RLS (Row Level Security)**

**Test: Ver Solo Propios Datos**
```
sql
-- Intentar ver puntos de otro usuario
SELECT * FROM user_points WHERE user_id != 'TU_USER_ID';

✅ Resultado Esperado:
- 0 resultados
- RLS bloquea acceso
```

---

### **FASE 7: TESTING DE INTEGRACIÓN**

#### **7.1 Sistema de Afiliados (Cuando se implemente)**

**Test: Track Click**
```
1. Click en "Comprar Entrada"
2. Verificar en DB:

SELECT * FROM affiliate_clicks WHERE user_id = 'TU_USER_ID' ORDER BY clicked_at DESC LIMIT 1;

✅ Resultado Esperado:
- Registro creado
- click_token único
- user_agent correcto
```

---

## 📊 REPORTE DE TESTING

### **Template de Reporte:**

```markdown
# Testing Report - [Fecha]

## Ejecutado por: [Nombre]
## Dispositivo: [Modelo, OS version]

### Resultados:
- ✅ Tests Pasados: X/Y
- ⚠️ Tests Con Warnings: Z
- ❌ Tests Fallados: W

### Issues Encontrados:
1. [Descripción del issue]
   - Severidad: Alta/Media/Baja
   - Steps to reproduce:
   - Screenshot/Video:

### Recomendaciones:
- [Lista de mejoras]
```

---

## ✅ CHECKLIST FINAL PRE-LANZAMIENTO

- [ ] Todas las migraciones SQL ejecutadas
- [ ] Firebase configurado
- [ ] Testing en 3+ dispositivos Android
- [ ] Testing en 2+ navegadores web
- [ ] 0 crashes en testing
- [ ] Performance aceptable
- [ ] Funcionalidades core al 100%
- [ ] Backup de base de datos realizado
- [ ] Error monitoring configurado (Sentry)
- [ ] Analytics configurado

---

**¡Listo para lanzar!** 🚀

---

**Última actualización:** 7 de noviembre de 2025
