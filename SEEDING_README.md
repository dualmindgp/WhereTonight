# 🌟 Venues Seeding Guide - WhereTonight

Esta guía te explica cómo poblar tu base de datos con datos reales de Google Places API.

## 📋 Prerrequisitos

### 1. Variables de entorno en `.env.local`
Añade estas variables a tu archivo `.env.local`:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Google Places API
GOOGLE_MAPS_API_KEY=tu_google_places_api_key_aqui
```

**⚠️ IMPORTANTE:** Usa el `SUPABASE_SERVICE_ROLE_KEY`, NO el `SUPABASE_ANON_KEY`. El service role key tiene permisos para insertar datos.

### 2. Estructura de la tabla venues
Ejecuta este SQL en tu dashboard de Supabase:

```sql
-- Actualizar la tabla venues para incluir los nuevos campos
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS place_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS rating FLOAT,
ADD COLUMN IF NOT EXISTS price_level INTEGER,
ADD COLUMN IF NOT EXISTS photo_ref TEXT,
ADD COLUMN IF NOT EXISTS maps_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Crear índice en place_id para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_venues_place_id ON venues(place_id);
```

## 🚀 Instalación y ejecución

### 1. Instalar dependencias
```bash
yarn install
```

### 2. Ejecutar el script de seeding
```bash
yarn seed:venues
```

## 🎯 Locales que se van a poblar

El script buscará estos 6 locales en Varsovia:
1. MultiPub "Pod Grubą Kaśką"
2. Teatro Cubano Warsaw
3. Club Room 13
4. BLU Club
5. Chicas & Gorillas Warszawa
6. Level 27 Warsaw

## 📊 Datos que se obtienen

Para cada local, el script obtiene:
- **place_id**: ID único de Google Places
- **name**: Nombre del local
- **address**: Dirección completa
- **lat/lng**: Coordenadas geográficas
- **rating**: Puntuación en Google (1-5 estrellas)
- **price_level**: Nivel de precios (0-4)
- **photo_ref**: Referencia de la primera foto
- **maps_url**: URL a Google Maps
- **website**: Sitio web del local (si existe)
- **type**: Tipo de local ('club', 'bar', 'other')
- **avg_price_text**: Texto descriptivo de precios

## 🖼️ Mostrar fotos en tu app

Una vez que tengas los `photo_ref` en la base de datos, puedes mostrar las fotos usando:

```jsx
<img src="/api/photo?ref={venue.photo_ref}" alt={venue.name} />
```

El endpoint `/api/photo` actúa como proxy seguro y cachea las imágenes por 7 días.

## 🔍 Verificar resultados

### En Supabase
1. Ve a tu dashboard de Supabase
2. Navega a la tabla `venues`
3. Deberías ver los 6 locales con todos sus datos

### En tu aplicación
1. Ejecuta `yarn dev`
2. Los nuevos locales aparecerán en el mapa
3. Las fotos se cargarán automáticamente

## 🛠️ Troubleshooting

### Error: "SUPABASE_SERVICE_ROLE_KEY not found"
- Verifica que el archivo `.env.local` existe
- Asegúrate de usar el SERVICE ROLE KEY, no el ANON KEY
- El SERVICE ROLE KEY debería empezar con `eyJ...`

### Error: "Google API error: 403"
- Verifica tu `GOOGLE_MAPS_API_KEY`
- Asegúrate de que tienes habilitadas estas APIs:
  - Places API (New)
  - Places API
  - Maps JavaScript API

### Error: "No place found for venue"
- Algunos locales pueden tener nombres diferentes en Google
- El script continúa con los otros locales
- Puedes modificar los nombres en `VENUES_TO_SEARCH`

### Error de tipos TypeScript
- Ejecuta `yarn install` para instalar todas las dependencias
- Asegúrate de que tienes `tsx` y `dotenv` instalados

## 📝 Personalización

### Añadir más locales
Edita el array `VENUES_TO_SEARCH` en `scripts/seed-venues.ts`:

```typescript
const VENUES_TO_SEARCH = [
  'Tu local favorito Warsaw',
  // ... más locales
]
```

### Cambiar tipos de locales
Modifica la lógica en la sección "Determinar el tipo de local":

```typescript
if (name.includes('restaurant')) {
  type = 'restaurant'
  avgPriceText = 'Plato principal: 40-80 PLN'
}
```

## ⚡ Script automático vs Manual

### Script automático (recomendado)
```bash
yarn seed:venues
```

### Via API endpoint (alternativo)
```bash
curl -X POST http://localhost:3001/api/seed-venues
```

¡Listo! 🎉 Ahora tienes tu base de datos poblada con datos reales de Google Places.
