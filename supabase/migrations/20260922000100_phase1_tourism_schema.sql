-- Explore Manipur
-- Phase 1: tourism database schema.
-- PostgreSQL 15+ (Supabase). Single migration.
--
-- Conventions:
--   * UUID primary keys via gen_random_uuid() (built-in on PostgreSQL 13+).
--   * numeric(9,6) latitude/longitude with range + pairing CHECK constraints (no PostGIS).
--   * text[] for tags, dishes and facilities lists.
--   * Facts that may legitimately be unavailable are NULL; nothing is invented here.
--   * Every factual tourism table carries source_name/source_url; notes hold verification context.
--   * RLS enabled on every table: public (anon/authenticated) may SELECT only.
--     Inserts/updates/deletes are reserved for future server-side admin processes,
--     which will use the service-role key (bypasses RLS by default).

begin;

-- ---------------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- destinations
-- ---------------------------------------------------------------------------

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text,
  category text not null,
  description text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  distance_from_imphal numeric,
  estimated_cost numeric,
  estimated_visit_duration text,
  best_time text,
  tags text[] not null default '{}',
  opening_hours text,
  contact text,
  image_url text,
  source_name text,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destinations_latitude_range check (latitude is null or (latitude between -90 and 90)),
  constraint destinations_longitude_range check (longitude is null or (longitude between -180 and 180)),
  constraint destinations_coordinates_paired check ((latitude is null) = (longitude is null))
);

create index destinations_name_idx on public.destinations (name);
create index destinations_district_idx on public.destinations (district);
create index destinations_category_idx on public.destinations (category);
create index destinations_tags_idx on public.destinations using gin (tags);

comment on table public.destinations is
  'Verified places of interest in Manipur. Facts must come from recorded sources.';

-- ---------------------------------------------------------------------------
-- food
-- ---------------------------------------------------------------------------

create table public.food (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  district text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  cuisine text,
  local_dishes text[] not null default '{}',
  price_range text,
  opening_hours text,
  contact text,
  image_url text,
  tags text[] not null default '{}',
  source_name text,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint food_latitude_range check (latitude is null or (latitude between -90 and 90)),
  constraint food_longitude_range check (longitude is null or (longitude between -180 and 180)),
  constraint food_coordinates_paired check ((latitude is null) = (longitude is null))
);

create index food_name_idx on public.food (name);
create index food_district_idx on public.food (district);
create index food_tags_idx on public.food using gin (tags);

comment on table public.food is
  'Restaurants and local food experiences with sourced pricing and opening details.';

-- ---------------------------------------------------------------------------
-- experiences
-- ---------------------------------------------------------------------------

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  district text,
  category text not null,
  description text,
  duration text,
  estimated_cost numeric,
  best_time text,
  difficulty text,
  booking_required boolean,
  contact text,
  image_url text,
  tags text[] not null default '{}',
  source_name text,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index experiences_name_idx on public.experiences (name);
create index experiences_district_idx on public.experiences (district);
create index experiences_category_idx on public.experiences (category);
create index experiences_tags_idx on public.experiences using gin (tags);

comment on table public.experiences is
  'Bookable or visitable tourism experiences such as trekking, boating and cultural activities.';

-- ---------------------------------------------------------------------------
-- accommodation
-- ---------------------------------------------------------------------------

create table public.accommodation (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  district text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  type text,
  price_range text,
  facilities text[] not null default '{}',
  contact text,
  booking_url text,
  image_url text,
  source_name text,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accommodation_latitude_range check (latitude is null or (latitude between -90 and 90)),
  constraint accommodation_longitude_range check (longitude is null or (longitude between -180 and 180)),
  constraint accommodation_coordinates_paired check ((latitude is null) = (longitude is null))
);

create index accommodation_name_idx on public.accommodation (name);
create index accommodation_district_idx on public.accommodation (district);
create index accommodation_type_idx on public.accommodation (type);

comment on table public.accommodation is
  'Verified hotels, homestays and guest houses. Booking links are external; no booking engine is built.';

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  start_date date,
  end_date date,
  year integer,
  annual_or_one_time text,
  location text,
  district text,
  description text,
  organizer text,
  official_url text,
  image_url text,
  source_name text,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_date_order check (start_date is null or end_date is null or end_date >= start_date)
);

create index events_name_idx on public.events (name);
create index events_category_idx on public.events (category);
create index events_year_idx on public.events (year);
create index events_district_idx on public.events (district);

comment on table public.events is
  'Festivals and events with verified dates/years and official URLs where available.';

-- ---------------------------------------------------------------------------
-- transport
-- ---------------------------------------------------------------------------

create table public.transport (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  transport_type text,
  approx_distance numeric,
  approx_time text,
  notes text,
  source_name text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transport_origin_idx on public.transport (origin);
create index transport_destination_idx on public.transport (destination);
create index transport_type_idx on public.transport (transport_type);

comment on table public.transport is
  'Approximate inter-place connections. Distances/times are estimates, not live routing data.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger destinations_set_updated_at
  before update on public.destinations
  for each row execute function public.set_updated_at();

create trigger food_set_updated_at
  before update on public.food
  for each row execute function public.set_updated_at();

create trigger experiences_set_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

create trigger accommodation_set_updated_at
  before update on public.accommodation
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger transport_set_updated_at
  before update on public.transport
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.destinations enable row level security;
alter table public.food enable row level security;
alter table public.experiences enable row level security;
alter table public.accommodation enable row level security;
alter table public.events enable row level security;
alter table public.transport enable row level security;

-- Public read access to tourism data. No public write policies: with RLS on,
-- anon/authenticated inserts, updates and deletes are denied by default.
create policy destinations_public_select
  on public.destinations for select using (true);
create policy food_public_select
  on public.food for select using (true);
create policy experiences_public_select
  on public.experiences for select using (true);
create policy accommodation_public_select
  on public.accommodation for select using (true);
create policy events_public_select
  on public.events for select using (true);
create policy transport_public_select
  on public.transport for select using (true);

-- Explicit read grants for the Supabase public roles (matches the
-- publishable/anon key and authenticated role).
grant select on public.destinations to anon, authenticated;
grant select on public.food to anon, authenticated;
grant select on public.experiences to anon, authenticated;
grant select on public.accommodation to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.transport to anon, authenticated;

commit;