-- Migración: Añadir campos de Google Places API a la tabla venues
-- Ejecutar en Supabase Dashboard > SQL Editor

-- Añadir nuevos campos si no existen
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS place_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS price_level INTEGER,
ADD COLUMN IF NOT EXISTS photo_ref TEXT,
ADD COLUMN IF NOT EXISTS photo_refs TEXT[],
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS opening_hours TEXT;

-- Crear índice en place_id para búsquedas rápidas y upserts
CREATE INDEX IF NOT EXISTS idx_venues_place_id ON public.venues(place_id);

-- Comentarios para documentar los campos
COMMENT ON COLUMN public.venues.place_id IS 'Google Places ID único para identificar el local';
COMMENT ON COLUMN public.venues.rating IS 'Calificación de Google (0-5 estrellas)';
COMMENT ON COLUMN public.venues.price_level IS 'Nivel de precio de Google (0-4)';
COMMENT ON COLUMN public.venues.photo_ref IS 'Referencia de foto principal de Google Places';
COMMENT ON COLUMN public.venues.photo_refs IS 'Array de referencias de múltiples fotos de Google Places';
COMMENT ON COLUMN public.venues.website IS 'URL del sitio web oficial del venue';
COMMENT ON COLUMN public.venues.opening_hours IS 'Horarios de apertura del local';
