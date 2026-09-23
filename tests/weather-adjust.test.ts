import { describe, expect, it } from "vitest";
import { adjustItineraryForWeather } from "@/backend/weather";
import type { DailyForecast, WeatherItineraryAdjustmentInput } from "@/backend/weather";
import type { Itinerary, ItineraryDay, ItineraryStop } from "@/backend/itinerary";
import type { TourismCandidate } from "@/backend/recommendation";

function candidate(
  id: string,
  name: string,
  category: string
): TourismCandidate {
  return {
    id,
    name,
    category,
    tags: [],
    coordinates: { latitude: 24.5, longitude: 93.9 },
  };
}

function stop(destination: TourismCandidate, visitHours = 2): ItineraryStop {
  return {
    destination,
    visitHours,
    visitDurationUnknown: false,
    costKnown: true,
    estimatedCost: 100,
  };
}

function day(dayNumber: number, stops: ItineraryStop[]): ItineraryDay {
  return {
    dayNumber,
    stops,
    travelSegments: [],
    availableHours: 8,
    scheduledHours: stops.length * 2,
    usedKnownHours: stops.length * 2,
    unknownDurationCount: 0,
    overCapacity: false,
    cost: { knownSubtotal: stops.length * 100, unknownCount: 0 },
  };
}

function itinerary(days: ItineraryDay[]): Itinerary {
  return {
    requestedDays: days.length,
    usedDays: days.length,
    dailyAvailableHours: 8,
    totalStops: days.reduce((sum, d) => sum + d.stops.length, 0),
    orderedDestinationIds: days.flatMap((d) =>
      d.stops.map((stop) => stop.destination.id)
    ),
    days,
    cost: { knownSubtotal: 0, unknownCount: 0, estimatedTotal: 0, budgetStatus: "no-budget" },
    warnings: [],
  };
}

function forecast(
  date: string,
  label: string,
  category: "good" | "mixed" | "adverse"
): DailyForecast {
  return {
    date,
    condition: { code: 0, label, category, outdoorSuitable: category !== "adverse" },
    temperatureMax: 24,
    temperatureMin: 16,
    precipitationProbabilityMax: 10,
    precipitationSum: 0,
    windSpeedMax: 5,
  };
}

const loktak = candidate("d1", "Loktak Lake", "Nature");
const museum = candidate("d2", "Manipur State Museum", "Culture");

const baseInput: WeatherItineraryAdjustmentInput = {
  itinerary: itinerary([day(1, [stop(loktak)]), day(2, [stop(museum)])]),
  forecastByDestinationId: {
    d1: [
      forecast("2026-09-24", "Heavy rain", "adverse"),
      forecast("2026-09-25", "Clear sky", "good"),
    ],
    d2: [
      forecast("2026-09-24", "Partly cloudy", "good"),
      forecast("2026-09-25", "Overcast", "mixed"),
    ],
  },
  startDate: "2026-09-24",
};

describe("adjustItineraryForWeather", () => {
  it("summarizes each stop with matched weather by date", () => {
    const result = adjustItineraryForWeather(baseInput);

    expect(result.days).toHaveLength(2);
    expect(result.days[0]).toMatchObject({ dayNumber: 1, date: "2026-09-24" });
    expect(result.days[0].stops[0].weather?.condition.label).toBe("Heavy rain");
    expect(result.days[1].date).toBe("2026-09-25");
    expect(result.days[1].stops[0]).toMatchObject({
      destinationId: "d2",
      weatherAvailable: true,
    });
  });

  it("flags outdoor stations on adverse days and suggests a reschedule target", () => {
    const result = adjustItineraryForWeather(baseInput);

    const codes = result.suggestions.map((suggestion) => suggestion.code);
    expect(codes).toContain("outdoor-stop-adverse-day");
    expect(codes).toContain("reschedule-to-better-day");

    const reschedule = result.suggestions.find(
      (suggestion) => suggestion.code === "reschedule-to-better-day"
    );
    expect(reschedule?.message).toContain("Day 2");

    const adverse = result.suggestions.find(
      (suggestion) => suggestion.code === "outdoor-stop-adverse-day"
    );
    expect(adverse?.message).toContain("Heavy rain");
    expect(adverse?.message).toContain("Loktak Lake");
  });

  it("does not flag weather for non-outdoor categories", () => {
    const result = adjustItineraryForWeather({
      itinerary: itinerary([day(1, [stop(museum)])]),
      forecastByDestinationId: {
        d2: [forecast("2026-09-24", "Heavy rain", "adverse")],
      },
      startDate: "2026-09-24",
    });

    expect(
      result.suggestions.some(
        (suggestion) => suggestion.code === "outdoor-stop-adverse-day"
      )
    ).toBe(false);
  });

  it("uses day index fallback when no start date is provided", () => {
    const result = adjustItineraryForWeather({
      itinerary: itinerary([day(1, [stop(loktak)])]),
      forecastByDestinationId: {
        d1: [forecast("2026-09-24", "Clear sky", "good")],
      },
      startDate: null,
    });

    expect(result.days[0].date).toBeNull();
    expect(result.days[0].stops[0].weatherAvailable).toBe(true);
    expect(result.suggestions).toEqual([]);
  });

  it("reports weather-unavailable for stops without forecast data", () => {
    const result = adjustItineraryForWeather({
      itinerary: itinerary([day(1, [stop(museum)])]),
      forecastByDestinationId: {},
      startDate: "2026-09-24",
    });

    expect(result.days[0].stops[0].weatherAvailable).toBe(false);
    expect(result.suggestions).toEqual([
      expect.objectContaining({ code: "weather-unavailable" }),
    ]);
  });

  it("produces no suggestions for good weather", () => {
    const result = adjustItineraryForWeather({
      itinerary: itinerary([day(1, [stop(loktak)])]),
      forecastByDestinationId: {
        d1: [forecast("2026-09-24", "Clear sky", "good")],
      },
      startDate: "2026-09-24",
    });

    expect(result.suggestions).toEqual([]);
  });
});