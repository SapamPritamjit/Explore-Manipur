# Recommendation Engine

Pure TypeScript business logic in `lib/recommendation/`. Deterministic,
unit-tested and independent of React. It accepts data and returns results; it
never touches the database or the UI.

## Entry point

```ts
import { recommend } from "@/lib/recommendation";

const results = recommend(input, candidates);
```

`recommend()` filters candidates by `preferredDistricts` / `preferredCategories`
(when provided), scores every remaining candidate, and returns results sorted
by score descending (ties broken alphabetically by name).

## Scoring formula

```
overall score =
  interest_match  * 0.40 +
  budget_fit      * 0.20 +
  geographic_fit  * 0.20 +
  time_fit        * 0.20
```

Every component and the overall score are normalized to 0-100. Weights live in
one place, `lib/recommendation/weights.ts` (`SCORE_WEIGHTS`), and are checked
to sum to 1.0. The engine does not attach "best/worst" labels - it returns
scores and explanations.

## Component breakdown

### Interest match (40%)
The candidate's `category` and `tags` are normalized (lowercased, non-alphanumeric
characters collapsed). An interest matches when its normalized form equals a
category/tag term or, for terms of 3+ characters, is contained within one
(`"lion"` matches tag `"national-park"`, `"lily"` matches `"shirui lily"`).

- Match count / interest count, scaled to 100.
- Returns `matchedInterests` and `matchedTags` for transparency.
- No interests provided: neutral 50 (all candidates scored equally).

### Budget fit (20%)
Uses `estimated_cost` **only when it is recorded** - the engine never invents a
cost. Both values are treated as INR.

- Cost recorded and `cost <= budget`: 100.
- Cost recorded and `cost > budget`: falls linearly toward 0 the further the
  cost exceeds the budget (the default budget-fit curve).
- Cost unknown: neutral 50 with `budgetStatus: "unknown-cost"`. This is
  documented as *not assessed*, never as "fits the budget".
- No budget specified: neutral 50 with `budgetStatus: "no-budget-specified"`.

### Geographic fit (20%)
- Both start and destination coordinates exist: Haversine distance (km),
  score = `100 - distance / GEO_MAX_DISTANCE_KM * 100`, clamped to 0-100
  (`GEO_MAX_DISTANCE_KM = 300` in `weights.ts`). `distanceKind: "haversine"`.
- Starting location is Imphal and the candidate has a recorded
  `distanceFromImphal`: that verified figure is used, clearly reported as
  `distanceKind: "imphal-estimate"` since it is a database estimate, not live
  routing.
- Otherwise: neutral 50, `distanceKind: "unknown"`. Coordinates are never
  fabricated.

### Time fit (20%)
`estimatedVisitDuration` is free text in the database, so it is parsed with
`parseVisitHours()`: "3-4 hours" uses 4 hours (the conservative upper bound),
"1 day" = 8 hours, "half day" = 4 hours, "30 minutes" = 0.5 hours; nothing
recognizable yields `null`.

- Duration known: `availableHours = durationDays * DAY_HOURS_PER_DAY`
  (`DAY_HOURS_PER_DAY = 8`), score = `availableHours / visitHours * 100`,
  clamped to 100.
- Duration unknown: neutral 50 - the engine does not guess.

## Missing data summary

| Signal | Missing → |
| --- | --- |
| Interests | neutral 50 |
| Budget | neutral 50 (`no-budget-specified`) |
| `estimated_cost` | neutral 50 (`unknown-cost`), never declared in budget |
| Coordinates | Imphal fallback only if starting at Imphal; else neutral 50 |
| `estimatedVisitDuration` | neutral 50 |
| Empty candidate list | empty result list |

A neutral component score is 50: it neither rewards nor penalizes, keeping the
other weighted components the deciding factor.

## Explanation

Every `RecommendationResult` carries an `explanation` array of human-readable
lines covering matched interests, budget status, approximate distance when
known, time-fit and the final score, e.g.:

```
Interests: matched 2 of 2 (nature, lake).
Budget: estimated cost Rs 300 is within your budget.
Distance: about 4 km from your start point.
Time: needs about 4 hours; your trip has about 24 active hours.
Overall score: 90.0 / 100.
```

## Files

- `types.ts` - input, candidate, breakdown and result types.
- `weights.ts` - weights and constants (edit here to re-balance scores).
- `haversine.ts` - Haversine distance in km.
- `text.ts` - normalization helpers.
- `interest.ts`, `budget.ts`, `geography.ts`, `timefit.ts` - component scorers.
- `recommend.ts` - orchestration, filtering and explanation.