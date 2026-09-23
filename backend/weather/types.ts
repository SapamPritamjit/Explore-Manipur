import type { Coordinates } from "@/backend/recommendation";
import type { Itinerary } from "@/backend/itinerary";

export interface WeatherRequestInput {
  coordinates?: unknown;
  destinationIds?: unknown;
  label?: unknown;
  startDate?: unknown;
  days?: unknown;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface NormalizedWeatherRequest {
  destinationIds: string[];
  coordinates: Coordinates | null;
  label: string | null;
  startDate: string | null;
  days: number;
  timezone: string;
}

export type WeatherRequestValidation =
  | { kind: "valid"; request: NormalizedWeatherRequest }
  | { kind: "invalid"; issues: ValidationIssue[] };

export type WeatherPointSource = "request" | "database";

export type WeatherPointStatus =
  | "ok"
  | "coordinate-missing"
  | "upstream-error"
  | "no-data";

export interface WeatherPointInput {
  id: string | null;
  name: string;
  coordinates: Coordinates;
  source: WeatherPointSource;
}

export interface WeatherCondition {
  code: number;
  label: string;
  category: WeatherCategory;
  outdoorSuitable: boolean;
}

export type WeatherCategory = "good" | "mixed" | "adverse";

export interface DailyForecast {
  date: string;
  condition: WeatherCondition;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationProbabilityMax: number | null;
  precipitationSum: number | null;
  windSpeedMax: number | null;
}

export interface WeatherForPoint {
  id: string | null;
  name: string;
  coordinates: Coordinates | null;
  source: WeatherPointSource;
  status: WeatherPointStatus;
  error: string | null;
  forecast: DailyForecast[];
}

export type WeatherWarningCode = "missing-coordinates" | "upstream-error" | "no-data";

export interface WeatherWarning {
  code: WeatherWarningCode;
  message: string;
}

export interface WeatherResponse {
  provider: "open-meteo";
  timezone: string;
  startDate: string | null;
  days: number;
  generatedAt: string;
  request: {
    destinationIds: string[];
    coordinates: Coordinates | null;
  };
  points: WeatherForPoint[];
  warnings: WeatherWarning[];
}

export type WeatherResult =
  | { ok: true; response: WeatherResponse }
  | { ok: false; kind: "validation"; issues: ValidationIssue[] }
  | { ok: false; kind: "data"; error: { code: string; message: string } };

export type WeatherAdjustmentCode =
  | "weather-unavailable"
  | "outdoor-stop-adverse-day"
  | "reschedule-to-better-day";

export interface WeatherAdjustment {
  code: WeatherAdjustmentCode;
  message: string;
  dayNumber?: number;
  destinationId?: string;
  destinationName?: string;
}

export interface StopWeatherSummary {
  destinationId: string;
  destinationName: string;
  category: string | null;
  outdoorAffinity: boolean;
  weather: DailyForecast | null;
  weatherAvailable: boolean;
}

export interface ItineraryDayWeatherSummary {
  dayNumber: number;
  date: string | null;
  stops: StopWeatherSummary[];
}

export interface WeatherItineraryAdjustmentInput {
  itinerary: Itinerary;
  forecastByDestinationId: Record<string, DailyForecast[]>;
  startDate?: string | null;
}

export interface WeatherItineraryAdjustment {
  days: ItineraryDayWeatherSummary[];
  suggestions: WeatherAdjustment[];
}