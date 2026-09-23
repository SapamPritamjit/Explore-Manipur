-- Explore Manipur
-- Safe coordinate patch for the 10 Phase 10 verified destinations.
-- Run this in Supabase SQL Editor to update existing rows that were
-- inserted before latitude/longitude were added to seed.sql.
--
-- This uses UPDATE (not INSERT), so it is safe regardless of whether
-- the rows already exist. It only touches the 10 destinations listed
-- in DATA_SOURCES.md "Verified coordinates (Phase 10)".
--
-- Idempotent: running multiple times produces the same result.

UPDATE public.destinations
SET latitude = 24.808, longitude = 93.940
WHERE name = 'Kangla Fort';

UPDATE public.destinations
SET latitude = 24.797798, longitude = 93.948486
WHERE name = 'Shree Shree Govindajee Temple';

UPDATE public.destinations
SET latitude = 24.808, longitude = 93.935
WHERE name = 'Ima Market (Khwairamband Bazar)';

UPDATE public.destinations
SET latitude = 24.804854, longitude = 93.937095
WHERE name = 'Manipur State Museum';

UPDATE public.destinations
SET latitude = 24.82195, longitude = 93.94609
WHERE name = 'Imphal War Cemetery';

UPDATE public.destinations
SET latitude = 24.81694, longitude = 93.89111
WHERE name = 'Manipur Zoological Garden';

UPDATE public.destinations
SET latitude = 24.55, longitude = 93.783
WHERE name = 'Loktak Lake';

UPDATE public.destinations
SET latitude = 24.5, longitude = 93.76667
WHERE name = 'Keibul Lamjao National Park';

UPDATE public.destinations
SET latitude = 24.5, longitude = 93.77
WHERE name = 'Moirang';

UPDATE public.destinations
SET latitude = 24.703, longitude = 93.817
WHERE name = 'Red Hill (Lokpaching)';
