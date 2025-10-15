-- Seeds de venues para Madrid
-- NOTA: Este archivo es solo de referencia. 
-- Para poblar la base de datos con datos reales de Google Places API, usa:
-- npm run seed:madrid
--
-- El script automáticamente obtendrá:
-- - place_id (ID único de Google Places)
-- - photo_refs (referencias de múltiples fotos)
-- - rating (calificación de Google)
-- - price_level (nivel de precio 0-4)
-- - coordenadas exactas
-- - dirección verificada
-- - website oficial
--
-- DISCOTECAS A AÑADIR (añade más nombres aquí):
-- Teatro Kapital Madrid
-- Fabrik Club Madrid
-- Joy Eslava Madrid
-- Goya Social Club Madrid
-- Barceló Teatro Madrid
-- Mondo Disco Madrid
-- Sala Cool Madrid
-- El Sol Madrid
-- Stardust Madrid
-- Shoko Madrid
-- Opium Madrid
-- Gabana 1800 Madrid
-- Sala But Madrid
-- Independance Club Madrid
-- Changó Madrid
-- Florida Retiro Madrid
-- Blackhaus Madrid
-- Delirio Madrid
-- Teatro Eslava Madrid
-- Macumba Madrid
--
-- Para añadir más discotecas:
-- 1. Añade el nombre en la lista de arriba
-- 2. Abre scripts/seed-madrid.ts
-- 3. Añade el nombre al array VENUES_TO_SEARCH
-- 4. Ejecuta: npm run seed:madrid

-- Datos de ejemplo (sin place_id ni datos reales de Google)
-- ESTOS SERÁN REEMPLAZADOS por el script de seeding

INSERT INTO public.venues (name, type, lat, lng, address, avg_price_text) VALUES
('Teatro Kapital', 'club', 40.4069, -3.6993, 'Calle de Atocha, 125, 28012 Madrid', 'Entrada: 15-30€, Copas: 10-18€'),
('Fabrik', 'club', 40.3118, -3.8047, 'Av. de la Industria, 82, 28970 Humanes de Madrid', 'Entrada: 15-30€, Copas: 10-18€'),
('Joy Eslava', 'club', 40.4179, -3.7065, 'Calle de Arenal, 11, 28013 Madrid', 'Entrada: 15-30€, Copas: 10-18€'),
('Goya Social Club', 'club', 40.4237, -3.6827, 'Calle de Jorge Juan, 19, 28001 Madrid', 'Entrada: 15-30€, Copas: 10-18€'),
('Barceló Teatro', 'bar', 40.4248, -3.6952, 'Calle de Barceló, 11, 28004 Madrid', 'Entrada: 10-20€, Copas: 8-15€'),
('Mondo Disco', 'club', 40.4215, -3.7018, 'Calle de la Reina, 16, 28004 Madrid', 'Entrada: 15-30€, Copas: 10-18€'),
('Sala Cool', 'bar', 40.4261, -3.7087, 'Calle de Isabel la Católica, 6, 28013 Madrid', 'Entrada: 10-20€, Copas: 8-15€'),
('El Sol', 'bar', 40.4203, -3.7032, 'Calle de los Jardines, 3, 28013 Madrid', 'Entrada: 10-20€, Copas: 8-15€'),
('Stardust', 'bar', 40.4256, -3.7079, 'Calle del Marqués de Valdeiglesias, 3, 28004 Madrid', 'Entrada: 10-20€, Copas: 8-15€'),
('Shoko Madrid', 'club', 40.4167, -3.6925, 'Calle de Toledo, 86, 28005 Madrid', 'Entrada: 15-30€, Copas: 10-18€'),
('Opium Madrid', 'club', 40.4150, -3.6940, 'Calle de José Abascal, 56, 28003 Madrid', 'Entrada: 15-30€, Copas: 10-18€')
ON CONFLICT (place_id) DO NOTHING;