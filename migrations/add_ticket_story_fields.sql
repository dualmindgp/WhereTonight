-- Migración: Añadir campos para historias de tickets
-- Fecha: 16 de Noviembre, 2025
-- Descripción: Añade campos para soportar historias automáticas cuando un usuario compra una entrada

-- Añadir columna para identificar historias de tickets
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS is_ticket_story BOOLEAN DEFAULT FALSE;

-- Añadir columna para guardar el ID del venue asociado
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;

-- Añadir columna para guardar el nombre del venue (denormalizado para performance)
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_name TEXT;

-- Añadir columna para guardar la URL de la foto del venue
ALTER TABLE social_posts
ADD COLUMN IF NOT EXISTS venue_photo TEXT;

-- Crear índice para consultas por venue_id
CREATE INDEX IF NOT EXISTS idx_social_posts_venue_id ON social_posts(venue_id) WHERE venue_id IS NOT NULL;

-- Crear índice para identificar historias de tickets
CREATE INDEX IF NOT EXISTS idx_social_posts_is_ticket_story ON social_posts(is_ticket_story) WHERE is_ticket_story = TRUE;

-- Comentarios para documentación
COMMENT ON COLUMN social_posts.is_ticket_story IS 'Indica si el post fue creado automáticamente al comprar una entrada';
COMMENT ON COLUMN social_posts.venue_id IS 'ID del venue al que se refiere este post (si es historia de ticket)';
COMMENT ON COLUMN social_posts.venue_name IS 'Nombre del venue (denormalizado para performance)';
COMMENT ON COLUMN social_posts.venue_photo IS 'URL de la foto del venue para mostrar en la historia';

-- Actualizar la vista social_posts_with_user para incluir los nuevos campos
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

-- Grant permisos necesarios
GRANT SELECT ON social_posts_with_user TO authenticated;
GRANT SELECT ON social_posts_with_user TO anon;
