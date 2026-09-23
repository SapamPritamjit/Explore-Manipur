# Explore Nearby

Backend nearby-search capabilities in `lib/nearby/`. Uses the existing
Haversine utility (`lib/recommendation/haversine.ts`) against the verified
tourism dataset. No PostGIS, no vector database, no new dependencies.

## Endpoint

`POST /api/nearby`
```jsonc
{
  "latitude": 24.817,      // required
  "longitude": 93.9368,    // required
  "radiusKm": 50,          // optional number 1-300, default 50
  "kinds": ["destinations", "food", "accommodation"], // optional; default all: destinations, food, experiences, accommodation
  "limitPerKind": 10       // optional integer 1-50, default 10
}
```

## Behavior

- Only records that actually carry coordinates can be located. Records without
  coordinates are counted (`skippedWithoutCoordinates`) and reported in a
  `missing-coordinates` warning - nothing is guessed.
- Records are filtered by radius and returned sorted by distance (ties broken
  by name for determinism) within each kind group.
- An empty result produces a `no-places-nearby` warning.
- `experiences` rows currently have **no coordinate columns in the dataset**, so
  they are always counted as skipped while still being reported per kind.
- As of Phase 10 the seed carries verified coordinates for 10 demo-critical
  destination records (see `DATA_SOURCES.md`); remaining records keep NULL and
  are skipped/counted as usual.

## Files

- `types.ts` - request/response types.
- `validate.ts` - latitude/longitude, radius, kinds and limit validation.
- `near.ts` - `findNearbyInDataset` (pure, deterministic) + `findNearby`
  orchestration that loads the four tables via `lib/data/`.
- `index.ts` - module exports.

## Tests

`tests/nearby.test.ts` covers distance sorting, radius filtering, missing
coordinates, empty results, kind filtering, validation and DB-failure paths.
`tests/nearby-api.test.ts` asserts the route contract (200/400/500), all with
the data layer mocked.