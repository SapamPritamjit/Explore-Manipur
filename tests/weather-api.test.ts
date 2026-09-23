import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/weather", async (importActual) => {
  const actual = await importActual<typeof import("@/backend/weather")>();
  return { ...actual, getWeatherForecast: vi.fn() };
});

import { POST } from "@/app/api/weather/route";
import { getWeatherForecast } from "@/backend/weather";
import type { WeatherResponse } from "@/backend/weather";

const mockedGetWeatherForecast = vi.mocked(getWeatherForecast);

const okResponse: WeatherResponse = {
  provider: "open-meteo",
  timezone: "Asia/Kolkata",
  startDate: null,
  days: 3,
  generatedAt: "2026-09-22T00:00:00.000Z",
  request: { destinationIds: [], coordinates: { latitude: 24.8, longitude: 93.94 } },
  points: [],
  warnings: [],
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/weather", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  mockedGetWeatherForecast.mockReset();
});

describe("POST /api/weather", () => {
  it("returns 200 with the weather response", async () => {
    mockedGetWeatherForecast.mockResolvedValue({ ok: true, response: okResponse });

    const response = await post({
      destinationIds: ["d1"],
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(okResponse);
  });

  it("returns 400 with validation issues", async () => {
    mockedGetWeatherForecast.mockResolvedValue({
      ok: false,
      kind: "validation",
      issues: [
        {
          field: "destinationIds",
          message: "At least one of destinationIds or coordinates must be provided.",
        },
      ],
    });

    const response = await post({});
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("validation-error");
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await post("{not json");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("invalid-json");
    expect(mockedGetWeatherForecast).not.toHaveBeenCalled();
  });

  it("returns 500 for a data-layer error", async () => {
    mockedGetWeatherForecast.mockResolvedValue({
      ok: false,
      kind: "data",
      error: { code: "data-error", message: "listDestinations: connection failed" },
    });

    const response = await post({ destinationIds: ["d1"] });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("data-error");
  });
});