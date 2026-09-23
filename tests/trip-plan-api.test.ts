import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/trip-planning", async (importActual) => {
  const actual = await importActual<typeof import("@/backend/trip-planning")>();
  return { ...actual, planTrip: vi.fn() };
});

import { POST } from "@/app/api/trip-plan/route";
import { planTrip } from "@/backend/trip-planning";
import type { TripPlanResponse } from "@/backend/trip-planning";
import { DataAccessError } from "@/backend/data";

const mockedPlanTrip = vi.mocked(planTrip);

const okResponse: TripPlanResponse = {
  request: {
    durationDays: 2,
    budget: null,
    interests: [],
    startingLocation: { label: "Imphal", coordinates: null },
    dailyAvailableHours: null,
    district: null,
    category: null,
  },
  recommendations: [],
  itinerary: {
    requestedDays: 2,
    usedDays: 0,
    dailyAvailableHours: 8,
    totalStops: 0,
    orderedDestinationIds: [],
    days: [],
    cost: {
      knownSubtotal: 0,
      unknownCount: 0,
      estimatedTotal: null,
      budgetStatus: "no-budget",
    },
    warnings: [],
  },
  costSummary: {
    knownSubtotal: 0,
    unknownCount: 0,
    estimatedTotal: null,
    budgetStatus: "no-budget",
  },
  warnings: [],
  metadata: {
    loadedDestinationCount: 0,
    candidateCount: 0,
    selectedDestinationCount: 0,
    missing: {
      withoutCoordinates: 0,
      withoutCost: 0,
      withoutVisitDuration: 0,
    },
    startingLocation: {
      label: "Imphal",
      coordinates: null,
      source: "imphal-label-fallback",
    },
  },
};

function post(body: unknown, headers?: Record<string, string>) {
  return POST(
    new Request("http://localhost/api/trip-plan", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  mockedPlanTrip.mockReset();
});

describe("POST /api/trip-plan", () => {
  it("returns 200 with the planned response", async () => {
    mockedPlanTrip.mockResolvedValue({ ok: true, response: okResponse });

    const response = await post({ tripDurationDays: 2, startingLocation: "Imphal" });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(okResponse);
    expect(mockedPlanTrip).toHaveBeenCalledTimes(1);
  });

  it("returns 400 with validation issues for a bad request", async () => {
    mockedPlanTrip.mockResolvedValue({
      ok: false,
      issues: [{ field: "tripDurationDays", message: "tripDurationDays must be a number >= 1." }],
    });

    const response = await post({ tripDurationDays: 0, startingLocation: "Imphal" });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("validation-error");
    expect(body.error.details).toHaveLength(1);
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await post("{not json", {});
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("invalid-json");
    expect(mockedPlanTrip).not.toHaveBeenCalled();
  });

  it("returns 500 for a data-layer error", async () => {
    mockedPlanTrip.mockRejectedValue(
      new DataAccessError("listDestinations: connection failed", "08001")
    );

    const response = await post({ tripDurationDays: 2, startingLocation: "Imphal" });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("data-error");
    expect(body.error.message).toContain("listDestinations");
  });

  it("returns 500 for an unexpected error", async () => {
    mockedPlanTrip.mockRejectedValue(new Error("boom"));

    const response = await post({ tripDurationDays: 2, startingLocation: "Imphal" });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("internal-error");
    expect(body.error.message).toBe("boom");
  });
});