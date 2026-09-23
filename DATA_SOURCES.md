# Explore Manipur - Data Sources

Sources and verification notes for the seed data in `supabase/seed.sql`.

## Golden rule

Nothing in `seed.sql` is invented. Every factual value comes from the recorded
`source_name` / `source_url`. If a fact could not be verified it is stored as
`NULL` - never guessed.

## Primary sources

| Name | URL | Used for |
| --- | --- | --- |
| Manipur Tourism - District-wise destination | https://manipurtourism.gov.in/district-wise-destination/ | Most destination, experience, event and transport facts |
| Manipur Tourism - Places to see | https://manipurtourism.gov.in/places-to-see/ | State Museum, Khonghampat Orchidarium, Zoological Garden |
| Manipur Tourism - Find accommodation | https://manipurtourism.gov.in/find-accommodation/ | Hotel/resort names, star category, rooms and contact details |
| Manipur Tourism - Shirui Lily Festival | https://manipurtourism.gov.in/shirui-lily-festival/ | Shirui Hills trek experience, Shirui Lily Festival dates (20-24 May 2025) |
| Manipur Tourism - Sangai Festival 2025 programme | https://manipurtourism.gov.in/manipur-sangai-festival-2025-programme/ | Sangai Festival existence/annual status (no verified next-edition dates) |
| Outlook Traveller - Manipuri cuisine | https://site.outlookindia.com/traveller/cuisine/explore-versatile-world-manipuri-cuisine/ | Food records (Eromba, Chamthong, Morok Metpa, Nga-Thongba, Ooti) |
| ABP Live - Traditional dishes of Manipur | https://news.abplive.com/lifestyle/tastes-of-india-a-culinary-journey-through-traditional-dishes-of-manipur-1612924 | Food record (Singju) |
| Wikipedia (English) | https://en.wikipedia.org/ | Coordinates for verified landmarks (Phase 10) |
| Wikidata | https://www.wikidata.org/ | Coordinates for the Manipur State Museum (Phase 10) |
| Commonwealth War Graves Commission | https://www.cwgc.org/ | Authoritative GPS coordinates for Imphal War Cemetery (Phase 10) |

## Record counts (targets in brackets)

- destinations: 20 (target 20-30)
- food: 6 (target 10-15) - see note below
- experiences: 5 (target 5-10)
- accommodation: 5 (target 10-15)
- events: 4 (target 5-10) - see note below
- transport: 4

Deliberate shortfalls:

- **food (6 of 10-15):** no official Manipur Tourism source lists specific
  verified restaurants/eateries, and inventing eateries with addresses or hours
  is forbidden. Food rows instead record traditional Manipuri *dishes* with
  reliable editorial sources. If verified restaurant-level data becomes
  available it can be added later.
- **events (4 of 5-10):** festival dates are hard to verify. Only the Shirui
  Lily Festival has fully verified dates (20-24 May 2025). Sangai Festival,
  Khongjom Day and Moirang Lai Haraoba are included with NULL date columns plus
  a verified descriptive note. No unfounded dates were added just to hit the target.

## Intentionally NULL fields (nothing guessed)

Across the tables, values are left NULL whenever the cited sources do not
publish them:

- `estimated_cost` / `price_range` - no verified pricing
- `opening_hours` - none verified
- `image_url` - no verified image URLs
- `approx_time` (transport) - travel times not verified; distances are clearly
  labelled as estimates in `notes`
- `latitude` / `longitude` - NULL everywhere by default. Phase 10 added a small,
  fully-sourced coordinate subset for the destinations the demo needs
  (map, itinerary, weather, Explore Nearby) - see "Verified coordinates
  (Phase 10)" below. Every other record keeps NULL coordinates.

Specific NULL choices:

- `distance_from_imphal` is only set where the citing page states a figure
  (e.g. Loktak 48 km, Moirang 45 km, Moreh 110 km, Tamenglong 156 km). Where
  sources conflict (e.g. Ukhrul listed as 83 km and 84 km on different pages)
  the distance is left NULL.
- Event `start_date` / `end_date` / `year` are NULL unless verifiable
  (only the Shirui Lily Festival has exact dates).
- Accommodation `booking_url` is NULL; contact strings mirror the official
  "Find Accommodation" listing.

## Verified coordinates (Phase 10)

Exactly 10 destination records carry `latitude` / `longitude`. Value and source:

| Destination | Latitude | Longitude | Source name | Source URL |
| --- | --- | --- | --- | --- |
| Kangla Fort | 24.808 | 93.940 | Wikipedia | https://en.wikipedia.org/wiki/Kangla_Fort |
| Shree Shree Govindajee Temple | 24.797798 | 93.948486 | Wikipedia | https://en.wikipedia.org/wiki/Shree_Govindajee_Temple |
| Ima Market (Khwairamband Bazar) | 24.808 | 93.935 | Wikipedia | https://en.wikipedia.org/wiki/Ima_Keithel |
| Manipur State Museum | 24.804854 | 93.937095 | Wikidata | https://www.wikidata.org/wiki/Q110501212 |
| Imphal War Cemetery | 24.82195 | 93.94609 | CWGC | https://www.cwgc.org/visit-us/find-cemeteries-memorials/cemetery-details/2064600/imphal-war-cemetery/ |
| Manipur Zoological Garden | 24.81694 | 93.89111 | Wikipedia | https://en.wikipedia.org/wiki/Manipur_Zoological_Garden |
| Loktak Lake | 24.55 | 93.783 | Wikipedia | https://en.wikipedia.org/wiki/Loktak |
| Keibul Lamjao National Park | 24.5 | 93.76667 | Wikipedia | https://en.wikipedia.org/wiki/Keibul_Lamjao_National_Park |
| Moirang | 24.5 | 93.77 | Wikipedia | https://en.wikipedia.org/wiki/Moirang |
| Red Hill (Lokpaching) | 24.703 | 93.817 | Wikipedia | https://en.wikipedia.org/wiki/Maibam_Lotpa_Ching |

Notes:

- This is the demo-critical set: five central Imphal records plus the
  Bishnupur corridor (Red Hill, Sadu Chiru area, Moirang, Loktak/Sendra,
  Keibul Lamjao) that the itinerary map line, per-destination weather and
  Explore Nearby all render on.
- Khonghampat Orchidarium and Sadu Chiru Waterfall were investigated but
  **kept NULL**: no authoritative coordinate exists for the Orchidarium
  (the Wikipedia article has none; Wikidata has none) and published values
  for Sadu Chiru disagree (93.746 / 93.753 / 93.763). Uncertain coordinates
  stay NULL.
- Area-level coordinates (Loktak Lake, Keibul Lamjao NP, Moirang) are the
  reference point published by the cited source. They are used for display,
  distance and weather only - never presented as an exact address.
- Each verified row's `notes` in `seed.sql` records the coordinate source.
- The `seed-coordinates` test (`tests/seed-coordinates.test.ts`) fails if any
  destination in `seed.sql` gains a non-NULL coordinate outside this table.

## Data quality conventions

- Every factual row carries `source_name` + `source_url`.
- `notes` records the verification context and any limitations for that row.
- `district` follows the grouping used on the citing Manipur Tourism page
  (e.g. Swamp Dew, Govindajee Temple sit under the official page's
  "Imphal East" grouping).
- Distances are road distances stated by Manipur Tourism and must be presented
  to users as `estimated`.