import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OPEN_METEO_ENDPOINT,
  buildForecastUrl,
  fetchDailyForecast,
  mapDailyPayload,
} from "@/backend/weather/openmeteo";
import { WeatherError } from "@/backend/weather";
import type { WeatherPointInput } from "@/backend/weather";

const point: WeatherPointInput = {
  id: "d1",
  name: "Loktak Lake",
  coordinates: { latitude: 24.55, longitude: 93.78 },
  source: "database",
};

describe("buildForecastUrl", () => {
  it("builds a forecast_days URL when no start date is set", () => {
    const url = buildForecastUrl(point, { startDate: null, days: 3 });
    expect(url.startsWith(`${OPEN_METEO_ENDPOINT}?`)).toBe(true);
    expect(url).toContain("latitude=24.55");
    expect(url).toContain("longitude=93.78");
    expect(url).toContain("timezone=Asia");
    expect(url).toContain("forecast_days=3");
    expect(url).toContain("weather_code");
    expect(url).not.toContain("start_date");
  });

  it("builds a start_date/end_date URL when a start date is set", () => {
    const url = buildForecastUrl(point, {
      startDate: "2026-09-24",
      days: 2,
    });
    expect(url).toContain("start_date=2026-09-24");
    expect(url).toContain("end_date=2026-09-25");
    expect(url).not.toContain("forecast_days");
  });
});

describe("mapDailyPayload", () => {
  it("maps Open-Meteo daily arrays into DailyForecast entries", () => {
    const payload = {
      time: ["2026-09-24", "2026-09-25"],
      weather_code: [65, 2],
      temperature_2m_max: [23.5, 25],
      temperature_2m_min: [17, 18.25],
      precipitation_probability_max: [80, 10],
      precipitation_sum: [12.5, 0],
      wind_speed_10m_max: [8, 5],
    };
    const forecast = mapDailyPayload(payload, "Loktak Lake");
    expect(forecast).toHaveLength(2);
    expect(forecast[0].date).toBe("2026-09-24");
    expect(forecast[0].condition.category).toBe("adverse");
    expect(forecast[0].temperatureMax).toBe(23.5);
    expect(forecast[0].precipitationSum).toBe(12.5);
    expect(forecast[1].condition.label).toBe("Partly cloudy");
    expect(forecast[1].temperatureMin).toBe(18.3);
  });

  it("preserves null values and rounds decimals", () => {
    const payload = {
      time: ["2026-09-24"],
      weather_code: [0],
      temperature_2m_max: [null],
      temperature_2m_min: [22.345],
      precipitation_probability_max: [null],
      precipitation_sum: [0.04],
      wind_speed_10m_max: [null],
    };
    const forecast = mapDailyPayload(payload, "X");
    expect(forecast[0].temperatureMax).toBeNull();
    expect(forecast[0].temperatureMin).toBe(22.3);
    expect(forecast[0].precipitationProbabilityMax).toBeNull();
    expect(forecast[0].precipitationSum).toBe(0);
    expect(forecast[0].windSpeedMax).toBeNull();
  });

  it("throws weather-no-data when the payload has no rows", () => {
    expect(() => mapDailyPayload(undefined, "X")).toThrowError(
      new WeatherError("Open-Meteo returned no daily forecast rows for X.", "weather-no-data")
    );
  });

  it("throws weather-no-data when no rows carry a weather code", () => {
    expect(() =>
      mapDailyPayload(
        { time: ["2026-09-24"], weather_code: [null] } as unknown as Parameters<
          typeof mapDailyPayload
        >[0],
        "X"
      )
    ).toThrowError(WeatherError);
  });
});

describe("fetchDailyForecast", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns mapped forecasts on a successful response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          daily: {
            time: ["2026-09-24"],
            weather_code: [95],
            temperature_2m_max: [21],
            temperature_2m_min: [15],
            precipitation_probability_max: [90],
            precipitation_sum: [8],
            wind_speed_10m_max: [12],
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const forecast = await fetchDailyForecast(point, { startDate: null, days: 1 });
    expect(forecast[0].condition.label).toBe("Thunderstorm");
    expect(forecast[0].condition.category).toBe("adverse");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("latitude=24.55");
    expect(init.signal).toBeDefined();
  });

  it("throws weather-upstream for a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(
      fetchDailyForecast(point, { startDate: null, days: 1 })
    ).rejects.toMatchObject({ name: "WeatherError", code: "weather-upstream" });
  });

  it("throws weather-upstream for an invalid JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error("not json")),
      })
    );
    await expect(
      fetchDailyForecast(point, { startDate: null, days: 1 })
    ).rejects.toMatchObject({ code: "weather-upstream" });
  });

  it("throws weather-no-data when the body has no daily rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ daily: undefined }),
      })
    );
    await expect(
      fetchDailyForecast(point, { startDate: null, days: 1 })
    ).rejects.toMatchObject({ code: "weather-no-data" });
  });

  it("throws weather-fetch when the network request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("ECONNRESET"))
    );
    await expect(
      fetchDailyForecast(point, { startDate: null, days: 1 })
    ).rejects.toMatchObject({ code: "weather-fetch" });
  });
});