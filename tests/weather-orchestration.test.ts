import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/data", () => ({
  listDestinations: vi.fn(),
}));

vi.mock("@/backend/weather/openmeteo", () => ({
  fetchDailyForecast: vi.fn(),
  DEFAULT_TIMEZONE: "Asia/Kolkata",
}));

import { getWeatherForecast } from "@/backend/weather";
import { listDestinations } from "@/backend/data";
import { fetchDailyForecast } from "@/backend/weather/openmeteo";
import type { DailyForecast } from "@/backend/weather";

const mockedListDestinations = vi.mocked(listDestinations);
const mockedFetchDailyForecast = vi.mocked(fetchDailyForecast);

const lakeWithCoordinates = {
  id: "d1",
  name: "Loktak Lake",
  latitude: 24.55,
  longitude: 93.78,
};

const noCoordinates = {
  id: "d2",
  name: "Kangla Fort",
  latitude: null,
  longitude: null,
};

const forecast: DailyForecast[] = [
  {
    date: "2026-09-24",
    condition: { code: 2, label: "Partly cloudy", category: "good", outdoorSuitable: true },
    temperatureMax: 25,
    temperatureMin: 17,
    precipitationProbabilityMax: 10,
    precipitationSum: 0,
    windSpeedMax: 5,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockedListDestinations.mockResolvedValue(
    [lakeWithCoordinates, noCoordinates] as never
  );
  mockedFetchDailyForecast.mockResolvedValue(forecast);
});

describe("getWeatherForecast", () => {
  it("returns forecasts for database destinations that have coordinates", async () => {
    const result = await getWeatherForecast({ destinationIds: ["d1"] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.points).toHaveLength(1);
    expect(result.response.points[0]).toMatchObject({
      id: "d1",
      name: "Loktak Lake",
      status: "ok",
      source: "database",
      error: null,
    });
    expect(result.response.points[0].forecast).toEqual(forecast);
    expect(mockedFetchDailyForecast).toHaveBeenCalledTimes(1);
    expect(result.response.warnings).toEqual([]);
  });

  it("handles destinations without coordinates explicitly by not fetching", async () => {
    const result = await getWeatherForecast({ destinationIds: ["d2"] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(mockedFetchDailyForecast).not.toHaveBeenCalled();
    expect(result.response.points[0]).toMatchObject({
      id: "d2",
      name: "Kangla Fort",
      status: "coordinate-missing",
      coordinates: null,
      forecast: [],
    });
    expect(result.response.warnings).toEqual([
      expect.objectContaining({ code: "missing-coordinates" }),
    ]);
  });

  it("adds a request-coordinate point alongside database points", async () => {
    const result = await getWeatherForecast({
      destinationIds: ["d1"],
      coordinates: { latitude: 24.8, longitude: 93.94 },
      label: "Imphal",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.points.map((point) => point.name)).toEqual([
      "Imphal",
      "Loktak Lake",
    ]);
    expect(mockedFetchDailyForecast).toHaveBeenCalledTimes(2);
  });

  it("accepts a coordinates-only request without touching the database", async () => {
    const result = await getWeatherForecast({
      coordinates: { latitude: 24.8, longitude: 93.94 },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.points).toHaveLength(1);
    expect(result.response.points[0]).toMatchObject({
      name: "Provided location",
      source: "request",
      status: "ok",
    });
    expect(mockedListDestinations).toHaveBeenCalledTimes(1);
  });

  it("marks a point as upstream-error and keeps other points successful", async () => {
    mockedFetchDailyForecast.mockImplementation(async (pointInput) => {
      if (pointInput.id === "d1") {
        const error = new Error("Open-Meteo returned HTTP 429 for Loktak Lake.");
        Object.assign(error, { code: "weather-upstream" });
        throw error;
      }
      return forecast;
    });

    const result = await getWeatherForecast({
      destinationIds: ["d1", "d2"],
      coordinates: { latitude: 24.8, longitude: 93.94 },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const byName = new Map(
      result.response.points.map((point) => [point.name, point])
    );
    expect(byName.get("Loktak Lake")?.status).toBe("upstream-error");
    expect(byName.get("Loktak Lake")?.error).toContain("HTTP 429");
    expect(byName.get("Provided location")?.status).toBe("ok");
    expect(byName.get("Kangla Fort")?.status).toBe("coordinate-missing");
    expect(
      result.response.warnings.map((warning) => warning.code)
    ).toEqual(
      expect.arrayContaining(["upstream-error", "missing-coordinates"])
    );
  });

  it("marks a point as no-data when the provider returns no rows", async () => {
    mockedFetchDailyForecast.mockRejectedValue(
      Object.assign(
        new Error("Open-Meteo returned no daily forecast rows for Loktak Lake."),
        { code: "weather-no-data" }
      )
    );

    const result = await getWeatherForecast({
      destinationIds: ["d1"],
      startDate: "2026-09-24",
      days: 2,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.response.points[0].status).toBe("no-data");
    expect(result.response.warnings[0].code).toBe("no-data");
  });

  it("returns validation issues for an invalid request", async () => {
    const result = await getWeatherForecast({});
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe("validation");
    expect(
      (result as { kind: "validation"; issues: unknown[] }).issues.length
    ).toBeGreaterThan(0);
    expect(mockedListDestinations).not.toHaveBeenCalled();
  });

  it("returns a data error when the destination lookup fails", async () => {
    mockedListDestinations.mockRejectedValue(
      new Error("listDestinations: connection failed")
    );

    const result = await getWeatherForecast({
      destinationIds: ["d1"],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.kind).toBe("data");
    expect((result as { error: { code: string } }).error.code).toBe("data-error");
  });
});