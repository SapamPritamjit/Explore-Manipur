import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/nearby", async (importActual) => {
  const actual = await importActual<typeof import("@/backend/nearby")>();
  return { ...actual, findNearby: vi.fn() };
});

import { POST } from "@/app/api/nearby/route";
import { findNearby } from "@/backend/nearby";
import type { NearbyResponse } from "@/backend/nearby";

const mockedFindNearby = vi.mocked(findNearby);

const okResponse: NearbyResponse = {
  request: {
    center: { latitude: 24.817, longitude: 93.9368 },
    radiusKm: 50,
    kinds: ["destinations"],
    limitPerKind: 10,
  },
  groups: [],
  totalMatches: 0,
  warnings: [],
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/nearby", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  mockedFindNearby.mockReset();
});

describe("POST /api/nearby", () => {
  it("returns 200 with the nearby response", async () => {
    mockedFindNearby.mockResolvedValue({ ok: true, response: okResponse });

    const response = await post({ latitude: 24.817, longitude: 93.9368 });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(okResponse);
  });

  it("returns 400 with validation issues", async () => {
    mockedFindNearby.mockResolvedValue({
      ok: false,
      kind: "validation",
      issues: [{ field: "latitude", message: "latitude is required." }],
    });

    const response = await post({ longitude: 93.9368 });
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
    expect(mockedFindNearby).not.toHaveBeenCalled();
  });

  it("returns 500 for a data-layer error", async () => {
    mockedFindNearby.mockResolvedValue({
      ok: false,
      kind: "data",
      error: { code: "data-error", message: "listFood: connection failed" },
    });

    const response = await post({ latitude: 24.817, longitude: 93.9368 });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("data-error");
  });
});