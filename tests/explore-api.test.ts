import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/data", () => ({
  listDestinations: vi.fn().mockResolvedValue([]),
  getDestination: vi.fn().mockResolvedValue(null),
  listFood: vi.fn().mockResolvedValue([]),
  getFood: vi.fn().mockResolvedValue(null),
  listExperiences: vi.fn().mockResolvedValue([]),
  getExperience: vi.fn().mockResolvedValue(null),
  listAccommodation: vi.fn().mockResolvedValue([]),
  getAccommodation: vi.fn().mockResolvedValue(null),
  listEvents: vi.fn().mockResolvedValue([]),
  getEvent: vi.fn().mockResolvedValue(null),
  listTransport: vi.fn().mockResolvedValue([]),
  DataAccessError: class DataAccessError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.name = "DataAccessError";
      this.code = code;
    }
  },
}));

import { GET } from "@/app/api/explore/route";
import {
  listDestinations,
  getDestination,
  listFood,
  getFood,
  listExperiences,
  getExperience,
  listAccommodation,
  getAccommodation,
  listEvents,
  getEvent,
  listTransport,
  DataAccessError,
} from "@/backend/data";

const mockedListDestinations = vi.mocked(listDestinations);
const mockedGetDestination = vi.mocked(getDestination);
const mockedListFood = vi.mocked(listFood);
const mockedGetFood = vi.mocked(getFood);
const mockedListExperiences = vi.mocked(listExperiences);
const mockedGetExperience = vi.mocked(getExperience);
const mockedListAccommodation = vi.mocked(listAccommodation);
const mockedGetAccommodation = vi.mocked(getAccommodation);
const mockedListEvents = vi.mocked(listEvents);
const mockedGetEvent = vi.mocked(getEvent);
const mockedListTransport = vi.mocked(listTransport);

function get(path: string) {
  return GET(new Request(`http://localhost/api/explore${path}`));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/explore validation", () => {
  it("returns 400 when type is missing", async () => {
    const response = await get("");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("invalid-type");
  });

  it("returns 400 when type is invalid", async () => {
    const response = await get("?type=invalid");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("invalid-type");
  });
});

describe("GET /api/explore list operations", () => {
  it("lists destinations with filters", async () => {
    const destinations = [{ id: "d1", name: "Loktak Lake" }];
    mockedListDestinations.mockResolvedValue(destinations as never);

    const response = await get("?type=destinations&district=Bishnupur&category=Nature&interests=lake,nature");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(destinations);
    expect(mockedListDestinations).toHaveBeenCalledWith({
      district: "Bishnupur",
      category: "Nature",
      interests: ["lake", "nature"],
    });
  });

  it("lists food", async () => {
    const food = [{ id: "f1", name: "Eromba" }];
    mockedListFood.mockResolvedValue(food as never);

    const response = await get("?type=food");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(food);
    expect(mockedListFood).toHaveBeenCalled();
  });

  it("lists experiences", async () => {
    const experiences = [{ id: "e1", name: "Shirui Trek" }];
    mockedListExperiences.mockResolvedValue(experiences as never);

    const response = await get("?type=experiences");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(experiences);
  });

  it("lists accommodation", async () => {
    const accommodation = [{ id: "a1", name: "Classic Grande" }];
    mockedListAccommodation.mockResolvedValue(accommodation as never);

    const response = await get("?type=accommodation");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(accommodation);
  });

  it("lists events", async () => {
    const events = [{ id: "ev1", name: "Shirui Lily Festival" }];
    mockedListEvents.mockResolvedValue(events as never);

    const response = await get("?type=events");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(events);
  });

  it("lists transport", async () => {
    const transport = [{ id: "t1", origin: "Imphal" }];
    mockedListTransport.mockResolvedValue(transport as never);

    const response = await get("?type=transport");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(transport);
  });

  it("passes undefined for optional filters when not provided", async () => {
    mockedListDestinations.mockResolvedValue([] as never);

    await get("?type=destinations");
    expect(mockedListDestinations).toHaveBeenCalledWith({
      district: undefined,
      category: undefined,
      interests: undefined,
    });
  });
});

describe("GET /api/explore single-get operations", () => {
  it("gets a destination by id", async () => {
    const dest = { id: "d1", name: "Loktak Lake" };
    mockedGetDestination.mockResolvedValue(dest as never);

    const response = await get("?type=destinations&id=d1");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(dest);
    expect(mockedGetDestination).toHaveBeenCalledWith("d1");
  });

  it("returns 404 when destination not found", async () => {
    mockedGetDestination.mockResolvedValue(null);

    const response = await get("?type=destinations&id=missing");
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("not-found");
  });

  it("gets food by id", async () => {
    const food = { id: "f1", name: "Eromba" };
    mockedGetFood.mockResolvedValue(food as never);

    const response = await get("?type=food&id=f1");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(food);
  });

  it("returns 404 when food not found", async () => {
    mockedGetFood.mockResolvedValue(null);

    const response = await get("?type=food&id=missing");
    expect(response.status).toBe(404);
  });

  it("gets experience by id", async () => {
    const exp = { id: "e1", name: "Trek" };
    mockedGetExperience.mockResolvedValue(exp as never);

    const response = await get("?type=experiences&id=e1");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(exp);
  });

  it("gets accommodation by id", async () => {
    const acc = { id: "a1", name: "Hotel" };
    mockedGetAccommodation.mockResolvedValue(acc as never);

    const response = await get("?type=accommodation&id=a1");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(acc);
  });

  it("gets event by id", async () => {
    const ev = { id: "ev1", name: "Festival" };
    mockedGetEvent.mockResolvedValue(ev as never);

    const response = await get("?type=events&id=ev1");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(ev);
  });

  it("returns 400 for transport with id", async () => {
    const response = await get("?type=transport&id=t1");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("unsupported");
  });
});

describe("GET /api/explore error handling", () => {
  it("returns 500 for DataAccessError", async () => {
    mockedListDestinations.mockRejectedValue(new DataAccessError("db fail", "DB_ERROR"));

    const response = await get("?type=destinations");
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("data-error");
    expect(body.error.message).toBe("db fail");
  });

  it("returns 500 for unexpected errors", async () => {
    mockedListFood.mockRejectedValue(new Error("unexpected"));

    const response = await get("?type=food");
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("internal-error");
    expect(body.error.message).toBe("unexpected");
  });
});
