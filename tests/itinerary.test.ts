import { describe, expect, it } from "vitest";
import { buildItinerary } from "@/backend/itinerary";
import type { ItineraryInput } from "@/backend/itinerary";
import type { TourismCandidate } from "@/backend/recommendation";

function destination(
  name: string,
  overrides: Partial<TourismCandidate> = {}
): TourismCandidate {
  return { id: name, name, category: "General", tags: [], ...overrides };
}

function baseInput(overrides: Partial<ItineraryInput>): ItineraryInput {
  return {
    durationDays: 2,
    budget: 10000,
    destinations: [],
    ...overrides,
  };
}

describe("itinerary engine", () => {
  it("creates a one-day itinerary", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        destinations: [
          destination("Kangla Fort", { estimatedVisitDuration: "2 hours" }),
          destination("Ima Market", { estimatedVisitDuration: "2 hours" }),
        ],
      })
    );
    expect(itinerary.requestedDays).toBe(1);
    expect(itinerary.usedDays).toBe(1);
    expect(itinerary.days).toHaveLength(1);
    expect(itinerary.days[0].stops.map((stop) => stop.destination.id)).toEqual([
      "Kangla Fort",
      "Ima Market",
    ]);
  });

  it("spreads stops across multiple days", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 2,
        destinations: [
          destination("A", { estimatedVisitDuration: "4 hours" }),
          destination("B", { estimatedVisitDuration: "4 hours" }),
          destination("C", { estimatedVisitDuration: "4 hours" }),
        ],
      })
    );
    expect(itinerary.usedDays).toBe(2);
    expect(itinerary.days.map((day) => day.stops.length)).toEqual([2, 1]);
  });

  it("puts multiple stops in a single day", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        destinations: [
          destination("A", { estimatedVisitDuration: "1 hour" }),
          destination("B", { estimatedVisitDuration: "1 hour" }),
          destination("C", { estimatedVisitDuration: "1 hour" }),
        ],
      })
    );
    expect(itinerary.days[0].stops).toHaveLength(3);
    expect(itinerary.days[0].scheduledHours).toBe(3);
  });

  it("respects a custom daily available-hours limit", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 2,
        dailyAvailableHours: 2,
        destinations: [
          destination("A", { estimatedVisitDuration: "1 hour" }),
          destination("B", { estimatedVisitDuration: "1 hour" }),
          destination("C", { estimatedVisitDuration: "1 hour" }),
          destination("D", { estimatedVisitDuration: "1 hour" }),
          destination("E", { estimatedVisitDuration: "1 hour" }),
        ],
      })
    );
    expect(itinerary.dailyAvailableHours).toBe(2);
    expect(itinerary.days.map((day) => day.stops.length)).toEqual([2, 2, 1]);
    expect(itinerary.warnings.some((w) => w.code === "exceeds-duration")).toBe(true);
  });

  it("marks missing visit duration as unknown and schedules it safely", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        destinations: [
          destination("A", { estimatedVisitDuration: null }),
          destination("B", { estimatedVisitDuration: "2 hours" }),
        ],
      })
    );
    expect(itinerary.days[0].stops[0].visitDurationUnknown).toBe(true);
    expect(itinerary.days[0].stops[0].visitHours).toBeNull();
    expect(itinerary.days[0].unknownDurationCount).toBe(1);
    expect(itinerary.warnings.some((w) => w.code === "unknown-visit-duration")).toBe(true);
  });

  it("keeps stable input order when coordinates are missing", () => {
    const c1 = destination("Zed Hill", { coordinates: null, distanceFromImphal: null });
    const c2 = destination("Alpha Lake", { coordinates: null, distanceFromImphal: null });
    const itinerary = buildItinerary(
      baseInput({
        startingLocation: { label: "Imphal", coordinates: null },
        destinations: [c1, c2],
      })
    );
    expect(itinerary.orderedDestinationIds).toEqual(["Zed Hill", "Alpha Lake"]);
    expect(itinerary.days[0].stops.map((s) => s.destination.id)).toEqual([
      "Zed Hill",
      "Alpha Lake",
    ]);
    const segments = itinerary.days[0].travelSegments;
    expect(segments.every((segment) => segment.distanceKm === null)).toBe(true);
    expect(itinerary.warnings.some((w) => w.code === "unknown-travel-distance")).toBe(true);
  });

  it("orders by nearest neighbour when coordinates are known", () => {
    const far = destination("Far", { coordinates: { latitude: 0, longitude: 10 } });
    const near = destination("Near", { coordinates: { latitude: 0, longitude: 1 } });
    const mid = destination("Mid", { coordinates: { latitude: 0, longitude: 5 } });
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        startingLocation: {
          label: "Imphal",
          coordinates: { latitude: 0, longitude: 0 },
        },
        destinations: [far, near, mid],
      })
    );
    expect(itinerary.orderedDestinationIds).toEqual(["Near", "Mid", "Far"]);
    const firstSegment = itinerary.days[0].travelSegments[0];
    expect(firstSegment.distanceType).toBe("haversine");
    expect(firstSegment.distanceKm).toBeCloseTo(111.2, 0);
  });

  it("never invents travel time", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        destinations: [destination("A", { coordinates: null })],
      })
    );
    const segments = itinerary.days[0].travelSegments;
    expect(segments.length).toBeGreaterThan(0);
    expect(segments.every((segment) => segment.travelTime === null)).toBe(true);
    expect(segments.every((segment) => segment.travelTimeUnknown)).toBe(true);
    expect(itinerary.warnings.some((w) => w.code === "unknown-travel-time")).toBe(true);
  });

  it("uses the Imphal-label fallback for start segments", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        startingLocation: { label: "Imphal", coordinates: null },
        destinations: [destination("Loktak", { distanceFromImphal: 48, coordinates: null })],
      })
    );
    const segments = itinerary.days[0].travelSegments;
    expect(segments[0].distanceType).toBe("imphal-estimate");
    expect(segments[0].distanceKm).toBe(48);
    expect(segments[0].travelTimeUnknown).toBe(true);
  });

  it("sums known costs per day and for the whole trip", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        budget: 500,
        destinations: [
          destination("A", { estimatedCost: 100 }),
          destination("B", { estimatedCost: 200 }),
        ],
      })
    );
    expect(itinerary.days[0].cost.knownSubtotal).toBe(300);
    expect(itinerary.days[0].cost.unknownCount).toBe(0);
    expect(itinerary.cost.knownSubtotal).toBe(300);
    expect(itinerary.cost.estimatedTotal).toBe(300);
    expect(itinerary.cost.budgetStatus).toBe("within-budget");
  });

  it("reports unknown costs without fabricating a total", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        budget: 500,
        destinations: [
          destination("A", { estimatedCost: 100 }),
          destination("B", { estimatedCost: null }),
        ],
      })
    );
    expect(itinerary.cost.knownSubtotal).toBe(100);
    expect(itinerary.cost.unknownCount).toBe(1);
    expect(itinerary.cost.estimatedTotal).toBeNull();
    expect(itinerary.cost.budgetStatus).toBe("unknown-costs");
    expect(itinerary.warnings.some((w) => w.code === "unknown-cost")).toBe(true);
  });

  it("only compares the budget when it is meaningful", () => {
    const allKnown = baseInput({
      durationDays: 1,
      budget: 200,
      destinations: [destination("A", { estimatedCost: 300 })],
    });
    expect(buildItinerary(allKnown).cost.budgetStatus).toBe("exceeds-budget");

    const noBudget = baseInput({
      durationDays: 1,
      budget: null,
      destinations: [destination("A", { estimatedCost: 300 })],
    });
    expect(buildItinerary(noBudget).cost.budgetStatus).toBe("no-budget");
  });

  it("warns instead of dropping stops when the itinerary overflows", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        destinations: [
          destination("A", { estimatedVisitDuration: "6 hours" }),
          destination("B", { estimatedVisitDuration: "6 hours" }),
        ],
      })
    );
    expect(itinerary.totalStops).toBe(2);
    expect(itinerary.usedDays).toBe(2);
    expect(itinerary.warnings.some((w) => w.code === "exceeds-duration")).toBe(true);
  });

  it("flags a stop that alone exceeds the daily time limit", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 1,
        dailyAvailableHours: 4,
        destinations: [destination("Long Trek", { estimatedVisitDuration: "1 day" })],
      })
    );
    expect(itinerary.days[0].overCapacity).toBe(true);
    expect(itinerary.warnings.some((w) => w.code === "exceeds-daily-time")).toBe(true);
  });

  it("returns an empty itinerary for an empty destination list", () => {
    const itinerary = buildItinerary(baseInput({ destinations: [] }));
    expect(itinerary.days).toHaveLength(0);
    expect(itinerary.usedDays).toBe(0);
    expect(itinerary.totalStops).toBe(0);
    expect(itinerary.cost.knownSubtotal).toBe(0);
    expect(itinerary.cost.estimatedTotal).toBe(0);
    expect(itinerary.warnings).toHaveLength(0);
  });

  it("warns on an invalid duration and clamps to 1 day", () => {
    const itinerary = buildItinerary(
      baseInput({
        durationDays: 0,
        destinations: [destination("A", { estimatedVisitDuration: "1 hour" })],
      })
    );
    expect(itinerary.requestedDays).toBe(1);
    expect(itinerary.warnings.some((w) => w.code === "invalid-duration")).toBe(true);
  });

  it("produces deterministic output for identical input", () => {
    const input = baseInput({
      durationDays: 3,
      budget: 8000,
      startingLocation: {
        label: "Imphal",
        coordinates: { latitude: 24.817, longitude: 93.9368 },
      },
      destinations: [
        destination("A", {
          coordinates: { latitude: 24.9, longitude: 94.0 },
          estimatedCost: 100,
          estimatedVisitDuration: "2 hours",
          tags: ["nature"],
        }),
        destination("B", {
          coordinates: { latitude: 24.5, longitude: 93.8 },
          estimatedCost: 200,
          estimatedVisitDuration: "4 hours",
          tags: ["lake"],
        }),
        destination("C", { coordinates: null, estimatedCost: null }),
      ],
    });

    const first = buildItinerary(input);
    const second = buildItinerary(input);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first).toEqual(second);
  });
});