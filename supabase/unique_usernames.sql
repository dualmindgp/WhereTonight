-- CREAR ÍNDICE ÚNICO PARA NOMBRES DE USUARIO
-- Ejecuta esto en Supabase SQL Editor

-- 1. Primero, asegurarse de que no hay nombres duplicados
-- Si hay duplicados, este query los mostrará:
SELECT username, COUNT(*) as count
FROM profiles
WHERE username IS NOT NULL
GROUP BY LOWER(username)
HAVING COUNT(*) > 1;

-- 2. Si hay duplicados, puedes resolverlos así:
-- UPDATE profiles SET username = username || '_' || SUBSTRING(id::text, 1, 4)
-- WHERE id IN (
--   SELECT id FROM (
--     SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(username) ORDER BY created_at) as rn
--     FROM profiles
--     WHERE username IS NOT NULL
--   ) t WHERE rn > 1
-- );

-- 3. Crear índice único para username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS unique_username_lower 
ON profiles (LOWER(username));

-- 4. Verificar que el índice se creó
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND indexname = 'unique_username_lower';

-- Resultado esperado: "Índice único creado correctamente"
SELECT 'Índice único creado correctamente' as resultado;
