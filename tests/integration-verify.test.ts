import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/data", async (importActual) => {
  const actual = await importActual<typeof import("@/backend/data")>();
  return { ...actual, listDestinations: vi.fn() };
});

import { planTrip, validateTripPlanRequest } from "@/backend/trip-planning";
import { listDestinations } from "@/backend/data";
import type { Destination } from "@/backend/data";
import { recommend, validateWeights } from "@/backend/recommendation";
import type { TourismCandidate } from "@/backend/recommendation";
import { buildItinerary } from "@/backend/itinerary";
import { findNearbyInDataset } from "@/backend/nearby";
import type { NearbyDataset } from "@/backend/nearby";

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
  estimatedVisitDuration: "3 hours",
  tags: ["lake", "nature", "boating"],
});

const kangla = destination("Kangla Fort", {
  district: "Imphal West",
  category: "Culture",
  latitude: 24.81,
  longitude: 93.94,
  distanceFromImphal: 2,
  estimatedCost: 200,
  estimatedVisitDuration: "2 hours",
  tags: ["fort", "history", "culture"],
});

const shirui = destination("Shirui Peak", {
  district: "Ukhrul",
  category: "Trekking",
  latitude: 25.17,
  longitude: 94.44,
  distanceFromImphal: 83,
  estimatedCost: null,
  estimatedVisitDuration: "4 hours",
  tags: ["trekking", "lily", "nature"],
});

const imaMarket = destination("Ima Keithel", {
  district: "Imphal West",
  category: "Culture",
  latitude: null,
  longitude: null,
  distanceFromImphal: 1,
  estimatedCost: 100,
  estimatedVisitDuration: "2 hours",
  tags: ["market", "culture", "food"],
});

const seedDestinations = [loktak, kangla, shirui, imaMarket];

beforeEach(() => {
  mockedListDestinations.mockReset();
  mockedListDestinations.mockResolvedValue(seedDestinations);
});

