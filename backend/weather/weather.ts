import { listDestinations } from "@/backend/data";
import type { Destination } from "@/backend/data";
import type { Coordinates } from "@/backend/recommendation";
import { fetchDailyForecast, DEFAULT_TIMEZONE } from "./openmeteo";
import { validateWeatherRequest } from "./validate";
import type { WeatherError } from "./errors";
import type {
  NormalizedWeatherRequest,
  WeatherForPoint,
  WeatherPointInput,
  WeatherRequestInput,
  WeatherResult,
  WeatherResponse,
  WeatherWarning,
} from "./types";

function destinationPoints(
  destinations: readonly Destination[],
  requestedIds: readonly string[]
): WeatherForPoint[] {
  const requested = [...requestedIds];
  const byId = new Map(destinations.map((destination) => [destination.id, destination]));
  const points: WeatherForPoint[] = [];

  for (const id of requested) {
    const destination = byId.get(id);
    if (!destination) {
      continue;
    }
    const latitude = destination.latitude;
    const longitude = destination.longitude;
    if (
      latitude === null ||
      longitude === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      points.push({
        id: destination.id,
        name: destination.name,
        coordinates: null,
        source: "database",
        status: "coordinate-missing",
        error:
          "Coordinates are not recorded in the tourism database for this destination.",
        forecast: [],
      });
      continue;
    }
    points.push({
      id: destination.id,
      name: destination.name,
      coordinates: { latitude, longitude },
      source: "database",
      status: "ok",
      error: null,
      forecast: [],
    });
  }

  return points;
}

function requestPoint(request: NormalizedWeatherRequest): WeatherPointInput | null {
  if (!request.coordinates) {
    return null;
  }
  const name = request.label || "Provided location";
  return {
    id: null,
    name,
    coordinates: request.coordinates,
    source: "request",
  };
}

async function forecastForPoint(
  point: WeatherPointInput,
  request: NormalizedWeatherRequest
): Promise<WeatherForPoint> {
  try {
    const forecast = await fetchDailyForecast(point, {
      startDate: request.startDate,
      days: request.days,
      timezone: request.timezone,
    });
    return {
      id: point.id,
      name: point.name,
      coordinates: point.coordinates,
      source: point.source,
      status: "ok",
      error: null,
      forecast,
    };
  } catch (error) {
    const code = (error as WeatherError).code ?? "weather-fetch";
    return {
      id: point.id,
      name: point.name,
      coordinates: point.coordinates,
      source: point.source,
      status: code === "weather-no-data" ? "no-data" : "upstream-error",
      error:
        error instanceof Error
          ? error.message
          : "Weather service failed for this location.",
      forecast: [],
    };
  }
}

function toFetchableInput(point: WeatherForPoint): WeatherPointInput | null {
  const hasCoordinates =
    point.coordinates !== null &&
    Number.isFinite(point.coordinates.latitude) &&
    Number.isFinite(point.coordinates.longitude);
  if (!hasCoordinates) {
    return null;
  }
  return {
    id: point.id,
    name: point.name,
    coordinates: point.coordinates as Coordinates,
    source: point.source,
  };
}

function buildWarnings(points: readonly WeatherForPoint[]): WeatherWarning[] {
  const warnings: WeatherWarning[] = [];
  for (const point of points) {
    if (point.status === "coordinate-missing") {
      warnings.push({
        code: "missing-coordinates",
        message: `Coordinates are not recorded for "${point.name}", so weather could not be retrieved for it.`,
      });
    } else if (point.status === "upstream-error") {
      warnings.push({
        code: "upstream-error",
        message: point.error ?? `Weather could not be retrieved for "${point.name}".`,
      });
    } else if (point.status === "no-data") {
      warnings.push({
        code: "no-data",
        message: point.error ?? `No forecast data was returned for "${point.name}".`,
      });
    }
  }
  return warnings;
}

export async function getWeatherForecast(
  input: WeatherRequestInput
): Promise<WeatherResult> {
  const outcome = validateWeatherRequest(input);
  if (outcome.kind === "invalid") {
    return { ok: false, kind: "validation", issues: outcome.issues };
  }
  const request = outcome.request;

  let destinations: Destination[];
  try {
    destinations = await listDestinations();
  } catch (error) {
    return {
      ok: false,
      kind: "data",
      error: {
        code: "data-error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load destinations for weather lookup.",
      },
    };
  }

  const resolvedPoints = destinationPoints(destinations, request.destinationIds);
  const withCoordinates = resolvedPoints
    .map(toFetchableInput)
    .filter((point): point is WeatherPointInput => point !== null);
  const missingCoordinates = resolvedPoints.filter(
    (point) => point.status === "coordinate-missing"
  );

  const requestPointInput = requestPoint(request);
  const fetchable = requestPointInput
    ? [requestPointInput, ...withCoordinates]
    : withCoordinates;

  const fetched = await Promise.all(
    fetchable.map((point) => forecastForPoint(point, request))
  );

  const unified: WeatherForPoint[] = [...fetched, ...missingCoordinates];

  const response: WeatherResponse = {
    provider: "open-meteo",
    timezone: DEFAULT_TIMEZONE,
    startDate: request.startDate,
    days: request.days,
    generatedAt: new Date().toISOString(),
    request: {
      destinationIds: request.destinationIds,
      coordinates: request.coordinates,
    },
    points: unified,
    warnings: buildWarnings(unified),
  };

  return { ok: true, response };
}