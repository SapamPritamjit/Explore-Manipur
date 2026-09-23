# Frontend Integration Guide

This document describes every backend API endpoint available for frontend integration. All endpoints return JSON. No authentication is required in V1.

## Common Error Shape

All error responses follow this structure:

```json
{
  "ok": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": []
  }
}
```

- `ok` is always `false` on errors.
- `code` is a machine-readable string (e.g., `"invalid-json"`, `"validation-error"`, `"data-error"`, `"internal-error"`).
- `message` is human-readable.
- `details` is present only for validation errors and contains an array of `{ field, message }` objects.

---

## GET /api/health

Health check endpoint. Verifies environment configuration and database connectivity.

**Method:** GET

**Request body:** None.

**Response (200):**

```json
{
  "app": "Explore Manipur",
  "status": "ok | degraded",
  "config": {
    "supabaseUrl": true,
    "supabasePublishableKey": true,
    "supabaseSecretKey": true,
    "groqApiKey": true
  },
  "database": "connected | not_configured | missing_config | tables_pending | error",
  "time": "2026-09-23T00:00:00.000Z",
  "detail": "optional error message when status is degraded"
}
```

**Notes:**
- `config` values are booleans indicating whether each env var is set. They do NOT expose secret values.
- `database` can be `"connected"`, `"not_configured"`, `"missing_config"`, `"tables_pending"`, or `"error"`.
- Safe to display `status` and `database` in a dev dashboard. Do not display `detail` to end users.

---

## POST /api/trip-plan

Core endpoint. Accepts trip preferences, returns scored recommendations and a day-by-day itinerary.

**Method:** POST

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `tripDurationDays` | number | **Yes** | Number of trip days. Must be >= 1. |
| `startingLocation` | string | **Yes** | Label for the starting point (e.g., `"Imphal"`). Must be non-empty. |
| `startingLatitude` | number | No | Latitude of starting point (-90 to 90). Must provide both lat and lng, or neither. |
| `startingLongitude` | number | No | Longitude of starting point (-180 to 180). Must provide both lat and lng, or neither. |
| `budget` | number | No | Total trip budget. Non-negative. When omitted, budget scoring uses unknown-cost handling. |
| `interests` | string[] | No | Array of interest tags (e.g., `["nature", "culture"]`). Empty strings are filtered out. |
| `dailyAvailableHours` | number | No | Hours available per day for activities. Must be > 0. Defaults to 8 internally if omitted. |
| `district` | string | No | Filter by district name. |
| `category` | string | No | Filter by destination category. |

### Validation Errors (400)

Returns the common error shape with `code: "validation-error"`. The `details` array contains objects:

```json
{ "field": "tripDurationDays", "message": "tripDurationDays must be a number >= 1." }
```

Possible validation fields: `tripDurationDays`, `budget`, `interests`, `startingLocation`, `startingLatitude`, `startingLongitude`, `dailyAvailableHours`, `district`, `category`.

### Successful Response (200)

```json
{
  "request": {
    "durationDays": 3,
    "budget": 5000,
    "interests": ["nature"],
    "startingLocation": {
      "label": "Imphal",
      "coordinates": { "latitude": 24.81, "longitude": 93.94 }
    },
    "dailyAvailableHours": 8,
    "district": null,
    "category": null
  },
  "recommendations": [],
  "itinerary": {},
  "costSummary": {},
  "warnings": [],
  "metadata": {}
}
```

### Recommendations Array

Each item in `recommendations`:

```json
{
  "candidate": {
    "id": "uuid-string",
    "name": "Loktak Lake",
    "category": "nature",
    "tags": ["lake", "nature"],
    "district": "Bishnupur",
    "coordinates": { "latitude": 24.45, "longitude": 93.77 },
    "distanceFromImphal": 48,
    "estimatedCost": 500,
    "estimatedVisitDuration": "3 hours",
    "bestTime": "October to March"
  },
  "score": 0.85,
  "breakdown": {
    "interest": 0.4,
    "budget": 0.2,
    "geographic": 0.15,
    "time": 0.1,
    "matchedInterests": ["nature"],
    "matchedTags": ["lake", "nature"],
    "costKnown": true,
    "budgetStatus": "affordable",
    "distanceKm": 48.2,
    "distanceKind": "haversine",
    "visitHours": 3,
    "availableHours": 24,
    "timeKnown": true
  },
  "explanation": ["Matches your interest in nature", "Within your budget"],
  "selected": true
}
```

