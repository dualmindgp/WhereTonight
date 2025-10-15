-- WhereTonight Database Schema
-- Este archivo contiene todas las tablas, políticas RLS y funciones necesarias

-- USERS: usa auth.users de Supabase. Crea un perfil mínimo.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now()
);

-- VENUES: locales fijos
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text check (type in ('club','bar','other')) default 'club',
  lat double precision not null,
  lng double precision not null,
  address text,
  avg_price_text text,          -- ejemplo: "Drinks ~25-35 PLN"
  tickets_url text,             -- link externo para entradas si aplica
  maps_url text,                -- link a Google Maps
  place_id text unique,         -- Google Places ID
  rating double precision,      -- Rating de Google (0-5)
  price_level integer,          -- Nivel de precio (0-4)
  photo_ref text,               -- Referencia de foto principal de Google Places
  photo_refs text[],            -- Array de referencias de fotos
  website text,                 -- URL del sitio web del venue
  opening_hours text,           -- Horarios de apertura
  is_active boolean default true,
  created_at timestamptz default now()
);

-- TICKETS: 1 por usuario y día (Europe/Warsaw)
-- Estrategia: guardamos la fecha local (date) calculada a partir de "now()" en zona Europe/Warsaw en el servidor.
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete restrict,
  local_date date not null,   -- día local (Europe/Warsaw)
  created_at timestamptz default now(),
  unique (user_id, local_date) -- fuerza 1 ticket por usuario y día
);

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.venues enable row level security;
alter table public.tickets enable row level security;

-- Políticas
-- profiles: cada uno ve solo su perfil (MVP simple)
create policy "select own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- venues: lectura pública, escritura solo por admin (para MVP: solo lectura)
create policy "public read venues" on public.venues
  for select using (true);

-- tickets: cada usuario puede leer los suyos y crear el suyo
create policy "insert own ticket" on public.tickets
  for insert with check (auth.uid() = user_id);

create policy "select own tickets" on public.tickets
  for select using (auth.uid() = user_id);

-- Para el conteo agregado por venue del día, necesitamos una RPC (función SQL)
-- que devuelva conteos sin exponer tickets individuales de otros usuarios.

create or replace function public.tickets_count_today_euwarsaw()
returns table(venue_id uuid, count_today bigint)
language sql
stable
as $$
  with tz as (
    select (now() at time zone 'Europe/Warsaw')::date as d
  )
  select t.venue_id, count(*)::bigint as count_today
  from public.tickets t, tz
  where t.local_date = tz.d
  group by t.venue_id;
$$;

-- Dar permiso de ejecución pública a la RPC
grant execute on function public.tickets_count_today_euwarsaw() to anon, authenticated;

-- Función adicional para verificar si un usuario ya usó su ticket hoy
create or replace function public.user_ticket_used_today()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 
    from public.tickets 
    where user_id = auth.uid() 
    and local_date = (now() at time zone 'Europe/Warsaw')::date
  );
$$;

grant execute on function public.user_ticket_used_today() to authenticated;
