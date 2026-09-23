# Trip Planning Service

Backend orchestration in `lib/trip-planning/` that connects the Supabase data
layer to the recommendation engine and the itinerary engine, and returns a
structured, JSON-ready trip plan. Pure TypeScript plus one async data read -
**no React**, no auth, no AI, no weather.

The orchestration is fully separated from HTTP: route handlers in
`app/api/*` are thin wrappers around `planTrip`.

## Data flow

```text
TripPlanRequestInput
  -> validateTripPlanRequest   (lib/trip-planning/validate.ts)
  -> listDestinations          (lib/data/destinations.ts, mocked in tests)
  -> toTourismCandidates       (lib/data/mappers.ts)
  -> recommend                 (lib/recommendation, existing weights 40/20/20/20)
  -> selectDestinationsForTrip (fit selection to the requested duration)
  -> buildItinerary            (lib/itinerary, existing engine)
  -> TripPlanResponse
```

## Request shape

```jsonc
{
  "tripDurationDays": 3,        // required, number >= 1
  "budget": 10000,              // optional, number >= 0 (null/omitted = no budget)
  "interests": ["nature"],      // optional, array of strings (may be empty)
  "startingLocation": "Imphal", // required, label string
  "startingLatitude": 24.81,    // optional - must be provided together with longitude
  "startingLongitude": 93.93,   // optional
  "dailyAvailableHours": 8,     // optional, positive number (null/omitted = engine default 8)
  "district": "Bishnupur",      // optional label
  "category": "Nature"          // optional label
}
```

## Validation rules

| Field | Rule |
| --- | --- |
| `tripDurationDays` | required finite number >= 1 |
| `budget` | optional; when provided must be >= 0 |
| `interests` | optional array of strings; trailing/leading whitespace trimmed; may be empty |
| `startingLocation` | required non-empty string (a label, no geocoding) |
| `startingLatitude` / `startingLongitude` | both or neither; each a finite number within lat [-90, 90] / lng [-180, 180] |
| `dailyAvailableHours` | optional; when provided must be > 0 |
| `district` / `category` | optional non-empty strings |

Invalid input returns `{ ok: false, issues: [...] }` and the API responds 400.

Starting coordinates are **never invented**: an "Imphal" label with no
coordinates keeps the engines' Imphal fallback behavior (scoring uses verified
`distanceFromImphal`; route distance is ordered by stable input order).

## Selection

`selectDestinationsForTrip` picks which recommended destinations go into the
itinerary, so the plan fits the requested duration:

1. Runs in recommendation order (score desc, name asc).
2. Accumulates estimated visit hours (unknown durations use the itinerary
   engine's documented `UNKNOWN_ACTIVITY_HOURS` scheduling fallback) against
   `dailyAvailableHours * tripDurationDays`.
3. Falls back to the itinerary engine to verify packing; if the packed plan
   still over-runs the requested days, the lowest-ranked destination is dropped
   and the plan is rebuilt - deterministically, never randomly.
4. The full recommendation ranking is still returned; `selected: true` marks
   the destinations that made it into the itinerary.

## Response shape

```jsonc
{
  "request": { /* normalized request echo */ },
  "recommendations": [
    {
      "candidate": { /* TourismCandidate */ },
      "score": 62.5,
      "breakdown": { /* interest/budget/geographic/time + distanceKind, budgetStatus, ... */ },
      "explanation": ["..."],
      "selected": true
    }
  ],
  "itinerary": {
    "requestedDays": 3,
    "usedDays": 3,
    "days": [{ "dayNumber": 1, "stops": [], "travelSegments": [], "cost": {} }],
    "cost": { "knownSubtotal": 0, "unknownCount": 0, "estimatedTotal": null, "budgetStatus": "no-budget" },
    "warnings": []
  },
  "costSummary": { /* same object as itinerary.cost, for convenience */ },
  "warnings": [
    { "code": "starting-coordinates-unavailable", "message": "...", "source": "planning" },
    { "code": "unknown-cost", "message": "...", "source": "itinerary" }
  ],
  "metadata": {
    "loadedDestinationCount": 20,
    "candidateCount": 18,
    "selectedDestinationCount": 5,
    "missing": {
      "withoutCoordinates": 4,
      "withoutCost": 7,
      "withoutVisitDuration": 3
    },
    "startingLocation": {
      "label": "Imphal",
      "coordinates": null,
      "source": "imphal-label-fallback"   // | "provided-coordinates" | "label-only"
    }
  }
}
```

## Warnings

Planning warnings (source `planning`):

- `no-destinations-found` - the database returned no destinations.
- `no-recommendations` - destinations exist but none matched the district/category filters.
- `starting-coordinates-unavailable` - no coordinates on the start point; engines fall back to Imphal estimates where available.
- `destination-selection-trimmed` - lowest-ranked recommendations were excluded so the trip fits the requested duration.

Itinerary warnings (source `itinerary`) are the existing engine's codes and are
passed through untouched: `unknown-cost`, `unknown-visit-duration`,
`unknown-travel-time`, `unknown-travel-distance`, `exceeds-duration`,
`exceeds-daily-time`.

The service never fabricates tourism data: missing costs/durations/coordinates
survive as NULL in `metadata.missing` and as itinerary warnings rather than
guessed values.

## Error behavior

- Validation failure -> `{ ok: false, issues }` (API 400).
- Supabase read failure throws `DataAccessError` from the data layer (API 500).
- No fake data is ever returned on error.

## Tests

`tests/trip-planning.test.ts` mocks `@/lib/data` (keeping the real
`toTourismCandidates` mapper) so the service runs with no network or
credentials. `tests/trip-plan-api.test.ts` mocks `planTrip` to assert the route's
400/500 JSON contract.

## Files

- `types.ts` - request input, normalized request, response, warnings, metadata.
- `validate.ts` - pure validation + normalization.
- `plan.ts` - orchestration: load -> recommend -> select -> build itinerary -> response.
- `index.ts` - public entry point.