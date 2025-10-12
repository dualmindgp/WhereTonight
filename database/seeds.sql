-- Seeds de venues para Varsovia
-- Datos de ejemplo con coordenadas reales aproximadas de diferentes barrios

INSERT INTO public.venues (name, type, lat, lng, address, avg_price_text, tickets_url, maps_url) VALUES
(
  'Club Nova',
  'club',
  52.2297,
  21.0122,
  'ul. Nowy Świat 25, 00-029 Warszawa',
  'Entry: 30-50 PLN, Drinks: 25-35 PLN',
  'https://example.com/tickets/nova',
  'https://maps.google.com/?q=52.2297,21.0122'
),
(
  'Vistula Bar',
  'bar',
  52.2319,
  21.0269,
  'ul. Wybrzeże Kościuszkowskie 31, 00-379 Warszawa',
  'Drinks: 20-30 PLN, Food: 40-60 PLN',
  null,
  'https://maps.google.com/?q=52.2319,21.0269'
),
(
  'Metro House',
  'club',
  52.2520,
  21.0155,
  'ul. Andersa 29, 00-159 Warszawa',
  'Entry: 40-70 PLN, Drinks: 30-40 PLN',
  'https://example.com/tickets/metro',
  'https://maps.google.com/?q=52.2520,21.0155'
),
(
  'Praga Beats',
  'club',
  52.2485,
  21.0395,
  'ul. Ząbkowska 27, 03-275 Warszawa',
  'Entry: 25-40 PLN, Drinks: 20-28 PLN',
  'https://example.com/tickets/praga',
  'https://maps.google.com/?q=52.2485,21.0395'
),
(
  'Powiśle Lounge',
  'bar',
  52.2290,
  21.0320,
  'ul. Elektrownia 5, 00-139 Warszawa',
  'Cocktails: 35-50 PLN, Snacks: 25-40 PLN',
  null,
  'https://maps.google.com/?q=52.2290,21.0320'
),
(
  'Old Town Pub',
  'bar',
  52.2480,
  21.0124,
  'Rynek Starego Miasta 15, 00-272 Warszawa',
  'Beer: 15-25 PLN, Food: 35-55 PLN',
  null,
  'https://maps.google.com/?q=52.2480,21.0124'
),
(
  'Mokotów Club',
  'club',
  52.1919,
  21.0067,
  'ul. Puławska 145, 02-715 Warszawa',
  'Entry: 35-60 PLN, Drinks: 25-40 PLN',
  'https://example.com/tickets/mokotow',
  'https://maps.google.com/?q=52.1919,21.0067'
),
(
  'Żoliborz Cafe Bar',
  'bar',
  52.2647,
  20.9737,
  'ul. Mickiewicza 25, 01-518 Warszawa',
  'Coffee: 12-18 PLN, Wine: 22-35 PLN',
  null,
  'https://maps.google.com/?q=52.2647,20.9737'
),
(
  'Wola Underground',
  'club',
  52.2370,
  20.9804,
  'ul. Chłodna 51, 00-867 Warszawa',
  'Entry: 45-80 PLN, Drinks: 30-45 PLN',
  'https://example.com/tickets/wola',
  'https://maps.google.com/?q=52.2370,20.9804'
),
(
  'Centrum Social',
  'bar',
  52.2270,
  21.0067,
  'ul. Marszałkowska 104, 00-017 Warszawa',
  'Cocktails: 28-42 PLN, Beer: 18-26 PLN',
  null,
  'https://maps.google.com/?q=52.2270,21.0067'
);
