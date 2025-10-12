-- Seeds de venues para Madrid
-- Datos de ejemplo con coordenadas reales aproximadas de diferentes barrios

INSERT INTO public.venues (name, type, lat, lng, address, avg_price_text, tickets_url, maps_url) VALUES
(
  'Teatro Kapital',
  'club',
  40.4069,
  -3.6993,
  'Calle de Atocha, 125, 28012 Madrid',
  'Entry: 20-30€, Drinks: 12-18€',
  'https://example.com/tickets/kapital',
  'https://maps.google.com/?q=40.4069,-3.6993'
),
(
  'Fabrik',
  'club',
  40.3118,
  -3.8047,
  'Av. de la Industria, 82, 28970 Humanes de Madrid',
  'Entry: 25-40€, Drinks: 15-20€',
  'https://example.com/tickets/fabrik',
  'https://maps.google.com/?q=40.3118,-3.8047'
),
(
  'Joy Eslava',
  'club',
  40.4179,
  -3.7065,
  'Calle de Arenal, 11, 28013 Madrid',
  'Entry: 15-25€, Drinks: 10-15€',
  'https://example.com/tickets/joyeslava',
  'https://maps.google.com/?q=40.4179,-3.7065'
),
(
  'Goya Social Club',
  'club',
  40.4237,
  -3.6827,
  'Calle de Jorge Juan, 19, 28001 Madrid',
  'Entry: 15-20€, Drinks: 12-16€',
  'https://example.com/tickets/goya',
  'https://maps.google.com/?q=40.4237,-3.6827'
),
(
  'Barceló Teatro',
  'club',
  40.4248,
  -3.6952,
  'Calle de Barceló, 11, 28004 Madrid',
  'Entry: 18-25€, Drinks: 12-18€',
  'https://example.com/tickets/barcelo',
  'https://maps.google.com/?q=40.4248,-3.6952'
),
(
  'Mondo Disco',
  'club',
  40.4215,
  -3.7018,
  'Calle de la Reina, 16, 28004 Madrid',
  'Entry: 12-20€, Drinks: 10-14€',
  'https://example.com/tickets/mondo',
  'https://maps.google.com/?q=40.4215,-3.7018'
),
(
  'Sala Cool',
  'club',
  40.4261,
  -3.7087,
  'Calle de Isabel la Católica, 6, 28013 Madrid',
  'Entry: 10-15€, Drinks: 8-12€',
  'https://example.com/tickets/cool',
  'https://maps.google.com/?q=40.4261,-3.7087'
),
(
  'El Sol',
  'club',
  40.4203,
  -3.7032,
  'Calle de los Jardines, 3, 28013 Madrid',
  'Entry: 12-18€, Drinks: 10-15€',
  'https://example.com/tickets/elsol',
  'https://maps.google.com/?q=40.4203,-3.7032'
),
(
  'Kapital Sunday',
  'club',
  40.4069,
  -3.6993,
  'Calle de Atocha, 125, 28012 Madrid',
  'Entry: 15-20€, Drinks: 12-16€',
  'https://example.com/tickets/kapitalsunday',
  'https://maps.google.com/?q=40.4069,-3.6993'
),
(
  'Stardust',
  'club',
  40.4256,
  -3.7079,
  'Calle del Marqués de Valdeiglesias, 3, 28004 Madrid',
  'Entry: 10-15€, Drinks: 8-12€',
  'https://example.com/tickets/stardust',
  'https://maps.google.com/?q=40.4256,-3.7079'
);