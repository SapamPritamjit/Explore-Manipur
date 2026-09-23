import { WeatherError } from "./errors";
import { classifyWeatherCode } from "./conditions";
import { addDays } from "./dates";
import type { DailyForecast, WeatherPointInput } from "./types";

export const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";
export const WEATHER_TIMEOUT_MS = 10000;

const DAILY_VARIABLES = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "precipitation_sum",
  "wind_speed_10m_max",
].join(",");

export interface OpenMeteoOptions {
  startDate: string | null;
  days: number;
  timezone?: string;
}

export interface OpenMeteoDailyPayload {
  time: string[];
  weather_code: Array<number | null>;
  temperature_2m_max: Array<number | null>;
  temperature_2m_min: Array<number | null>;
  precipitation_probability_max: Array<number | null>;
  precipitation_sum: Array<number | null>;
  wind_speed_10m_max: Array<number | null>;
}

interface OpenMeteoJson {
  daily?: unknown;
}

function roundValue(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 10) / 10;
}

export function buildForecastUrl(
  point: WeatherPointInput,
  options: OpenMeteoOptions
): string {
  const params = new URLSearchParams({
    latitude: String(point.coordinates.latitude),
    longitude: String(point.coordinates.longitude),
    timezone: options.timezone ?? DEFAULT_TIMEZONE,
    daily: DAILY_VARIABLES,
  });
  if (options.startDate) {
    params.set("start_date", options.startDate);
    params.set("end_date", addDays(options.startDate, options.days - 1));
  } else {
    params.set("forecast_days", String(options.days));
  }
  return `${OPEN_METEO_ENDPOINT}?${params.toString()}`;
}

export function mapDailyPayload(
  payload: OpenMeteoDailyPayload | undefined | null,
  name: string
): DailyForecast[] {
  if (
    !payload ||
    !Array.isArray(payload.time) ||
    payload.time.length === 0
  ) {
    throw new WeatherError(
      `Open-Meteo returned no daily forecast rows for ${name}.`,
      "weather-no-data"
    );
  }

  const result: DailyForecast[] = [];
  for (let index = 0; index < payload.time.length; index++) {
    const code = payload.weather_code?.[index];
    if (typeof code !== "number") {
      continue;
    }
    result.push({
      date: payload.time[index],
      condition: classifyWeatherCode(code),
      temperatureMax: roundValue(payload.temperature_2m_max?.[index]),
      temperatureMin: roundValue(payload.temperature_2m_min?.[index]),
      precipitationProbabilityMax: roundValue(
        payload.precipitation_probability_max?.[index]
      ),
      precipitationSum: roundValue(payload.precipitation_sum?.[index]),
      windSpeedMax: roundValue(payload.wind_speed_10m_max?.[index]),
    });
  }

  if (result.length === 0) {
    throw new WeatherError(
      `Open-Meteo returned rows without usable weather codes for ${name}.`,
      "weather-no-data"
    );
  }
  return result;
}

export async function fetchDailyForecast(
  point: WeatherPointInput,
  options: OpenMeteoOptions,
  fetchFn: typeof fetch = fetch
): Promise<DailyForecast[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);

  try {
    const response = await fetchFn(buildForecastUrl(point, options), {
      signal: controller.signal,
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new WeatherError(
        `Open-Meteo returned HTTP ${response.status} for ${point.name}.`,
        "weather-upstream"
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new WeatherError(
        `Open-Meteo returned an invalid response body for ${point.name}.`,
        "weather-upstream"
      );
    }

    const json = body as OpenMeteoJson;
    return mapDailyPayload(
      json.daily as OpenMeteoDailyPayload | null | undefined,
      point.name
    );
  } catch (error) {
    if (error instanceof WeatherError) {
      throw error;
    }
    throw new WeatherError(
      error instanceof Error ? error.message : String(error),
      "weather-fetch"
    );
  } finally {
    clearTimeout(timer);
  }
}