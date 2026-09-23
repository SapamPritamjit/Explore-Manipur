import { describe, expect, it } from "vitest";
import {
  addDays,
  classifyWeatherCode,
  isValidDateString,
  validateWeatherRequest,
} from "@/backend/weather";

describe("classifyWeatherCode", () => {
  it("maps WMO codes to conditions and categories", () => {
    expect(classifyWeatherCode(0)).toMatchObject({
      code: 0,
      label: "Clear sky",
      category: "good",
      outdoorSuitable: true,
    });
    expect(classifyWeatherCode(2)).toMatchObject({ category: "good" });
    expect(classifyWeatherCode(3)).toMatchObject({ category: "mixed" });
    expect(classifyWeatherCode(45)).toMatchObject({ category: "mixed" });
    expect(classifyWeatherCode(65)).toMatchObject({
      label: "Heavy rain",
      category: "adverse",
      outdoorSuitable: false,
    });
    expect(classifyWeatherCode(95)).toMatchObject({
      label: "Thunderstorm",
      category: "adverse",
      outdoorSuitable: false,
    });
    expect(classifyWeatherCode(75)).toMatchObject({ category: "adverse" });
  });

  it("handles unknown codes conservatively without category jumps", () => {
    const condition = classifyWeatherCode(9999);
    expect(condition.label).toBe("Unknown condition");
    expect(condition.category).toBe("mixed");
    expect(condition.outdoorSuitable).toBe(true);
  });
});

describe("date helpers", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-09-22", 0)).toBe("2026-09-22");
    expect(addDays("2026-09-30", 2)).toBe("2026-10-02");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("validates YYYY-MM-DD date strings", () => {
    expect(isValidDateString("2026-09-22")).toBe(true);
    expect(isValidDateString("2026-12-31")).toBe(true);
    expect(isValidDateString("2026-02-29")).toBe(false);
    expect(isValidDateString("2026-13-01")).toBe(false);
    expect(isValidDateString("2026-00-01")).toBe(false);
    expect(isValidDateString("26-09-22")).toBe(false);
    expect(isValidDateString("not-a-date")).toBe(false);
  });
});

describe("validateWeatherRequest", () => {
  it("accepts a coordinates-only request with defaults", () => {
    const outcome = validateWeatherRequest({
      coordinates: { latitude: 24.8, longitude: 93.94 },
    });
    expect(outcome.kind).toBe("valid");
    if (outcome.kind === "valid") {
      expect(outcome.request.coordinates).toEqual({
        latitude: 24.8,
        longitude: 93.94,
      });
      expect(outcome.request.days).toBe(3);
      expect(outcome.request.startDate).toBeNull();
      expect(outcome.request.destinationIds).toEqual([]);
    }
  });

  it("accepts a destinationIds-only request", () => {
    const outcome = validateWeatherRequest({
      destinationIds: ["d1"],
      startDate: "2026-09-24",
      days: 2,
    });
    expect(outcome.kind).toBe("valid");
    if (outcome.kind === "valid") {
      expect(outcome.request.destinationIds).toEqual(["d1"]);
      expect(outcome.request.startDate).toBe("2026-09-24");
      expect(outcome.request.days).toBe(2);
      expect(outcome.request.coordinates).toBeNull();
    }
  });

  it("rejects a request with neither coordinates nor destinationIds", () => {
    const outcome = validateWeatherRequest({});
    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") {
      expect(
        outcome.issues.some((issue) => issue.field === "destinationIds")
      ).toBe(true);
    }
  });

  it("rejects invalid coordinates", () => {
    const outcome = validateWeatherRequest({
      coordinates: { latitude: 91, longitude: 93 },
      destinationIds: ["d1"],
    });
    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") {
      expect(outcome.issues.map((issue) => issue.field)).toContain(
        "coordinates.latitude"
      );
      expect(outcome.issues).not.toContainEqual(
        expect.objectContaining({ field: "coordinates.longitude" })
      );
    }
  });

  it("rejects malformed coordinates object", () => {
    const outcome = validateWeatherRequest({
      coordinates: { latitude: "24.8" },
      destinationIds: ["d1"],
    });
    expect(outcome.kind).toBe("invalid");
  });

  it("rejects invalid startDate and days", () => {
    const outcome = validateWeatherRequest({
      destinationIds: ["d1"],
      startDate: "2026-13-01",
      days: 10,
    });
    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") {
      expect(outcome.issues.map((issue) => issue.field)).toEqual([
        "startDate",
        "days",
      ]);
    }
  });

  it("rejects non-array destinationIds", () => {
    const outcome = validateWeatherRequest({
      destinationIds: "d1",
      coordinates: { latitude: 24.8, longitude: 93.94 },
    });
    expect(outcome.kind).toBe("invalid");
    if (outcome.kind === "invalid") {
      expect(outcome.issues[0].field).toBe("destinationIds");
    }
  });

  it("trims destination ids and ignores empty entries", () => {
    const outcome = validateWeatherRequest({
      destinationIds: [" d1 ", "  ", "d2"],
      coordinates: { latitude: 24.8, longitude: 93.94 },
    });
    expect(outcome.kind).toBe("valid");
    if (outcome.kind === "valid") {
      expect(outcome.request.destinationIds).toEqual(["d1", "d2"]);
    }
  });
});