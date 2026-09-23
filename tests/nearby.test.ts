import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/data", () => ({
  listDestinations: vi.fn(),
  listFood: vi.fn(),
  listExperiences: vi.fn(),
  listAccommodation: vi.fn(),
}));

import {
  findNearby,
  findNearbyInDataset,
  validateNearbyRequest,
} from "@/backend/nearby";
import type { NearbyDataset } from "@/backend/nearby";
import {
  listAccommodation,
  listDestinations,
  listExperiences,
  listFood,
} from "@/backend/data";
import type { Destination } from "@/backend/data";

const mockedListDestinations = vi.mocked(listDestinations);
const mockedListFood = vi.mocked(listFood);
const mockedListExperiences = vi.mocked(listExperiences);
const mockedListAccommodation = vi.mocked(listAccommodation);

function destination(
  id: string,
  name: string,
  district: string | null,
  category: string,
  latitude: number | null,
  longitude: number | null
): Destination {
  return {
    id,
    name,
    district,
    category,
    description: null,
    latitude,
    longitude,
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
  };
}

const center = { latitude: 24.817, longitude: 93.9368 };

const dataset: NearbyDataset = {
  destinations: [
    destination(
      "d1",
      "Near East Garden",
      "Imphal East",
      "Nature",
      24.817,
      94.0368
    ),
    destination(
      "d2",
      "North Shore Spot",
      "Imphal West",
      "Heritage",
      24.917,
      93.9368
    ),
    destination(
      "d3",
      "Far Away Place",
      "Tamenglong",
      "Shopping",
      25.5,
      94
    ),
    destination("d4", "No Coordinates", null, "Culture", null, null),
  ],
  food: [],
  experiences: [],
  accommodation: [],
};

const defaultRequest = {
  center,
  radiusKm: 50,
  kinds: ["destinations", "food", "experiences", "accommodation"] as const,
  limitPerKind: 10,
};

describe("findNearbyInDataset", () => {
  it("returns places within the radius sorted by distance", () => {
    const response = findNearbyInDataset(
      dataset,
      { ...defaultRequest, kinds: ["destinations"] }
    );

    expect(response.totalMatches).toBe(2);
    const items = response.groups[0].items;
    expect(items.map((item) => item.name)).toEqual([
      "Near East Garden",
      "North Shore Spot",
    ]);
    expect(items[0].distanceKm).toBeLessThan(items[1].distanceKm);
    expect(items[0].distanceKm).toBeGreaterThan(0);
    expect(items[0]).toMatchObject({
      name: "Near East Garden",
      kind: "destinations",
      category: "Nature",
      district: "Imphal East",
    });
  });

  it("sorts ties by name deterministically", () => {
    const twinRequests = [
      findNearbyInDataset(dataset, {
        ...defaultRequest,
        kinds: ["destinations"],
        radiusKm: 20,
      }),
      findNearbyInDataset(dataset, {
        ...defaultRequest,
        kinds: ["destinations"],
        radiusKm: 20,
      }),
    ];
    expect(twinRequests[0].groups[0].items).toEqual(twinRequests[1].groups[0].items);
  });

  it("excludes places beyond the radius", () => {
    const response = findNearbyInDataset(
      dataset,
      { ...defaultRequest, kinds: ["destinations"], radiusKm: 20 }
    );
    const names = response.groups[0].items.map((item) => item.name);
    expect(names).not.toContain("Far Away Place");
  });

  it("counts and reports records without coordinates", () => {
    const response = findNearbyInDataset(
      dataset,
      { ...defaultRequest, kinds: ["destinations"] }
    );
    expect(response.groups[0].skippedWithoutCoordinates).toBe(1);
    expect(response.warnings.map((warning) => warning.code)).toContain(
      "missing-coordinates"
    );
  });

  it("returns an empty result with a clear warning when nothing matches", () => {
    const response = findNearbyInDataset(
      dataset,
      { ...defaultRequest, kinds: ["destinations"], radiusKm: 1 }
    );
    expect(response.totalMatches).toBe(0);
    expect(response.groups[0].items).toEqual([]);
    expect(response.warnings.map((warning) => warning.code)).toContain(
      "no-places-nearby"
    );
  });

  it("respects limitPerKind", () => {
    const response = findNearbyInDataset(
      dataset,
      { ...defaultRequest, kinds: ["destinations"], limitPerKind: 1 }
    );
    expect(response.groups[0].items).toHaveLength(1);
    expect(response.groups[0].items[0].name).toBe("Near East Garden");
  });

  it("produces empty groups for empty dataset kinds", () => {
    const response = findNearbyInDataset(
      { ...dataset, destinations: [] },
      { ...defaultRequest, kinds: ["food", "destinations"] }
    );
    expect(response.groups).toHaveLength(2);
    expect(response.totalMatches).toBe(0);
  });
});

describe("validateNearbyRequest", () => {
  it("accepts a valid request with defaults", () => {
    const outcome = validateNearbyRequest({
      latitude: 24.817,
      longitude: 93.9368,
    });
    expect(outcome.kind).toBe("valid");
    if (outcome.kind === "valid") {
      expect(outcome.request.radiusKm).toBe(50);
      expect(outcome.request.limitPerKind).toBe(10);
      expect(outcome.request.kinds).toHaveLength(4);
    }
  });

  it("rejects missing or out-of-range coordinates", () => {
    const outcome = validateNearbyRequest({ longitude: 93 });
    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") {
      expect(outcome.issues.map((issue) => issue.field)).toContain("latitude");
    }

    const outOfRange = validateNearbyRequest({
      latitude: 95,
      longitude: 190,
    });
    expect(outOfRange.kind).toBe("invalid");
  });

  it("rejects invalid radius and limit", () => {
    const outcome = validateNearbyRequest({
      latitude: 24.817,
      longitude: 93.9368,
      radiusKm: 0,
      limitPerKind: 2.5,
    });
    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") {
      expect(outcome.issues.map((issue) => issue.field)).toEqual([
        "radiusKm",
        "limitPerKind",
      ]);
    }
  });

  it("rejects unknown nearby kinds", () => {
    const outcome = validateNearbyRequest({
      latitude: 24.817,
      longitude: 93.9368,
      kinds: ["bogus"],
    });
    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") {
      expect(outcome.issues[0].field).toBe("kinds");
    }
  });
});

describe("findNearby orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedListDestinations.mockResolvedValue(dataset.destinations as never);
    mockedListFood.mockResolvedValue([] as never);
    mockedListExperiences.mockResolvedValue([] as never);
    mockedListAccommodation.mockResolvedValue([] as never);
  });

  it("loads the dataset and returns nearby results", async () => {
    const result = await findNearby({
      latitude: 24.817,
      longitude: 93.9368,
      radiusKm: 50,
      kinds: ["destinations"],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.response.totalMatches).toBe(2);
      expect(result.response.groups[0].items.map((item) => item.name)).toEqual([
        "Near East Garden",
        "North Shore Spot",
      ]);
    }
  });

  it("returns validation issues for a bad request", async () => {
    const result = await findNearby({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("validation");
    }
    expect(mockedListDestinations).not.toHaveBeenCalled();
  });

  it("returns a data error when the database fails", async () => {
    mockedListDestinations.mockRejectedValue(
      new Error("listDestinations: connection failed")
    );

    const result = await findNearby({
      latitude: 24.817,
      longitude: 93.9368,
    });
    expect(result.ok).toBe(false);
    if (result.ok || result.kind !== "data") {
      return;
    }
    expect(result.error.code).toBe("data-error");
  });
});