-- LIMPIEZA AUTOMÁTICA DE POSTS Y ACTIVIDADES ANTIGUAS
-- Este script configura la eliminación automática de contenido con más de 24 horas

-- Función para limpiar posts sociales antiguos (más de 24 horas)
CREATE OR REPLACE FUNCTION cleanup_old_social_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.social_posts
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Función para limpiar actividades antiguas (más de 24 horas)
CREATE OR REPLACE FUNCTION cleanup_old_activities()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.activity_feed
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Nota: Para ejecutar estas funciones automáticamente cada hora,
-- necesitas configurar pg_cron en Supabase (disponible en planes Pro)
-- O puedes ejecutarlas manualmente de forma periódica

-- Ejemplo de configuración con pg_cron (solo para planes Pro):
/*
SELECT cron.schedule(
  'cleanup-old-social-posts',
  '0 * * * *', -- Cada hora en punto
  $$SELECT cleanup_old_social_posts()$$
);

SELECT cron.schedule(
  'cleanup-old-activities',
  '0 * * * *', -- Cada hora en punto
  $$SELECT cleanup_old_activities()$$
);
*/

-- Alternativa: Ejecutar manualmente estas funciones periódicamente
-- SELECT cleanup_old_social_posts();
-- SELECT cleanup_old_activities();

-- Grant permisos para ejecutar las funciones
GRANT EXECUTE ON FUNCTION cleanup_old_social_posts() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_activities() TO service_role;

-- Comentarios
COMMENT ON FUNCTION cleanup_old_social_posts() IS 'Elimina posts sociales con más de 24 horas de antigüedad';
COMMENT ON FUNCTION cleanup_old_activities() IS 'Elimina actividades con más de 24 horas de antigüedad';
