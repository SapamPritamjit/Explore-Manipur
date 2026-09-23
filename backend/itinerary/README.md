# Itinerary Engine

Pure TypeScript business logic in `lib/itinerary/`. Deterministic, unit-tested
and independent of React. It accepts typed tourism candidates (the same
`TourismCandidate` type used by the recommendation engine) and returns a
structured day-by-day plan. It never talks to Supabase or to the UI.

## Entry point

```ts
import { buildItinerary } from "@/lib/itinerary";

const itinerary = buildItinerary({
  durationDays: 3,
  destinations: [...],   // TourismCandidate[]
  startingLocation: { label: "Imphal", coordinates: { latitude, longitude } },
  budget: 10000,
  dailyAvailableHours: 8, // optional
});
```

## Algorithm

1. **Normalize input.** `durationDays` is rounded up (`ceil`) with a minimum of
   1 day; a non-positive duration produces an `invalid-duration` warning.
   `dailyAvailableHours` defaults to 8 hours/day (`DEFAULT_DAILY_HOURS`).
2. **Order destinations.**
   - When the starting location has valid coordinates and at least one
     destination has coordinates, stops are ordered with a deterministic greedy
     nearest-neighbour walk starting from the start point (Haversine distance,
     ties broken by input order).
   - Destinations without coordinates are appended afterwards in stable input
     order; their true position in the route is deliberately not guessed.
   - When the start point has no coordinates, **all** stops keep their stable
     input order - the engine does not pretend there is an optimal route.
   - The ordered ids are exposed as `orderedDestinationIds`.
3. **Pack into days.** Stops are taken in the ordered sequence and placed into
   days sequentially. A stop joins the current day only if its scheduled hours
   still fit inside `dailyAvailableHours`; otherwise it starts the next day.
   - Unknown visit durations consume `UNKNOWN_ACTIVITY_HOURS` (3) of *scheduling
     capacity only* - their real duration is still reported as unknown.
   - If the requested day count runs out before all stops are placed, the
     remaining stops continue filling extra days (never dropped) and an
     `exceeds-duration` warning is returned.
   - A single stop that alone exceeds the daily limit is placed on its own day,
     flagged `overCapacity` with an `exceeds-daily-time` warning.
4. **Travel segments.** Every day gets segments in a base/spoke model:
   `start -> first stop`, between consecutive stops, and `last stop -> start`.
   Distances are computed only when both endpoints have coordinates. Travel
   time is never invented - it is always reported as unknown.

## Missing-data behavior

| Signal | Behavior |
| --- | --- |
| Unknown visit duration | Scheduled with a documented 3-hour placeholder for capacity only; stop reports `visitDurationUnknown: true`; `unknown-visit-duration` warning |
| Unknown costs | Excluded from `knownSubtotal`; `unknownCount` tracked; `estimatedTotal` is NULL whenever any cost is unknown (no fabricated total) |
| Missing coordinates | Segment distance is NULL with `distanceType: "unknown"`; `unknown-travel-distance` warning; no coordinates are fabricated |
| Missing travel time | `travelTime` always NULL, `travelTimeUnknown: true`, `unknown-travel-time` warning (no data source exists) |
| Start is Imphal (label only) | When the start label is Imphal and a destination has the verified `distanceFromImphal`, that figure is used for start/return legs as `distanceType: "imphal-estimate"` - consistent with the recommendation engine |
| Empty destination list | Returns an empty itinerary (no days, zero cost, no warnings) |
| Budget | Comparison is only asserted when meaningful: no budget -> `no-budget`; any unknown cost -> `unknown-costs` (never claims fit); all costs known -> `within-budget` / `exceeds-budget` |

## Haversine vs road distance

`distanceType: "haversine"` is a **straight-line** great-circle distance between
coordinates. It is a planning estimate and must be presented to users as
`estimated` - it is **not** road distance and implies no travel time. Road
distance/time is out of scope for V1 (no routing engine). Any use of
`distanceFromImphal` is explicitly tagged `"imphal-estimate"` for the same
reason.

## Warnings

Every warning has a stable `code` and a human-readable `message`:

- `invalid-duration` - duration not positive; clamped to 1.
- `exceeds-duration` - stops needed more days than requested (never dropped).
- `exceeds-daily-time` - a stop alone exceeds the daily time limit.
- `unknown-cost` - one or more stops lack an estimated cost.
- `unknown-visit-duration` - one or more stops lack a recorded duration.
- `unknown-travel-time` - travel time unavailable (always true in V1).
- `unknown-travel-distance` - a segment has no computable distance.

## Output shape

`Itinerary` groups stops into `days[]` with per-day `travelSegments[]`, capacity
accounting (`availableHours`, `scheduledHours`, `usedKnownHours`,
`unknownDurationCount`, `overCapacity`) and a per-day `cost` (`knownSubtotal`,
`unknownCount`). The whole trip gets an `ItineraryCostSummary` (`knownSubtotal`,
`unknownCount`, `estimatedTotal`, `budgetStatus`).

## Determinism

No randomization and no wall-clock/random inputs. Identical input always
produces an identical itinerary (unit-tested).

## Files

- `types.ts` - input, day, stop, segment, cost, warning, itinerary types.
- `constants.ts` - daily-hour default and unknown-activity scheduling fallback.
- `order.ts` - deterministic geographic ordering via nearest-neighbour walk.
- `pack.ts` - stop building, day packing and overflow accounting.
- `travel.ts` - travel segment construction and distance calculation.
- `build.ts` - orchestration, warnings and cost summary.