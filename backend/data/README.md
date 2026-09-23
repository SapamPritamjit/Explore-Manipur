# Data Access Layer

Read-only access to the Supabase tourism tables from `lib/data/`. Backend-first:
pure TypeScript, NO React imports, no server-side writes, and no other database
library (uses the existing `getBrowserClient()` from `lib/supabase.ts`).

Rows are converted from the snake_case database shape into camelCase domain
types, so raw Supabase response objects never leak into the application.

## Available functions

| Function | Returns | Notes |
| --- | --- | --- |
| `listDestinations(filters?)` | `Destination[]` | Supports `district`, `category`, `interests` filters |
| `getDestination(id)` | `Destination \| null` | `null` when the id is not found |
| `listDestinationCandidates(filters?)` | `TourismCandidate[]` | Destinations converted for the recommendation/itinerary engines |
| `listFood()` | `Food[]` | Sorted by name |
| `listExperiences()` | `Experience[]` | Sorted by name |
| `listAccommodation()` | `Accommodation[]` | Sorted by name |
| `listEvents()` | `EventItem[]` | Sorted by name |
| `listTransport()` | `TransportRoute[]` | Sorted by origin, then destination |

Plus mapper functions (`mapDestination`, `mapFood`, ... and `toTourismCandidate`)
and the domain types themselves.

## Destination filters

- `district` - exact match on `district` (`eq`).
- `category` - exact match on `category` (`eq`).
- `interests` - rows whose `tags` array overlaps with **any** provided term
  (`overlaps`). Fuzzy/partial matching is left to the recommendation engine;
  this is a coarse first cut at the database level.
- Empty strings/arrays are ignored, so passing them does not accidentally
  narrow the result.

## Mapping decisions

- snake_case database columns map to camelCase domain properties:
  `distance_from_imphal` -> `distanceFromImphal`, `source_url` -> `sourceUrl`,
  etc.
- `text[]` columns map to `string[]` (`tags`, `local_dishes` -> `localDishes`,
  `facilities`). A legacy `NULL` array is defensively treated as `[]`.
- `numeric` columns (`latitude`, `longitude`, `estimated_cost`, ...) map to
  `number | null` unchanged.
- `toTourismCandidate` builds `TourismCandidate` for the engines:
  `coordinates` is `{ latitude, longitude }` only when **both** values exist,
  otherwise `null`. Nothing is fabricated.
- `boolean` columns (`booking_required`) map to `boolean | null`.

## Error behavior

When a Supabase query fails, the data layer throws a `DataAccessError` carrying
`code` (from the database error, or `database_error`) and the raw error as
`detail`. It **never** returns fake or default tourism data on failure - callers
must surface their loading/error states from the thrown error.

`getDestination` returns `null` when the row genuinely does not exist (an empty
`maybeSingle` result is not an error); actual query failures still throw.

## NULL / missing data

Database `NULL` is preserved as `null` in the domain types (or `null | undefined`
per the calling convention). Fields that are unknown in our dataset - e.g.
coordinates or estimated costs left NULL in `seed.sql` - stay `null`. The data
layer never fills in missing tourism facts.

## Tests

`tests/data.test.ts` mocks the client boundary (`@/lib/supabase`) so unit tests
run with no network or credentials. They cover row mapping, NULL mapping, empty
results, error handling, destination filters and typed returns.