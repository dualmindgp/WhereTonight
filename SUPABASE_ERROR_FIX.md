# 🔧 Solución al Error de Supabase (fetch failed)

## ❌ Problema

El error `TypeError: fetch failed` ocurre cuando las variables de entorno de Supabase no están configuradas correctamente o contienen valores inválidos.

## ✅ Solución

### Paso 1: Verificar archivo `.env.local`

1. Asegúrate de que existe el archivo `.env.local` en la raíz del proyecto
2. Si no existe, créalo copiando `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

### Paso 2: Configurar las variables de entorno

Abre `.env.local` y asegúrate de que tiene estas variables con **VALORES REALES** (no los del ejemplo):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-real-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-real-aqui

# Google Maps (opcional)
GOOGLE_MAPS_API_KEY=tu-google-maps-api-key
```

### Paso 3: Obtener las credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (⚠️ secreto) → `SUPABASE_SERVICE_ROLE_KEY`

### Paso 4: Reiniciar el servidor

Después de editar `.env.local`, **debes reiniciar el servidor de desarrollo**:

```bash
# Detén el servidor (Ctrl+C)
# Luego inicia de nuevo:
npm run dev
```

## 🔍 Nuevos Mensajes de Error

Ahora el sistema mostrará mensajes más claros si hay problemas:

### ❌ Si la URL no está configurada:
```
❌ ERROR: SUPABASE_URL no está configurada
Variables disponibles:
  NEXT_PUBLIC_SUPABASE_URL: NO EXISTE
  SUPABASE_URL: NO EXISTE
```

### ❌ Si la URL tiene formato inválido:
```
❌ ERROR: SUPABASE_URL tiene formato inválido: invalid-url
Expected format: https://your-project.supabase.co
```

### ❌ Si la URL es el valor de ejemplo:
```
❌ ERROR: SUPABASE_URL contiene el valor de ejemplo
SUPABASE_URL is still set to the example value
```

### ✅ Si todo está correcto:
```
✅ Supabase configurado correctamente:
  url: https://abcdefghij.supabase...
  keyLength: 218
```

## 🧪 Verificar que funciona

1. Inicia el servidor: `npm run dev`
2. Abre el navegador en `http://localhost:3001`
3. Revisa la consola del terminal:
   - Deberías ver: `✅ Supabase configurado correctamente`
   - Si hay errores, lee el mensaje específico

4. En la aplicación web, deberías ver los venues cargados correctamente
5. En la consola del terminal:
   ```
   🔵 [/api/venues] Iniciando consulta de venues...
   ✅ [/api/venues] Venues obtenidos: X
   ```

## 📝 Archivos Modificados

### `src/lib/supabase-server.ts`
- ✅ Validación de existencia de variables
- ✅ Validación de formato de URL
- ✅ Detección de valores de ejemplo
- ✅ Mensajes de error claros

### `src/app/api/venues/route.ts`
- ✅ Logging detallado de operaciones
- ✅ Mejores mensajes de error
- ✅ Información de debug útil

## 🆘 ¿Sigues teniendo problemas?

1. **Verifica que `.env.local` existe** en la raíz del proyecto
2. **Reinicia el servidor** después de cambiar `.env.local`
3. **Revisa los mensajes en la consola** - ahora son más descriptivos
4. **Verifica tu conexión a internet** - Supabase necesita acceso a la red
5. **Verifica que tu proyecto de Supabase está activo** en el dashboard

## 🔒 Seguridad

⚠️ **NUNCA compartas** `SUPABASE_SERVICE_ROLE_KEY` públicamente
⚠️ **NUNCA subas** `.env.local` a Git (ya está en .gitignore)
✅ Solo comparte las claves `NEXT_PUBLIC_*` si es necesario
