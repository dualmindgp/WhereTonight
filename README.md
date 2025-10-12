# WhereTonight 🌙

Una aplicación web progresiva donde estudiantes pueden ver en un mapa los locales (clubs/bars) y marcar con 1 ticket diario a qué sitio irán esa noche. El mapa muestra la afluencia en tiempo real basada en el conteo de tickets del día por local.

## ✨ Nuevas Funcionalidades

- **🌐 Internacionalización (i18n)**: Soporte completo para Español e Inglés
- **👤 Perfiles editables**: Avatar, nombre de usuario y biografía
- **📱 Feed Social**: Ver actividad en tiempo real de usuarios
- **📸 Subida de avatares**: Integración con Supabase Storage

## 🚀 Stack Tecnológico

- **Next.js 14** (App Router, TypeScript, Server Actions)
- **Tailwind CSS** para estilos
- **Supabase** (Postgres + Auth + RLS + Edge Functions)
- **MapLibre GL** con OpenStreetMap (sin API keys de pago)
- **Zod** para validaciones
- **Lucide React** para iconos

## 📋 Requisitos Funcionales (MVP)

- ✅ Autenticación con Supabase (Google OAuth)
- ✅ Mapa central con markers de venues en Varsovia
- ✅ Listado lateral de venues ordenado por afluencia descendente
- ✅ Sistema de 1 ticket diario por usuario (zona horaria Europe/Warsaw)
- ✅ Cards de venue con información completa
- ✅ Conteo de afluencia en tiempo real
- ✅ UI responsive (desktop/mobile)

## 🛠️ Configuración

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API para obtener tu `URL` y `anon key`
3. Ejecuta el script de la base de datos:

```sql
-- Ejecutar en SQL Editor de Supabase
-- Archivo: database/schema.sql
```

4. Ejecutar la migración para profiles y activity_feed:

```sql
-- Ejecutar en SQL Editor de Supabase  
-- Archivo: supabase/migrations/002_profiles_and_activity.sql
```

5. **IMPORTANTE: Crear bucket para avatares**:
   - Ve a Storage en el panel de Supabase
   - Crea un nuevo bucket llamado `avatars`
   - Configura como **público** (Public bucket = true)
   - Policies: Permitir subida autenticada y lectura pública

6. Configurar autenticación Google:
   - Ve a Authentication > Providers
   - Habilita Google OAuth
   - Configura las URLs de callback: `http://localhost:3000/auth/callback`

### 2. Variables de Entorno

Copia `.env.local.example` a `.env.local` y configura:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key  # Necesario para activity feed
```

### 3. Instalación

```bash
# Instalar dependencias
yarn install

# Ejecutar en desarrollo
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── venues/route.ts      # GET venues con conteos
│   │   └── ticket/route.ts      # POST usar ticket
│   ├── auth/callback/route.ts   # Callback OAuth
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Página principal
├── components/
│   ├── AuthButton.tsx           # Botón login/logout
│   ├── Map.tsx                  # Mapa con MapLibre
│   ├── VenueCard.tsx           # Card individual de venue
│   └── VenueList.tsx           # Lista lateral de venues
└── lib/
    ├── database.types.ts        # Tipos TypeScript generados
    └── supabase.ts             # Cliente de Supabase

database/
├── schema.sql                   # Esquema completo de BD
└── seeds.sql                   # Datos iniciales de venues
```

## 🎯 Funcionalidades Principales

### 🌐 Internacionalización (i18n)

- **Idiomas soportados**: Español (ES) e Inglés (EN)
- **Selector de idioma** en la página de perfil (toggle ES/EN)
- **Persistencia**: 
  - Usuario autenticado: Se guarda en `profiles.language`
  - Usuario no autenticado: Se guarda en `localStorage`
- **Traducción automática**: Toda la UI se adapta al idioma seleccionado
- **Archivos de mensajes**: `messages/es.json` y `messages/en.json`
- **40+ claves traducidas** incluyendo navegación, perfil, feed social y filtros

### 👤 Edición de Perfil

- **Avatar**: Subida de imagen (PNG, JPG, WEBP, máx. 2MB)
- **Username**: Nombre único de usuario
- **Bio**: Biografía personalizada (máx. 160 caracteres)
- **Almacenamiento**: Supabase Storage bucket `avatars`
- **Validación**: Tamaño y formato de archivos
- **Preview**: Vista previa antes de guardar

### 📱 Feed Social con Actividades

- **Actividades en tiempo real**: Ver quién va a qué local
- **Vista cronológica**: Últimas 48 horas de actividad
- **Evento automático**: Al usar ticket se crea actividad
- **Información mostrada**:
  - Avatar del usuario
  - Nombre del usuario
  - Local al que va
  - Timestamp relativo (ej: "Hace 2 horas")
- **Navegación**: Click en actividad abre ficha del local
- **Sin duplicados**: Un usuario no puede crear múltiples actividades del mismo día para el mismo local

### Sistema de Tickets Diario

- Cada usuario puede usar **1 ticket por día** (UTC estándar)
- El ticket se resetea automáticamente a medianoche
- La fecha local se calcula en el servidor para evitar manipulación
- Constraint único en BD: `(user_id, local_date)`
- **Hook automático**: Al usar ticket se crea entrada en `activity_feed`

### Mapa Interactivo

- Markers colorados según popularidad:
  - 🔴 Rojo: Popular (6+ personas)
  - 🔵 Azul: Seleccionado  
  - ⚫ Gris: Normal
- Contadores en tiempo real sobre cada marker
- Leyenda explicativa

### Seguridad

- **Row Level Security (RLS)** en todas las tablas
- Usuarios solo ven sus propios tickets
- Función RPC para conteos agregados sin exponer datos individuales
- Validación con Zod en APIs

## 🔧 Scripts Útiles

```bash
# Desarrollo
yarn dev