describe("Step 3: trip-plan Case A - 3 days, budget 5000, nature+culture, Imphal", () => {
  it("returns recommendations and itinerary for a standard request", async () => {
    const result = await planTrip({
      tripDurationDays: 3,
      budget: 5000,
      interests: ["nature", "culture"],
      startingLocation: "Imphal",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.recommendations.length).toBeGreaterThan(0);
    expect(result.response.itinerary.days.length).toBeGreaterThan(0);
    expect(result.response.itinerary.days.length).toBeLessThanOrEqual(3);
    expect(result.response.metadata.loadedDestinationCount).toBe(4);
    expect(result.response.request.budget).toBe(5000);
    expect(result.response.request.interests).toEqual(["nature", "culture"]);
    expect(result.response.request.startingLocation!.label).toBe("Imphal");
  });

  it("produces deterministic scores across identical calls", async () => {
    const first = await planTrip({
      tripDurationDays: 3,
      budget: 5000,
      interests: ["nature", "culture"],
      startingLocation: "Imphal",
    });
    const second = await planTrip({
      tripDurationDays: 3,
      budget: 5000,
      interests: ["nature", "culture"],
      startingLocation: "Imphal",
    });

    expect(first).toEqual(second);
  });

  it("scores match the 40/20/20/20 weight formula", () => {
    expect(validateWeights()).toBe(true);

    const candidate: TourismCandidate = {
      id: "test",
      name: "Test",
      category: "Nature",
      tags: ["nature"],
      district: null,
      coordinates: { latitude: 24.55, longitude: 93.78 },
      distanceFromImphal: 48,
      estimatedCost: 300,
      estimatedVisitDuration: "3 hours",
      bestTime: null,
    };

    const results = recommend(
      { durationDays: 3, budget: 5000, interests: ["nature"] },
      [candidate]
    );

    expect(results).toHaveLength(1);
    const breakdown = results[0].breakdown;
    const expectedScore =
      breakdown.interest * 0.4 +
      breakdown.budget * 0.2 +
      breakdown.geographic * 0.2 +
      breakdown.time * 0.2;
    expect(results[0].score).toBeCloseTo(expectedScore, 5);
  });

  it("provides human-readable explanations for each recommendation", async () => {
    const result = await planTrip({
      tripDurationDays: 3,
      budget: 5000,
      interests: ["nature", "culture"],
      startingLocation: "Imphal",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const rec of result.response.recommendations) {
      expect(rec.explanation.length).toBeGreaterThan(0);
      for (const line of rec.explanation) {
        expect(typeof line).toBe("string");
        expect(line.length).toBeGreaterThan(0);
      }
    }
  });

  it("does not invent costs for destinations with unknown cost", async () => {
    const result = await planTrip({
      tripDurationDays: 3,
      budget: 5000,
      interests: ["nature"],
      startingLocation: "Imphal",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const shiruiRec = result.response.recommendations.find(
      (r) => r.candidate.name === "Shirui Peak"
    );
    expect(shiruiRec?.candidate.estimatedCost).toBeNull();
    expect(shiruiRec?.breakdown.costKnown).toBe(false);
    expect(shiruiRec?.breakdown.budgetStatus).toBe("unknown-cost");
  });

  it("preserves warnings about missing data", async () => {
    const result = await planTrip({
      tripDurationDays: 3,
      budget: 5000,
      interests: ["nature"],
      startingLocation: "Imphal",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const warningCodes = result.response.warnings.map((w) => w.code);
    expect(warningCodes).toContain("starting-coordinates-unavailable");
  });
});

describe("Step 3: trip-plan Case B - 1 day, no budget, one interest", () => {
  it("handles omitted budget gracefully", async () => {
    const result = await planTrip({
      tripDurationDays: 1,
      interests: ["culture"],
      startingLocation: "Imphal",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.request.budget).toBeNull();
    expect(result.response.itinerary.days.length).toBeLessThanOrEqual(1);

    for (const rec of result.response.recommendations) {
      expect(rec.breakdown.budgetStatus).toBe("no-budget-specified");
    }
  });
});

describe("Step 3: trip-plan Case C - different starting location", () => {
  it("accepts a non-Imphal starting location with coordinates", async () => {
    const result = await planTrip({
      tripDurationDays: 2,
      budget: 3000,
      interests: ["nature"],
      startingLocation: "Ukhrul",
      startingLatitude: 25.17,
      startingLongitude: 94.44,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.request.startingLocation!.label).toBe("Ukhrul");
    expect(result.response.request.startingLocation!.coordinates).toEqual({
      latitude: 25.17,
      longitude: 94.44,
    });
    expect(result.response.metadata.startingLocation!.source).toBe("provided-coordinates");
    expect(result.response.warnings).not.toContainEqual(
      expect.objectContaining({ code: "starting-coordinates-unavailable" })
    );
  });

  it("uses label-only source when no coordinates and not Imphal", async () => {
    const result = await planTrip({
      tripDurationDays: 2,
      interests: ["nature"],
      startingLocation: "Moirang",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.metadata.startingLocation!.source).toBe("label-only");
  });
});

describe("Step 7: combined user flow verification", () => {
  it("Flow A: plan my trip end-to-end", async () => {
    const planResult = await planTrip({
      tripDurationDays: 3,
      budget: 8000,
      interests: ["nature", "culture", "food"],
      startingLocation: "Imphal",
    });

    expect(planResult.ok).toBe(true);
    if (!planResult.ok) return;

    expect(planResult.response.recommendations.length).toBeGreaterThan(0);
    expect(planResult.response.itinerary.days.length).toBeGreaterThan(0);
    expect(planResult.response.itinerary.orderedDestinationIds.length).toBeGreaterThan(0);

    const selectedIds = planResult.response.recommendations
      .filter((r) => r.selected)
      .map((r) => r.candidate.id);
    expect(planResult.response.itinerary.orderedDestinationIds).toEqual(selectedIds);

    expect(planResult.response.costSummary).toBeDefined();
    expect(planResult.response.warnings).toBeDefined();
  });

  it("Flow B: explore without forced itinerary", () => {
    const candidates: TourismCandidate[] = seedDestinations.map((d) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      tags: d.tags,
      district: d.district,
      coordinates:
        d.latitude !== null && d.longitude !== null
          ? { latitude: d.latitude, longitude: d.longitude }
          : null,
      distanceFromImphal: d.distanceFromImphal,
      estimatedCost: d.estimatedCost,
      estimatedVisitDuration: d.estimatedVisitDuration,
      bestTime: d.bestTime,
    }));

    const dataset: NearbyDataset = {
      destinations: seedDestinations,
      food: [],
      experiences: [],
      accommodation: [],
    };

    const nearbyResult = findNearbyInDataset(dataset, {
      center: { latitude: 24.81, longitude: 93.94 },
      radiusKm: 50,
      kinds: ["destinations"],
      limitPerKind: 10,
    });

    expect(nearbyResult.groups.length).toBe(1);
    expect(nearbyResult.totalMatches).toBeGreaterThanOrEqual(0);

    const recoResults = recommend(
      { durationDays: 1, interests: [] },
      candidates
    );
    expect(recoResults.length).toBe(candidates.length);
  });

  it("Flow C: discover then plan compatibility", async () => {
    const exploreResult = seedDestinations;
    expect(exploreResult.length).toBeGreaterThan(0);

    const selectedId = exploreResult[0].id;
    expect(typeof selectedId).toBe("string");

    const planResult = await planTrip({
      tripDurationDays: 2,
      budget: 5000,
      interests: ["nature"],
      startingLocation: "Imphal",
    });

    expect(planResult.ok).toBe(true);
    if (!planResult.ok) return;

    const allIds = planResult.response.recommendations.map((r) => r.candidate.id);
    expect(allIds).toContain(selectedId);
  });
});

describe("Step 8: error and data integrity", () => {
  it("rejects malformed input before hitting the database", async () => {
    const result = await planTrip({
      tripDurationDays: -1,
      startingLocation: "",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.length).toBeGreaterThan(0);
    expect(mockedListDestinations).not.toHaveBeenCalled();
  });

  it("validates coordinate ranges", () => {
    const result = validateTripPlanRequest({
      tripDurationDays: 2,
      startingLocation: "Imphal",
      startingLatitude: 100,
      startingLongitude: 200,
    });
    expect(result.kind).toBe("invalid");
  });

  it("validates partial coordinates", () => {
    const result = validateTripPlanRequest({
      tripDurationDays: 2,
      startingLocation: "Imphal",
      startingLatitude: 24.81,
    });
    expect(result.kind).toBe("invalid");
  });

  it("handles empty destination database gracefully", async () => {
    mockedListDestinations.mockResolvedValue([]);
    const result = await planTrip({
      tripDurationDays: 3,
      budget: 5000,
      interests: ["nature"],
      startingLocation: "Imphal",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.recommendations).toEqual([]);
    expect(result.response.itinerary.days).toEqual([]);
    expect(result.response.warnings).toContainEqual(
      expect.objectContaining({ code: "no-destinations-found" })
    );
  });

  it("nearby skips records without coordinates", () => {
    const dataset: NearbyDataset = {
      destinations: [imaMarket],
      food: [],
      experiences: [],
      accommodation: [],
    };

    const result = findNearbyInDataset(dataset, {
      center: { latitude: 24.81, longitude: 93.94 },
      radiusKm: 50,
      kinds: ["destinations"],
      limitPerKind: 10,
    });

    expect(result.groups[0].items).toEqual([]);
    expect(result.groups[0].skippedWithoutCoordinates).toBe(1);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: "missing-coordinates" })
    );
  });

  it("itinerary handles all-null coordinates without crashing", () => {
    const noCoordDests: TourismCandidate[] = [
      {
        id: "nc1",
        name: "No Coord Place",
        category: "General",
        tags: [],
        district: null,
        coordinates: null,
        distanceFromImphal: null,
        estimatedCost: null,
        estimatedVisitDuration: null,
        bestTime: null,
      },
    ];

    const itinerary = buildItinerary({
      durationDays: 1,
      destinations: noCoordDests,
      startingLocation: { label: "Imphal", coordinates: null },
      budget: null,
      dailyAvailableHours: 8,
    });

    expect(itinerary.days.length).toBe(1);
    expect(itinerary.warnings.length).toBeGreaterThan(0);
  });
});
