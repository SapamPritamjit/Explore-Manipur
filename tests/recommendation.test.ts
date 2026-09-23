import { describe, expect, it } from "vitest";
import {
  recommend,
  scoreInterest,
  scoreBudget,
  scoreGeography,
  scoreTimeFit,
  parseVisitHours,
  haversineKm,
  validateWeights,
} from "@/backend/recommendation";
import type {
  RecommendationInput,
  TourismCandidate,
} from "@/backend/recommendation";

function candidate(partial: Partial<TourismCandidate> & { name: string }): TourismCandidate {
  return {
    id: partial.name,
    category: "General",
    tags: [],
    ...partial,
  };
}

const defaultInput: RecommendationInput = {
  durationDays: 3,
  budget: 10000,
  interests: ["nature"],
};

describe("weights", () => {
  it("weights sum to 1.0", () => {
    expect(validateWeights()).toBe(true);
  });
});

describe("interest matching", () => {
  it("scores a strong interest match at 100 and reports matched terms", () => {
    const result = scoreInterest(["nature", "boating"], "Nature", ["nature", "lake", "boating"]);
    expect(result.score).toBeCloseTo(100);
    expect(result.matchedInterests).toEqual(["nature", "boating"]);
    expect(result.matchedTags).toEqual(["nature", "boating"]);
  });

  it("scores a no-interest match at 0 with no matched terms", () => {
    const result = scoreInterest(["golf"], "Nature", ["lake", "boating"]);
    expect(result.score).toBe(0);
    expect(result.matchedInterests).toEqual([]);
    expect(result.matchedTags).toEqual([]);
  });

  it("matches phrase interests against category and tags", () => {
    const result = scoreInterest(["national park"], "Nature", ["floating national park"]);
    expect(result.score).toBe(100);
    expect(result.matchedInterests).toEqual(["national park"]);
  });
});

describe("budget fit", () => {
  it("scores a known affordable cost at 100", () => {
    const result = scoreBudget(5000, 1000);
    expect(result.score).toBe(100);
    expect(result.budgetStatus).toBe("affordable");
    expect(result.costKnown).toBe(true);
  });

  it("scores an over-budget cost below 100", () => {
    const result = scoreBudget(1000, 3000);
    expect(result.score).toBe(0);
    expect(result.budgetStatus).toBe("over-budget");
  });

  it("handles unknown cost neutrally without claiming fit", () => {
    const result = scoreBudget(5000, null);
    expect(result.score).toBe(50);
    expect(result.budgetStatus).toBe("unknown-cost");
    expect(result.costKnown).toBe(false);
  });

  it("handles no budget neutrally", () => {
    const result = scoreBudget(null, 1000);
    expect(result.score).toBe(50);
    expect(result.budgetStatus).toBe("no-budget-specified");
  });
});

describe("geographic fit", () => {
  it("uses Haversine distance when both coordinate sets exist", () => {
    const result = scoreGeography(
      { label: "Home", coordinates: { latitude: 0, longitude: 0 } },
      { coordinates: { latitude: 0, longitude: 1 }, distanceFromImphal: null }
    );
    expect(result.distanceKind).toBe("haversine");
    expect(result.distanceKm).toBeCloseTo(111.2, 1);
    const expectedScore = 100 - (111.19 / 300) * 100;
    expect(result.score).toBeCloseTo(expectedScore, 1);
  });

  it("reports zero distance for identical coordinates", () => {
    const coords = { latitude: 24.817, longitude: 93.9368 };
    expect(haversineKm(coords, coords)).toBe(0);
  });

  it("falls back to distance-from-Imphal when starting at Imphal", () => {
    const result = scoreGeography(
      { label: "Imphal", coordinates: null },
      { coordinates: null, distanceFromImphal: 48 }
    );
    expect(result.distanceKind).toBe("imphal-estimate");
    expect(result.distanceKm).toBe(48);
    expect(result.score).toBeCloseTo(100 - (48 / 300) * 100, 1);
  });

  it("scores missing coordinates neutrally with no distance", () => {
    const result = scoreGeography(
      { label: "Guwahati", coordinates: null },
      { coordinates: null, distanceFromImphal: null }
    );
    expect(result.score).toBe(50);
    expect(result.distanceKind).toBe("unknown");
    expect(result.distanceKm).toBeNull();
  });
});

describe("time fit", () => {
  it("scores a known short visit well within a 3-day trip", () => {
    const result = scoreTimeFit(3, "4 hours");
    expect(result.timeKnown).toBe(true);
    expect(result.visitHours).toBe(4);
    expect(result.availableHours).toBe(24);
    expect(result.score).toBe(100);
  });

  it("scores an over-capacity visit below 100", () => {
    const result = scoreTimeFit(1, "2 days");
    expect(result.timeKnown).toBe(true);
    expect(result.visitHours).toBe(16);
    expect(result.score).toBe(50);
  });

  it("scores missing duration neutrally", () => {
    const result = scoreTimeFit(3, null);
    expect(result.timeKnown).toBe(false);
    expect(result.visitHours).toBeNull();
    expect(result.score).toBe(50);
  });
});

describe("parseVisitHours", () => {
  it.each([
    ["2 hours", 2],
    ["3-4 hours", 4],
    ["30 minutes", 0.5],
    ["1 day", 8],
    ["half day", 4],
    ["half a day", 4],
    ["", null],
    ["n/a", null],
  ] as const)("parses %s", (raw, expected) => {
    expect(parseVisitHours(raw)).toBe(expected);
  });
});

