import type { WeatherCategory, WeatherCondition } from "./types";

interface CodeDefinition {
  label: string;
  category: WeatherCategory;
}

const CODE_LOOKUP: Record<number, CodeDefinition> = {
  0: { label: "Clear sky", category: "good" },
  1: { label: "Mainly clear", category: "good" },
  2: { label: "Partly cloudy", category: "good" },
  3: { label: "Overcast", category: "mixed" },
  45: { label: "Fog", category: "mixed" },
  48: { label: "Depositing rime fog", category: "mixed" },
  51: { label: "Light drizzle", category: "mixed" },
  53: { label: "Moderate drizzle", category: "mixed" },
  55: { label: "Dense drizzle", category: "mixed" },
  56: { label: "Light freezing drizzle", category: "adverse" },
  57: { label: "Dense freezing drizzle", category: "adverse" },
  61: { label: "Slight rain", category: "mixed" },
  63: { label: "Moderate rain", category: "mixed" },
  65: { label: "Heavy rain", category: "adverse" },
  66: { label: "Light freezing rain", category: "adverse" },
  67: { label: "Heavy freezing rain", category: "adverse" },
  71: { label: "Slight snowfall", category: "mixed" },
  73: { label: "Moderate snowfall", category: "adverse" },
  75: { label: "Heavy snowfall", category: "adverse" },
  77: { label: "Snow grains", category: "mixed" },
  80: { label: "Slight rain showers", category: "mixed" },
  81: { label: "Moderate rain showers", category: "mixed" },
  82: { label: "Violent rain showers", category: "adverse" },
  85: { label: "Slight snow showers", category: "adverse" },
  86: { label: "Heavy snow showers", category: "adverse" },
  95: { label: "Thunderstorm", category: "adverse" },
  96: { label: "Thunderstorm with slight hail", category: "adverse" },
  99: { label: "Thunderstorm with heavy hail", category: "adverse" },
};

const UNKNOWN_CATEGORY: WeatherCategory = "mixed";

export function classifyWeatherCode(code: number): WeatherCondition {
  const definition = CODE_LOOKUP[code];
  if (!definition) {
    return {
      code,
      label: "Unknown condition",
      category: UNKNOWN_CATEGORY,
      outdoorSuitable: true,
    };
  }
  return {
    code,
    label: definition.label,
    category: definition.category,
    outdoorSuitable: definition.category !== "adverse",
  };
}

export function isOutdoorAffinityCategory(category: string | null | undefined): boolean {
  const value = (category ?? "").trim().toLowerCase();
  return value === "nature" || value === "adventure";
}