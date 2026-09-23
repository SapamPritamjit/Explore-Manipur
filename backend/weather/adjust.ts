import type { ItineraryStop } from "@/backend/itinerary";
import { addDays } from "./dates";
import { isOutdoorAffinityCategory } from "./conditions";
import type {
  DailyForecast,
  ItineraryDayWeatherSummary,
  StopWeatherSummary,
  WeatherAdjustment,
  WeatherItineraryAdjustment,
  WeatherItineraryAdjustmentInput,
} from "./types";

function dateForDay(startDate: string | null, dayNumber: number): string | null {
  if (!startDate || dayNumber < 1) {
    return null;
  }
  return addDays(startDate, dayNumber - 1);
}

function forecastFor(day: number, forecast: DailyForecast[] | undefined): DailyForecast | null {
  if (!forecast || forecast.length === 0) {
    return null;
  }
  const byIndex = forecast[day - 1];
  if (byIndex) {
    return byIndex;
  }
  return null;
}

function summarizeStop(stop: ItineraryStop): StopWeatherSummary {
  const destination = stop.destination;
  return {
    destinationId: destination.id,
    destinationName: destination.name,
    category: destination.category ?? null,
    outdoorAffinity: isOutdoorAffinityCategory(destination.category),
    weather: null,
    weatherAvailable: false,
  };
}

export function adjustItineraryForWeather(
  input: WeatherItineraryAdjustmentInput
): WeatherItineraryAdjustment {
  const { itinerary, startDate } = input;
  const forecastByDestinationId = input.forecastByDestinationId ?? {};

  const days: ItineraryDayWeatherSummary[] = [];
  const suggestions: WeatherAdjustment[] = [];
  const unavailableSuggestions = new Set<string>();
  const rescheduleSuggestions = new Set<string>();

  for (const day of itinerary.days) {
    const date = dateForDay(startDate ?? null, day.dayNumber);
    const stopSummaries: StopWeatherSummary[] = [];

    for (const stop of day.stops) {
      const destinationId = stop.destination.id;
      const forecast = forecastByDestinationId[destinationId];
      const weather = date
        ? forecast?.find((entry) => entry.date === date) ?? null
        : forecastFor(day.dayNumber, forecast);

      const summary = {
        ...summarizeStop(stop),
        weather,
        weatherAvailable: weather !== null,
      };
      stopSummaries.push(summary);

      if (!weather) {
        if (!unavailableSuggestions.has(destinationId)) {
          unavailableSuggestions.add(destinationId);
          suggestions.push({
            code: "weather-unavailable",
            message: `Weather could not be retrieved for "${summary.destinationName}" (missing coordinates or no forecast data), so no weather-based guidance is available for it.`,
            dayNumber: day.dayNumber,
            destinationId,
            destinationName: summary.destinationName,
          });
        }
        continue;
      }

      if (
        weather.condition.category === "adverse" &&
        summary.outdoorAffinity
      ) {
        suggestions.push({
          code: "outdoor-stop-adverse-day",
          message: `Day ${day.dayNumber}${date ? ` (${date})` : ""}: ${weather.condition.label} is expected at "${summary.destinationName}", an outdoor-oriented destination. Consider rescheduling it or choosing an indoor alternative.`,
          dayNumber: day.dayNumber,
          destinationId,
          destinationName: summary.destinationName,
        });

        if (!rescheduleSuggestions.has(destinationId)) {
          const betterDay = findBetterDay(
            day.dayNumber,
            forecast ?? []
          );
          if (betterDay !== null) {
            rescheduleSuggestions.add(destinationId);
            suggestions.push({
              code: "reschedule-to-better-day",
              message: `Weather outlook improves for "${summary.destinationName}" later in the trip (Day ${betterDay}); consider moving this visit to Day ${betterDay} to reduce weather risk.`,
              dayNumber: day.dayNumber,
              destinationId,
              destinationName: summary.destinationName,
            });
          }
        }
      }
    }

    days.push({ dayNumber: day.dayNumber, date, stops: stopSummaries });
  }

  return { days, suggestions };
}

function findBetterDay(currentDay: number, forecast: readonly DailyForecast[]): number | null {
  for (let index = currentDay; index < forecast.length; index++) {
    if (forecast[index]?.condition.category !== "adverse") {
      return index + 1;
    }
  }
  return null;
}