describe("recommend()", () => {
  it("returns an empty list for an empty candidate list", () => {
    expect(recommend(defaultInput, [])).toEqual([]);
  });

  it("computes the weighted overall and keeps all components neutral at 50 when no signals exist", () => {
    const result = recommend(
      { durationDays: 3, startingLocation: { label: "Guwahati", coordinates: null } },
      [candidate({ name: "Loktak Lake", category: "Nature", tags: ["lake"] })]
    )[0];
    expect(result.breakdown.interest).toBe(50);
    expect(result.breakdown.budget).toBe(50);
    expect(result.breakdown.geographic).toBe(50);
    expect(result.breakdown.time).toBe(50);
    expect(result.score).toBe(50);
  });

  it("weights a strong interest match at 40% over neutral other components", () => {
    const input: RecommendationInput = {
      durationDays: 3,
      interests: ["nature"],
      startingLocation: { label: "Guwahati", coordinates: null },
    };
    const result = recommend(input, [
      candidate({ name: "Loktak Lake", category: "Nature", tags: ["lake"] }),
    ])[0];
    expect(result.breakdown.interest).toBe(100);
    expect(result.score).toBeCloseTo(100 * 0.4 + 50 * 0.2 + 50 * 0.2 + 50 * 0.2, 5);
    expect(result.score).toBeCloseTo(70, 5);
  });

  it("provides a transparent explanation for every recommendation", () => {
    const input: RecommendationInput = {
      durationDays: 3,
      budget: 10000,
      interests: ["nature", "lake"],
      startingLocation: { label: "Imphal", coordinates: null },
    };
    const destination = candidate({
      name: "Loktak Lake",
      category: "Nature",
      tags: ["nature", "lake", "boating"],
      coordinates: null,
      distanceFromImphal: 48,
      estimatedCost: 400,
      estimatedVisitDuration: "3-4 hours",
    });
    const result = recommend(input, [destination])[0];

    expect(result.explanation.length).toBeGreaterThan(0);
    expect(result.explanation.join("\n")).toContain("matched 2 of 2");
    expect(result.explanation.join("\n")).toContain("within your budget");
    expect(result.explanation.join("\n")).toContain("Imphal (estimated)");
    expect(result.explanation.join("\n")).toContain("Overall score");
  });

  it("does not claim an unknown-cost destination is within budget", () => {
    const input: RecommendationInput = {
      durationDays: 3,
      budget: 5000,
      interests: ["history"],
    };
    const result = recommend(input, [
      candidate({ name: "Kangla Fort", category: "Heritage", tags: ["history"], estimatedCost: null }),
    ])[0];
    expect(result.breakdown.budgetStatus).toBe("unknown-cost");
    expect(result.explanation.join("\n")).toContain("affordability was not assessed");
  });

  it("sorts by score descending with a deterministic name tiebreak", () => {
    const input: RecommendationInput = {
      durationDays: 3,
      interests: ["nature"],
      budget: 10000,
      startingLocation: { label: "Guwahati", coordinates: null },
    };
    const candidates = [
      candidate({
        name: "Tharon Cave",
        category: "Heritage",
        tags: ["caves"],
        estimatedCost: null,
        estimatedVisitDuration: null,
        coordinates: null,
      }),
      candidate({
        name: "Loktak Lake",
        category: "Nature",
        tags: ["nature", "lake"],
        estimatedCost: 500,
        estimatedVisitDuration: "4 hours",
        coordinates: { latitude: 24.55, longitude: 93.78 },
      }),
      candidate({
        name: "Dzuko Valley",
        category: "Nature",
        tags: ["nature", "valley"],
        estimatedCost: 300,
        estimatedVisitDuration: "4 days",
        coordinates: { latitude: 25.4, longitude: 94.0 },
      }),
    ];

    const first = recommend(input, candidates);
    const second = recommend(input, candidates);

    expect(first).toEqual(second);
    expect(first.map((r) => r.candidate.name)).toEqual([
      "Loktak Lake",
      "Dzuko Valley",
      "Tharon Cave",
    ]);
    for (let i = 1; i < first.length; i++) {
      expect(first[i - 1].score).toBeGreaterThanOrEqual(first[i].score);
    }
  });

  it("breaks equal scores deterministically by name", () => {
    const input: RecommendationInput = {
      durationDays: 3,
      budget: 10000,
      interests: [],
      startingLocation: { label: "Guwahati", coordinates: null },
    };
    const results = recommend(input, [
      candidate({ name: "Zeta Lake", category: "General", tags: [] }),
      candidate({ name: "Alpha Hill", category: "General", tags: [] }),
    ]);
    expect(results.map((r) => r.candidate.name)).toEqual(["Alpha Hill", "Zeta Lake"]);
    expect(results[0].score).toBe(results[1].score);
  });

  it("excludes candidates that do not match preferred districts and categories", () => {
    const input: RecommendationInput = {
      durationDays: 3,
      preferredDistricts: ["Bishnupur"],
      preferredCategories: ["Nature"],
    };
    const results = recommend(input, [
      candidate({ name: "Loktak Lake", district: "Bishnupur", category: "Nature", tags: [] }),
      candidate({ name: "Kangla Fort", district: "Imphal West", category: "Heritage", tags: [] }),
      candidate({ name: "Dzuko Valley", district: "Senapati", category: "Nature", tags: [] }),
    ]);
    expect(results.map((r) => r.candidate.name)).toEqual(["Loktak Lake"]);
  });
});