# Build para producción
yarn build

# Iniciar servidor de producción
yarn start

# Linting
yarn lint
```

## 🧪 Prueba Manual

1. **Registrarse** con Google OAuth
2. **Explorar** el mapa y lista de venues
3. **Usar ticket** en cualquier venue
4. **Verificar** que el conteo sube y el botón se deshabilita
5. **Comprobar** que no se puede usar otro ticket hasta el día siguiente

## 📊 Base de Datos

### Tablas Principales

- `profiles`: Perfiles de usuarios con username, avatar_url, bio y language
- `venues`: Locales fijos con coordenadas y información
- `tickets`: Tickets diarios de usuarios (unique constraint por fecha)
- `activity_feed`: Actividades sociales (evento "ticket_used")

### Vistas

- `activity_feed_view`: Join de activity_feed con profiles y venues para el feed social

### Funciones RPC

- `tickets_count_today_euwarsaw()`: Conteo agregado por venue del día actual (deprecated)
- `user_ticket_used_today()`: Verificar si usuario ya usó su ticket (deprecated)

**Nota**: Las funciones RPC han sido reemplazadas por consultas directas para mejor rendimiento

## 🌍 Zona Horaria

El sistema ha sido actualizado para usar **UTC estándar**:
- Los tickets se resetean a medianoche UTC
- La fecha local se calcula en el servidor
- Las consultas de "hoy" usan UTC
- **Escalable**: Preparado para múltiples ciudades y zonas horarias

## 📱 UI/UX

- **Responsive Design**: Funciona en desktop y mobile
- **PWA**: Progressive Web App con manifest y service worker
- **4 pestañas principales**:
  - 🏠 Inicio: Mapa interactivo
  - 🔍 Buscar: Lista de venues con filtros
  - 💬 Social: Feed de actividades
  - 👤 Perfil: Edición y configuración
- **Filtros avanzados**:
  - Rango de precio ($, $$, $$$, $$$$)
  - Rating mínimo (3.0+, 4.0+)
  - Ordenar por popularidad, rating o precio
- **Feedback visual** claro para estados de tickets
- **Enlaces externos** a Google Maps para navegación

## 🧪 Pruebas de Aceptación

### i18n
- [ ] Cambiar idioma en Perfil cambia toda la UI
- [ ] El idioma se persiste al recargar
- [ ] Usuario autenticado guarda preferencia en BD
- [ ] Usuario no autenticado guarda en localStorage

### Edición de Perfil
- [ ] Subir avatar funciona (PNG, JPG, WEBP < 2MB)
- [ ] Avatar se muestra en perfil y feed social
- [ ] Editar username y bio funciona
- [ ] Solo el usuario puede editar su propio perfil (RLS)

### Feed Social
- [ ] Al usar ticket aparece actividad inmediatamente
- [ ] Las actividades muestran avatar, nombre y local
- [ ] Click en actividad abre ficha del local
- [ ] No se pueden crear duplicados del mismo día

## 🚫 Roadmap Futuro

- Sistema de amigos
- Comentarios en locales
- Check-in con QR
- Ofertas y promociones
- Pagos integrados
- Múltiples ciudades
- Dashboard de administración
- Edición de venues desde UI
- Notificaciones push

---

**Desarrollado como aplicación funcional para conectar estudiantes** 🎉
