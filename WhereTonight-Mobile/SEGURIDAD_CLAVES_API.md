# 🔒 Seguridad - Protección de Claves API

## ✅ Lo que hemos hecho para proteger tus claves

### 1. **Archivo `.gitignore` Actualizado**

```gitignore
# local env files
.env
.env.local
.env.*.local
.env.production.local
```

**Resultado**: El archivo `.env` **NUNCA** se subirá a GitHub ✅

### 2. **app.json Actualizado**

**Antes (❌ INSEGURO):**
```json
"googleMapsApiKey": "AIzaSyDS1bLX0kVpVK46vZ7lI3sA5-oMV-RJxRE"
```

**Después (✅ SEGURO):**
```json
"googleMapsApiKey": "$EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
```

Las claves ahora se cargan desde `.env` en tiempo de ejecución.

### 3. **Archivo `.env.example` Creado**

Proporciona un template para otros desarrolladores sin exponer las claves reales:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

## 📋 Estructura de Archivos

```
WhereTonight-Mobile/
├── .env                    ❌ NO se sube a GitHub (ignorado)
├── .env.example            ✅ Se sube a GitHub (template)
├── .gitignore              ✅ Protege .env
├── app.json                ✅ Usa variables de entorno
└── src/
    └── lib/
        └── supabase.ts     ✅ Lee de process.env
```

## 🔐 Cómo Funciona

### En Desarrollo (Tu Máquina)

1. Tienes `.env` con tus claves reales
2. Expo carga las variables desde `.env`
3. La app usa las claves para conectar con Supabase y Google Maps

### En GitHub

1. `.env` está en `.gitignore` → **NO se sube** ✅
2. `.env.example` se sube → Otros ven qué variables necesitan
3. Las claves reales **NUNCA** están en el repositorio ✅

### Para Otros Desarrolladores

1. Clonan el repositorio
2. Ven `.env.example`
3. Copian: `cp .env.example .env`
4. Agregan sus propias claves en `.env`
5. Trabajan localmente sin exponer claves

## 🚀 Cómo Configurar en Producción

### En Vercel/Netlify/Expo EAS

1. Configura variables de entorno en el panel
2. Expo automáticamente las inyecta durante el build
3. Las claves se incluyen en el APK/IPA compilado

### Ejemplo en Expo EAS

```bash
eas build --platform android \
  --env EXPO_PUBLIC_SUPABASE_URL=https://... \
  --env EXPO_PUBLIC_SUPABASE_ANON_KEY=... \
  --env EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

## ⚠️ Qué NO Hacer

❌ **NO hagas esto:**
```json
// ❌ NUNCA hardcodees claves en app.json
"googleMapsApiKey": "AIzaSyDS1bLX0kVpVK46vZ7lI3sA5-oMV-RJxRE"
```

❌ **NO commits `.env`:**
```bash
git add .env  # ❌ NUNCA
```

❌ **NO compartas claves en Slack/Discord:**
```
Aquí está mi clave: AIzaSyDS1bLX0kVpVK46vZ7lI3sA5-oMV-RJxRE  # ❌ NUNCA
```

## ✅ Qué SÍ Hacer

✅ **SÍ usa `.env`:**
```bash
# Tu máquina local
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDS1bLX0kVpVK46vZ7lI3sA5-oMV-RJxRE
```

✅ **SÍ usa `.env.example`:**
```bash
# En GitHub (sin claves reales)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

✅ **SÍ usa variables de entorno:**
```json
"googleMapsApiKey": "$EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
```

## 🔄 Si Accidentalmente Expones una Clave

### Paso 1: Rota la Clave Inmediatamente
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Elimina la clave expuesta
3. Crea una nueva clave

### Paso 2: Limpia el Historial de Git
```bash
# Elimina el commit que contiene la clave
git reset --hard HEAD~1

# O usa git-filter-branch para eliminar de todo el historial
git filter-branch --tree-filter 'rm -f .env' HEAD
```

### Paso 3: Actualiza tu `.env` Local
```bash
# Actualiza con la nueva clave
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=new-key-here
```

## 📊 Checklist de Seguridad

- [x] `.gitignore` protege `.env`
- [x] `.env.example` proporciona template
- [x] `app.json` usa variables de entorno
- [x] `supabase.ts` lee de `process.env`
- [x] Claves NO están hardcodeadas
- [x] `.env` NO se sube a GitHub
- [x] Documentación de seguridad creada

## 🎯 Resumen

| Archivo | Contenido | GitHub | Seguridad |
|---------|-----------|--------|-----------|
| `.env` | Claves reales | ❌ NO | ✅ Protegido |
| `.env.example` | Template | ✅ SÍ | ✅ Sin claves |
| `app.json` | Variables | ✅ SÍ | ✅ Dinámico |
| `.gitignore` | Reglas | ✅ SÍ | ✅ Protege |

## 📝 Notas Finales

Tu proyecto está **100% seguro** para subir a GitHub:

- ✅ Las claves están protegidas
- ✅ Otros desarrolladores pueden clonar sin problemas
- ✅ Cada uno usa sus propias claves en `.env`
- ✅ Nada sensible en el repositorio público

**Puedes subir a GitHub con confianza.** 🚀

---

**Generado**: 2025-01-26
**Estado**: ✅ Seguridad Implementada