**Score meaning:**
- `score` is 0.0 to 1.0. Higher = better match.
- Formula: interest (40%) + budget (20%) + geographic (20%) + time (20%).
- `breakdown.interest`, `breakdown.budget`, `breakdown.geographic`, `breakdown.time` are the weighted sub-scores that sum to `score`.
- `explanation` is an array of human-readable strings. Safe and intended for UI display.
- `selected` indicates whether the itinerary engine included this destination in the final plan.

**Important NULL behavior for candidates:**
- `coordinates` can be `null`. Only 10 of 20 destinations have verified coordinates. When `null`, map markers cannot be placed. Do NOT invent coordinates.
- `estimatedCost` can be `null`. Means cost data is unavailable.
- `estimatedVisitDuration` can be `null`. Means visit duration is unknown.
- `district` can be `null`.
- `distanceFromImphal` can be `null`.
- `bestTime` can be `null`.

**Distance kinds:**
- `"haversine"` - calculated from verified coordinates using Haversine formula. This is an estimate.
- `"imphal-estimate"` - fallback estimate based on seed data distance from Imphal. Clearly an estimate.
- `"unknown"` - no distance could be computed.

**Budget status values:** `"affordable"`, `"over-budget"`, `"unknown-cost"`, `"no-budget-specified"`.

### Itinerary Object

```json
{
  "requestedDays": 3,
  "usedDays": 2,
  "dailyAvailableHours": 8,
  "totalStops": 5,
  "orderedDestinationIds": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5"],
  "days": [
    {
      "dayNumber": 1,
      "stops": [
        {
          "destination": { "id": "uuid1", "name": "Loktak Lake", "category": "nature", "tags": ["lake"] },
          "visitHours": 3,
          "visitDurationUnknown": false,
          "costKnown": true,
          "estimatedCost": 500
        }
      ],
      "travelSegments": [
        {
          "from": "Imphal",
          "to": "Loktak Lake",
          "distanceKm": 48.2,
          "distanceType": "haversine",
          "travelTime": "estimated 1.5 hours",
          "travelTimeUnknown": false
        }
      ],
      "availableHours": 8,
      "scheduledHours": 5.5,
      "usedKnownHours": 3,
      "unknownDurationCount": 0,
      "overCapacity": false,
      "cost": { "knownSubtotal": 500, "unknownCount": 0 }
    }
  ],
  "cost": {
    "knownSubtotal": 2000,
    "unknownCount": 1,
    "estimatedTotal": 2000,
    "budgetStatus": "within-budget"
  },
  "warnings": []
}
```

**CRITICAL for UI display:**
- `travelSegments[].travelTime` is ALWAYS estimated. It may be `null`. When displayed, label it as "estimated". Never present travel times as live routing data.
- `travelSegments[].distanceKm` can be `null`. `distanceType` will be `"unknown"` in that case.
- `stops[].visitHours` can be `null`. Check `visitDurationUnknown` boolean.
- `stops[].estimatedCost` can be `null`. Check `costKnown` boolean.
- `cost.estimatedTotal` is `null` when any stop has unknown cost. `knownSubtotal` sums only known costs.
- `cost.budgetStatus`: `"within-budget"`, `"exceeds-budget"`, `"unknown-costs"`, `"no-budget"`.
- `itinerary.warnings[].code` can be: `"invalid-duration"`, `"exceeds-duration"`, `"exceeds-daily-time"`, `"unknown-cost"`, `"unknown-visit-duration"`, `"unknown-travel-time"`, `"unknown-travel-distance"`.

### Cost Summary (top-level)

Same object as `itinerary.cost`. Provided at top level for convenience.

### Warnings Array

```json
{
  "code": "starting-coordinates-unavailable",
  "message": "No exact starting coordinates were provided...",
  "source": "planning"
}
```

