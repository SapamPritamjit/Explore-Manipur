import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

vi.mock("@/backend/data", async (importActual) => {
  const actual = await importActual<typeof import("@/backend/data")>();
  return { ...actual, listDestinations: vi.fn() };
});

import { validateTripPlanRequest, planTrip } from "@/backend/trip-planning";
import type { TripPlanResponse } from "@/backend/trip-planning";
import { listDestinations } from "@/backend/data";
import type { Destination } from "@/backend/data";

const mockedListDestinations = vi.mocked(listDestinations);

function destination(
  name: string,
  overrides: Partial<Destination> = {}
): Destination {
  return {
    id: `id-${name}`,
    name,
    district: null,
    category: "General",
    description: null,
    latitude: null,
    longitude: null,
    distanceFromImphal: null,
    estimatedCost: null,
    estimatedVisitDuration: null,
    bestTime: null,
    tags: [],
    openingHours: null,
    contact: null,
    imageUrl: null,
    sourceName: null,
    sourceUrl: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const loktak = destination("Loktak Lake", {
  district: "Bishnupur",
  category: "Nature",
  latitude: 24.55,
  longitude: 93.78,
  distanceFromImphal: 48,
  estimatedCost: 300,
  estimatedVisitDuration: "2 hours",
  tags: ["lake", "boating"],
});

const kangla = destination("Kangla Fort", {
  district: "Imphal West",
  category: "Culture",
  latitude: 24.81,
  longitude: 93.94,
  distanceFromImphal: 2,
  estimatedCost: 200,
  estimatedVisitDuration: "2 hours",
  tags: ["fort", "history"],
});

const shirui = destination("Shirui Peak", {
  district: "Ukhrul",
  category: "Trekking",
  latitude: 25.17,
  longitude: 94.44,
  distanceFromImphal: 83,
  estimatedCost: null,
  estimatedVisitDuration: "4 hours",
  tags: ["trekking", "lily"],
});

const baseRequest = {
  tripDurationDays: 2,
  budget: 1000,
  interests: ["lake", "history"],
  startingLocation: "Imphal",
};

beforeEach(() => {
  mockedListDestinations.mockReset();
  mockedListDestinations.mockResolvedValue([loktak, kangla, shirui]);
});

describe("validateTripPlanRequest", () => {
  it("accepts a valid minimal request", () => {
    const result = validateTripPlanRequest({
      tripDurationDays: 3,
      startingLocation: "Imphal",
    });
    expect(result.kind).toBe("valid");
    if (result.kind !== "valid") return;
    expect(result.request.durationDays).toBe(3);
    expect(result.request.budget).toBeNull();
    expect(result.request.interests).toEqual([]);
    expect(result.request.startingLocation).toEqual({
      label: "Imphal",
      coordinates: null,
    });
  });

  it("rejects an invalid duration", () => {
    for (const tripDurationDays of [0, -1, "three"]) {
      const result = validateTripPlanRequest({ tripDurationDays, startingLocation: "Imphal" });
      expect(result.kind).toBe("invalid");
      if (result.kind !== "invalid") return;
      expect(result.issues.some((issue) => issue.field === "tripDurationDays")).toBe(true);
    }
  });

  it("rejects an invalid budget", () => {
    for (const budget of [-5, "lots", -0.1]) {
      const result = validateTripPlanRequest({ tripDurationDays: 2, budget, startingLocation: "Imphal" });
      expect(result.kind).toBe("invalid");
      if (result.kind !== "invalid") return;
      expect(result.issues.some((issue) => issue.field === "budget")).toBe(true);
    }
  });

  it("treats null budget as no budget", () => {
    const result = validateTripPlanRequest({ tripDurationDays: 2, budget: null, startingLocation: "Imphal" });
    expect(result.kind).toBe("valid");
    if (result.kind !== "valid") return;
    expect(result.request.budget).toBeNull();
  });

  it("accepts empty interests and normalizes lists", () => {
    const result = validateTripPlanRequest({
      tripDurationDays: 2,
      interests: [" nature ", "", "boating "],
      startingLocation: "Imphal",
    });
    expect(result.kind).toBe("valid");
    if (result.kind !== "valid") return;
    expect(result.request.interests).toEqual(["nature", "boating"]);
  });

  it("rejects a non-array / non-string interests payload", () => {
    for (const interests of ["nature", [1, 2], 42]) {
      const result = validateTripPlanRequest({ tripDurationDays: 2, interests, startingLocation: "Imphal" });
      expect(result.kind).toBe("invalid");
      if (result.kind !== "invalid") return;
      expect(result.issues.some((issue) => issue.field === "interests")).toBe(true);
    }
  });

  it("rejects coordinates provided without its pair", () => {
    const onlyLat = validateTripPlanRequest({
      tripDurationDays: 2,
      startingLocation: "Imphal",
      startingLatitude: 24.81,
    });
    expect(onlyLat.kind).toBe("invalid");
    const onlyLng = validateTripPlanRequest({
      tripDurationDays: 2,
      startingLocation: "Imphal",
      startingLongitude: 93.93,
    });
    expect(onlyLng.kind).toBe("invalid");
  });

  it("rejects out-of-range coordinates", () => {
    const result = validateTripPlanRequest({
      tripDurationDays: 2,
      startingLocation: "Imphal",
      startingLatitude: 99,
      startingLongitude: 200,
    });
    expect(result.kind).toBe("invalid");
    if (result.kind !== "invalid") return;
    expect(result.issues.some((issue) => issue.field === "startingLatitude")).toBe(true);
    expect(result.issues.some((issue) => issue.field === "startingLongitude")).toBe(true);
  });

  it("rejects a non-positive daily available hours", () => {
    for (const dailyAvailableHours of [0, -4, "plenty"]) {
      const result = validateTripPlanRequest({ tripDurationDays: 2, dailyAvailableHours, startingLocation: "Imphal" });
      expect(result.kind).toBe("invalid");
      if (result.kind !== "invalid") return;
      expect(result.issues.some((issue) => issue.field === "dailyAvailableHours")).toBe(true);
    }
  });

  it("accepts an omitted or empty starting location as optional", () => {
    for (const startingLocation of [undefined, ""]) {
      const result = validateTripPlanRequest({ tripDurationDays: 2, startingLocation });
      expect(result.kind).toBe("valid");
    }
  });

  it("rejects a non-string starting location", () => {
    const result = validateTripPlanRequest({ tripDurationDays: 2, startingLocation: 42 });
    expect(result.kind).toBe("invalid");
    if (result.kind !== "invalid") return;
    expect(result.issues.some((issue) => issue.field === "startingLocation")).toBe(true);
  });

  it("rejects non-string district/category", () => {
    const result = validateTripPlanRequest({
      tripDurationDays: 2,
      startingLocation: "Imphal",
      district: 5,
      category: 9,
    });
    expect(result.kind).toBe("invalid");
    if (result.kind !== "invalid") return;
    expect(result.issues.some((issue) => issue.field === "district")).toBe(true);
    expect(result.issues.some((issue) => issue.field === "category")).toBe(true);
  });

  it("preserves supplied coordinates and daily hours", () => {
    const result = validateTripPlanRequest({
      tripDurationDays: 2,
      startingLocation: "Imphal",
      startingLatitude: 24.81,
      startingLongitude: 93.93,
      dailyAvailableHours: 6,
      district: "Bishnupur",
      category: "Nature",
    });
    expect(result.kind).toBe("valid");
    if (result.kind !== "valid") return;
    expect(result.request.startingLocation!.coordinates).toEqual({ latitude: 24.81, longitude: 93.93 });
    expect(result.request.dailyAvailableHours).toBe(6);
    expect(result.request.district).toBe("Bishnupur");
    expect(result.request.category).toBe("Nature");
  });
});

describe("planTrip", () => {
  it("returns a structured response for a valid request", async () => {
    const result = await planTrip(baseRequest);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expectTypeOf(result.response).toEqualTypeOf<TripPlanResponse>();
    expect(result.response.recommendations).toHaveLength(3);
    const scores = result.response.recommendations.map((recommendation) => recommendation.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    expect(result.response.metadata.loadedDestinationCount).toBe(3);
    expect(result.response.metadata.startingLocation!.source).toBe("imphal-label-fallback");
    expect(result.response.warnings).toContainEqual(
      expect.objectContaining({ code: "starting-coordinates-unavailable", source: "planning" })
    );
    expect(result.response.itinerary.days.length).toBeGreaterThan(0);
    expect(result.response.costSummary).toEqual(result.response.itinerary.cost);
  });

  it("allows empty interests", async () => {
    const result = await planTrip({ ...baseRequest, interests: [] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.recommendations).toHaveLength(3);
    expect(result.response.request.interests).toEqual([]);
  });

  it("filters by district", async () => {
    const result = await planTrip({ ...baseRequest, district: "Bishnupur" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.metadata.candidateCount).toBe(1);
    expect(result.response.recommendations[0].candidate.district).toBe("Bishnupur");
  });

  it("filters by category", async () => {
    const result = await planTrip({ ...baseRequest, category: "Culture" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.metadata.candidateCount).toBe(1);
    expect(result.response.recommendations[0].candidate.category).toBe("Culture");
  });

  it("handles a request with no matching destinations", async () => {
    const result = await planTrip({ ...baseRequest, category: "Beach" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.recommendations).toEqual([]);
    expect(result.response.itinerary.days).toEqual([]);
    expect(result.response.metadata.selectedDestinationCount).toBe(0);
    expect(result.response.warnings).toContainEqual(
      expect.objectContaining({ code: "no-recommendations", source: "planning" })
    );
  });

  it("handles an empty destination database", async () => {
    mockedListDestinations.mockResolvedValue([]);
    const result = await planTrip(baseRequest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.warnings).toContainEqual(
      expect.objectContaining({ code: "no-destinations-found", source: "planning" })
    );
    expect(result.response.itinerary.days).toEqual([]);
  });

  it("integrates recommendations into the itinerary selection", async () => {
    const result = await planTrip({ ...baseRequest, dailyAvailableHours: 8 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const selected = result.response.recommendations.filter((recommendation) => recommendation.selected);
    expect(selected.length).toBeGreaterThan(0);

    expect(result.response.itinerary.orderedDestinationIds).toEqual(
      selected.map((recommendation) => recommendation.candidate.id)
    );

    const stopIds = result.response.itinerary.days.flatMap((day) =>
      day.stops.map((stop) => stop.destination.id)
    );
    expect(stopIds).toEqual(result.response.itinerary.orderedDestinationIds);

    for (const stopId of stopIds) {
      expect(selected.some((recommendation) => recommendation.candidate.id === stopId)).toBe(true);
    }
  });

  it("trims low-ranked destinations to fit the trip duration", async () => {
    mockedListDestinations.mockResolvedValue([
      destination("A", { category: "Nature", latitude: 24.5, longitude: 93.9, estimatedVisitDuration: "4 hours", estimatedCost: 100 }),
      destination("B", { category: "Culture", latitude: 24.6, longitude: 93.9, estimatedVisitDuration: "4 hours", estimatedCost: 100 }),
      destination("C", { category: "Trekking", latitude: 24.7, longitude: 93.9, estimatedVisitDuration: "4 hours", estimatedCost: 100 }),
    ]);
    const result = await planTrip({ ...baseRequest, tripDurationDays: 1, interests: [], budget: null });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.recommendations).toHaveLength(3);
    expect(result.response.metadata.selectedDestinationCount).toBe(2);
    expect(result.response.warnings).toContainEqual(
      expect.objectContaining({ code: "destination-selection-trimmed", source: "planning" })
    );
  });

  it("reports unknown costs without inventing a total", async () => {
    const result = await planTrip(baseRequest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.itinerary.cost.unknownCount).toBeGreaterThan(0);
    expect(result.response.itinerary.cost.estimatedTotal).toBeNull();
    expect(result.response.warnings).toContainEqual(
      expect.objectContaining({ code: "unknown-cost", source: "itinerary" })
    );
    expect(result.response.metadata.missing.withoutCost).toBeGreaterThan(0);
  });

  it("reports unknown travel distance for missing coordinates", async () => {
    mockedListDestinations.mockResolvedValue([
      destination("Loktak Lake", {
        category: "Nature",
        tags: ["lake"],
        estimatedCost: 300,
        estimatedVisitDuration: "2 hours",
      }),
    ]);
    const result = await planTrip({ ...baseRequest, interests: ["lake"] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.metadata.missing.withoutCoordinates).toBe(1);
    const distanceWarnings = result.response.warnings.filter(
      (warning) => warning.code === "unknown-travel-distance"
    );
    expect(distanceWarnings.length).toBeGreaterThan(0);
    expect(distanceWarnings[0].source).toBe("itinerary");
  });

  it("uses the Imphal label fallback for distances", async () => {
    const result = await planTrip({ ...baseRequest, interests: ["lake"] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const loktak = result.response.recommendations.find(
      (recommendation) => recommendation.candidate.id === "id-Loktak Lake"
    );
    expect(loktak?.breakdown.distanceKind).toBe("imphal-estimate");
    expect(loktak?.breakdown.distanceKm).toBe(48);
  });

  it("marks the start as provided-coordinates when both coordinates are given", async () => {
    const result = await planTrip({
      ...baseRequest,
      startingLatitude: 24.81,
      startingLongitude: 93.93,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.metadata.startingLocation!.source).toBe("provided-coordinates");
    expect(result.response.metadata.startingLocation!.coordinates).toEqual({
      latitude: 24.81,
      longitude: 93.93,
    });
    expect(result.response.warnings).not.toContainEqual(
      expect.objectContaining({ code: "starting-coordinates-unavailable" })
    );
  });

  it("returns a within-budget summary when all costs are known", async () => {
    mockedListDestinations.mockResolvedValue([
      destination("Loktak Lake", {
        category: "Nature",
        latitude: 24.55,
        longitude: 93.78,
        estimatedCost: 300,
        estimatedVisitDuration: "2 hours",
        tags: ["lake"],
      }),
      destination("Kangla Fort", {
        category: "Culture",
        latitude: 24.81,
        longitude: 93.94,
        estimatedCost: 200,
        estimatedVisitDuration: "2 hours",
        tags: ["fort"],
      }),
    ]);
    const result = await planTrip({
      tripDurationDays: 1,
      budget: 1000,
      interests: [],
      startingLocation: "Imphal",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.costSummary.budgetStatus).toBe("within-budget");
    expect(result.response.costSummary.estimatedTotal).toBe(500);
  });

  it("is deterministic for identical input", async () => {
    const first = await planTrip(baseRequest);
    const second = await planTrip(baseRequest);
    const third = await planTrip({ ...baseRequest, interests: ["lake"] });

    expect(first).toEqual(second);
    expect(second).not.toEqual(third);
  });

  it("returns validation issues without touching the data layer", async () => {
    const result = await planTrip({ tripDurationDays: 0, startingLocation: "Imphal" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.length).toBeGreaterThan(0);
    expect(mockedListDestinations).not.toHaveBeenCalled();
  });
});
