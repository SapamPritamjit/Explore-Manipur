# Weather (Open-Meteo)

Backend weather capabilities in `lib/weather/`. No API key, plain `fetch` to
Open-Meteo. Coordinates always come from real data (the database or the
request) - missing coordinates are surfaced explicitly, never guessed.

## Endpoints

`POST /api/weather`
```jsonc
{
  "coordinates": { "latitude": 24.8, "longitude": 93.94 }, // optional
  "destinationIds": ["<destination uuid>"],                 // optional
  "label": "Imphal",                                        // optional, name for the coordinates point
  "startDate": "2026-09-24",                                // optional YYYY-MM-DD
  "days": 3                                                 // optional integer 1-7, default 3
}
```
At least one of `coordinates` / `destinationIds` is required. `destinationIds`
are resolved against the `destinations` table; only rows that actually have
coordinates are fetched. As of Phase 10 the seed stores verified coordinates
for 10 demo-critical destination records; every other destination keeps NULL
and therefore returns `coordinate-missing` (never a guessed value).

## Responses

Per-point status, so failures degrade gracefully:

- `ok` - forecast returned
- `coordinate-missing` - destination has no coordinates in the database; no
  fetch is attempted and nothing is invented
- `upstream-error` - Open-Meteo HTTP error / network / timeout
- `no-data` - provider returned no usable daily rows

Each non-`ok` point also produces a structured warning.

## Provider call (`openmeteo.ts`)

`fetchDailyForecast` calls
`https://api.open-meteo.com/v1/forecast` with `timezone=Asia/Kolkata`, either
`forecast_days=N` or `start_date`/`end_date`, and daily variables. A 10s
timeout aborts the request. WMO weather codes are mapped in `conditions.ts`
to `good` / `mixed` / `adverse` categories; unknown codes stay neutral.

## Weather-aware itinerary adjustment (`adjust.ts`)

`adjustItineraryForWeather` is pure and advisory only - it never rewrites the
itinerary. Given an `Itinerary`, per-destination forecasts and an optional
trip start date, it produces:

- per-day, per-stop weather summaries,
- `outdoor-stop-adverse-day` - an outdoor-oriented destination (Nature /
  Adventure categories) has adverse weather on its scheduled day,
- `reschedule-to-better-day` - the same destination has a non-adverse day
  later in the trip,
- `weather-unavailable` - destination has no forecast (missing coordinates),
  stated explicitly.

## Files

- `types.ts` - request/response, forecast and adjustment types.
- `errors.ts` - `WeatherError`.
- `conditions.ts` - WMO code -> condition classification + outdoor category rule.
- `dates.ts` - pure date-string helpers (addDays, validation).
- `openmeteo.ts` - URL building, response parsing + plain-`fetch` call with timeout.
- `validate.ts` - request validation (coordinates, dates, day window).
- `weather.ts` - orchestration: validate -> resolve DB coordinates -> fetch per point.
- `adjust.ts` - pure weather-aware itinerary adjustment/suggestions.

## Tests

`tests/weather-test*` cover classification, validation, URL building and
mapping, the fetch call (network stubbed), orchestration (modules mocked),
weather-aware adjustment, and the route contract. No network or credentials
are required.