- `source` is `"planning"` or `"itinerary"`.
- Warning codes from planning: `"no-destinations-found"`, `"no-recommendations"`, `"starting-coordinates-unavailable"`, `"destination-selection-trimmed"`.
- Warning codes from itinerary: same as `ItineraryWarningCode` above.
- Safe for UI display.

### Metadata Object

```json
{
  "loadedDestinationCount": 20,
  "candidateCount": 15,
  "selectedDestinationCount": 5,
  "missing": {
    "withoutCoordinates": 10,
    "withoutCost": 3,
    "withoutVisitDuration": 2
  },
  "startingLocation": {
    "label": "Imphal",
    "coordinates": null,
    "source": "imphal-label-fallback"
  }
}
```

- `missing.withoutCoordinates`: count of loaded destinations lacking verified coordinates.
- `startingLocation.source`: `"provided-coordinates"`, `"imphal-label-fallback"`, or `"label-only"`.

### Server Errors (500)

- `code: "data-error"` - Supabase query failure.
- `code: "internal-error"` - unexpected server error.

---

## GET /api/explore

General-purpose read-only endpoint for browsing the tourism database. Supports listing all records of a type or fetching a single record by ID.

**Method:** GET

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | **Yes** | One of: `destinations`, `food`, `experiences`, `accommodation`, `events`, `transport`. |
| `id` | string | No | UUID of a specific record to fetch. When provided, returns a single object instead of a list. Not supported for `transport`. |
| `district` | string | No | Filter destinations by district (exact match). Only applies when `type=destinations` and `id` is absent. |
| `category` | string | No | Filter destinations by category (exact match). Only applies when `type=destinations` and `id` is absent. |
| `interests` | string | No | Comma-separated interest tags (e.g., `nature,culture`). Filters destinations whose `tags` overlap with any provided term. Only applies when `type=destinations` and `id` is absent. |

### Validation Errors (400)

Returns the common error shape:
- `code: "invalid-type"` when `type` is missing or not one of the allowed values.
- `code: "unsupported"` when `type=transport` is used with an `id` (single transport lookup is not supported).

```json
{
  "ok": false,
  "error": {
    "code": "invalid-type",
    "message": "type query parameter is required. Must be one of: destinations, food, experiences, accommodation, events, transport."
  }
}
```

### Successful List Response (200, no `id`)

```json
{
  "ok": true,
  "data": []
}
```

`data` is an array of domain objects. The shape depends on `type`:

**Destinations:** See recommendation candidates in `POST /api/trip-plan` for the destination shape. Each item includes `id`, `name`, `district`, `category`, `description`, `latitude`, `longitude`, `distanceFromImphal`, `estimatedCost`, `estimatedVisitDuration`, `bestTime`, `tags`, `openingHours`, `contact`, `imageUrl`, `sourceName`, `sourceUrl`, `notes`, `createdAt`, `updatedAt`.

**Food:** `id`, `name`, `location`, `district`, `latitude`, `longitude`, `cuisine`, `localDishes` (string[]), `priceRange`, `openingHours`, `contact`, `imageUrl`, `tags` (string[]), `sourceName`, `sourceUrl`, `notes`, `createdAt`, `updatedAt`.

**Experiences:** `id`, `name`, `location`, `district`, `category`, `description`, `duration`, `estimatedCost`, `bestTime`, `difficulty`, `bookingRequired`, `contact`, `imageUrl`, `tags` (string[]), `sourceName`, `sourceUrl`, `notes`, `createdAt`, `updatedAt`.

**Accommodation:** `id`, `name`, `location`, `district`, `latitude`, `longitude`, `type`, `priceRange`, `facilities` (string[]), `contact`, `bookingUrl`, `imageUrl`, `sourceName`, `sourceUrl`, `notes`, `createdAt`, `updatedAt`.

**Events:** `id`, `name`, `category`, `startDate`, `endDate`, `year`, `annualOrOneTime`, `location`, `district`, `description`, `organizer`, `officialUrl`, `imageUrl`, `sourceName`, `sourceUrl`, `notes`, `createdAt`, `updatedAt`.

**Transport:** `id`, `origin`, `destination`, `transportType`, `approxDistance`, `approxTime`, `notes`, `sourceName`, `sourceUrl`, `createdAt`, `updatedAt`.

### Successful Single Response (200, with `id`)

```json
{
  "ok": true,
  "data": { "id": "uuid", "name": "Loktak Lake" }
}
```

`data` is a single object of the same shape as the list items above.

### Not Found (404)

Returned when `id` is provided but no matching record exists:

```json
{
  "ok": false,
  "error": {
    "code": "not-found",
    "message": "Destination not found."
  }
}
```

Message varies by type: "Food record not found.", "Experience not found.", etc.

### Server Errors (500)

- `code: "data-error"` - Supabase query failure.
- `code: "internal-error"` - unexpected server error.

### NULL Behavior

All fields that can be NULL in the database are returned as `null` in the JSON response. This includes `latitude`, `longitude`, `estimatedCost`, `district`, `description`, `contact`, `imageUrl`, `sourceName`, `sourceUrl`, etc. Frontend must handle nulls gracefully. Do NOT substitute default values.

### Notes

- This endpoint is read-only. It does not modify data.
- Results are sorted alphabetically by name (or by origin then destination for transport).
- Empty filter strings and empty interest arrays are ignored.
- The `interests` filter uses PostgreSQL array overlap (`&&`), so it matches if ANY tag overlaps.

---

## POST /api/weather

Fetches weather forecast from Open-Meteo for specified destinations or coordinates.

**Method:** POST

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `destinationIds` | string[] | Conditional | UUIDs of destinations. At least one of `destinationIds` or `coordinates` must be provided. |
| `coordinates` | object | Conditional | `{ latitude: number, longitude: number }`. At least one of `destinationIds` or `coordinates` must be provided. |
| `label` | string | No | Human-readable label for the coordinates point. |
| `startDate` | string | No | Date in `YYYY-MM-DD` format. Defaults to today if omitted. |
| `days` | number | No | Integer 1-7. Defaults to 3. |

### Validation Errors (400)

Same common error shape. Possible validation fields: `destinationIds`, `coordinates`, `coordinates.latitude`, `coordinates.longitude`, `label`, `startDate`, `days`.

Key rules:
- `days` must be integer between 1 and 7.
- `startDate` must be valid `YYYY-MM-DD`.
- At least one of `destinationIds` or `coordinates` is required.

### Successful Response (200)

```json
{
  "provider": "open-meteo",
  "timezone": "Asia/Kolkata",
  "startDate": "2026-09-23",
  "days": 3,
  "generatedAt": "2026-09-23T10:00:00.000Z",
  "request": {
    "destinationIds": ["uuid1"],
    "coordinates": null
  },
  "points": [
    {
      "id": "uuid1",
      "name": "Loktak Lake",
      "coordinates": { "latitude": 24.45, "longitude": 93.77 },
      "source": "database",
      "status": "ok",
      "error": null,
      "forecast": [
        {
          "date": "2026-09-23",
          "condition": {
            "code": 0,
            "label": "Clear sky",
            "category": "good",
            "outdoorSuitable": true
          },
          "temperatureMax": 28.5,
          "temperatureMin": 18.2,
          "precipitationProbabilityMax": 10,
          "precipitationSum": 0,
          "windSpeedMax": 12.3
        }
      ]
    }
  ],
  "warnings": []
}
```

**Point status values:**
- `"ok"` - forecast retrieved successfully.
- `"coordinate-missing"` - destination has no verified coordinates in the database. The point's `coordinates` will be `null` and `forecast` will be empty.
- `"upstream-error"` - Open-Meteo request failed.
- `"no-data"` - no forecast data returned.

**Weather condition categories:**
- `"good"` - suitable for outdoor activities.
- `"mixed"` - partially suitable.
- `"adverse"` - not suitable for outdoor activities.

**Important NULL behavior:**
- `temperatureMax`, `temperatureMin`, `precipitationProbabilityMax`, `precipitationSum`, `windSpeedMax` can all be `null` if Open-Meteo does not return them.
- A point with `status: "coordinate-missing"` means the destination exists but lacks verified coordinates. Do NOT fall back to hardcoded coordinates.

**Warnings:**
```json
{ "code": "missing-coordinates", "message": "..." }
```
Codes: `"missing-coordinates"`, `"upstream-error"`, `"no-data"`.

### Server Errors (500)

Returned when `result.kind === "data"`:
```json
{ "ok": false, "error": { "code": "weather-upstream-error", "message": "..." } }
```

---

## POST /api/nearby

Finds tourism places near a given coordinate within a radius.

**Method:** POST

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `latitude` | number | **Yes** | Center latitude (-90 to 90). |
| `longitude` | number | **Yes** | Center longitude (-180 to 180). |
| `radiusKm` | number | No | Search radius in km. Default 50. Range 1-300. |
| `kinds` | string[] | No | Filter by kind. Default all four. Allowed: `"destinations"`, `"food"`, `"experiences"`, `"accommodation"`. |
| `limitPerKind` | number | No | Max results per kind. Default 10. Range 1-50. |

### Validation Errors (400)

Same common error shape. Fields: `latitude`, `longitude`, `radiusKm`, `kinds`, `limitPerKind`.

Invalid `kinds` entries produce: `"unknown nearby kind \"X\". Allowed: destinations, food, experiences, accommodation."`

### Successful Response (200)

```json
{
  "request": {
    "center": { "latitude": 24.81, "longitude": 93.94 },
    "radiusKm": 50,
    "kinds": ["destinations", "food"],
    "limitPerKind": 10
  },
  "groups": [
    {
      "kind": "destinations",
      "items": [
        {
          "id": "uuid1",
          "name": "Kangla Fort",
          "kind": "destinations",
          "category": "heritage",
          "district": "Imphal West",
          "coordinates": { "latitude": 24.81, "longitude": 93.94 },
          "distanceKm": 1.2,
          "sourceName": "Manipur Tourism",
          "sourceUrl": "https://manipurtourism.gov.in/"
        }
      ],
      "skippedWithoutCoordinates": 3
    }
  ],
  "totalMatches": 5,
  "warnings": []
}
```

**Important notes:**
- `distanceKm` is calculated via Haversine formula. It is a straight-line estimate, not a road distance.
- `skippedWithoutCoordinates` counts how many records of that kind were excluded because they lack verified coordinates.
- Items without coordinates are never returned. The API does not guess positions.
- `sourceName` and `sourceUrl` come from the database. They can be `null`.
- `category` and `district` can be `null`.

**Warnings:**
```json
{ "code": "no-places-nearby", "message": "..." }
```
Codes: `"missing-coordinates"`, `"no-places-nearby"`.

### Server Errors (500)

Same pattern as weather.

---

## Shared Types Reference

### Coordinates
```json
{ "latitude": number, "longitude": number }
```

### ValidationIssue
```json
{ "field": "string", "message": "string" }
```

---

## Data Integrity Rules for Frontend

1. **NULL coordinates**: 10 of 20 destinations have `null` coordinates. Map components must handle this gracefully (skip marker, show "location unavailable" text). Never fabricate coordinates.

2. **Estimated values**: All distances (`distanceKm`, `distanceFromImphal`) and travel times (`travelTime`) are estimates. Always label them as "estimated" in the UI. Never present them as live GPS/routing data.

3. **NULL costs**: When `estimatedCost` is `null`, do not display a price. Display "Cost unavailable" or similar.

4. **Recommendation scores**: 0.0-1.0 scale. The `explanation` array is safe for direct UI display.

5. **Weather data**: Sourced from Open-Meteo. Forecast points may fail individually (check `status` per point). A failed point does not invalidate other points.

6. **Nearby results**: Only includes records with verified coordinates. `skippedWithoutCoordinates` tells you how many were excluded.

7. **Source attribution**: `sourceName` and `sourceUrl` fields are available on nearby results. Use them when displaying data provenance.

8. **Empty states**: When `recommendations` is empty, `itinerary.days` will be empty. Handle this as an empty state in the UI.

9. **Warnings**: Always render warnings. They communicate important limitations (missing coordinates, trimmed selections, unknown costs) that affect user expectations.
