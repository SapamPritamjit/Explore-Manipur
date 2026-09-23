import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";

const { mockClient, recorded, state } = vi.hoisted(() => {
  const recorded: Array<{ op: string; args: unknown[] }> = [];
  const state = {
    rows: [] as unknown[],
    error: null as { message: string; code?: string } | null,
  };

  function record(op: string, args: unknown[]) {
    recorded.push({ op, args });
  }

  const builder = {
    eq: function (...args: unknown[]) {
      record("eq", args);
      return this;
    },
    overlaps: function (...args: unknown[]) {
      record("overlaps", args);
      return this;
    },
    contains: function (...args: unknown[]) {
      record("contains", args);
      return this;
    },
    order: function (...args: unknown[]) {
      record("order", args);
      return this;
    },
    then: function (resolve: (value: unknown) => unknown) {
      return Promise.resolve(
        resolve({ data: state.rows.slice(), error: state.error })
      );
    },
  };

  const singleBuilder = {
    then: function (resolve: (value: unknown) => unknown) {
      return Promise.resolve(
        resolve({ data: state.rows[0] ?? null, error: state.error })
      );
    },
  };

  const select = (cols: unknown) => {
    void cols;
    const chain = Object.assign(Object.create(builder), builder);
    chain.maybeSingle = () => singleBuilder;
    return chain;
  };

  const mockClient = {
    from: vi.fn((table: string) => {
      void table;
      return { select };
    }),
  };

  return { mockClient, recorded, state };
});

vi.mock("@/lib/supabase", () => ({
  getBrowserClient: () => mockClient,
}));

import {
  DataAccessError,
  listDestinations,
  getDestination,
  listDestinationCandidates,
  listFood,
  getFood,
  listExperiences,
  getExperience,
  listAccommodation,
  getAccommodation,
  listEvents,
  getEvent,
  listTransport,
  toTourismCandidate,
  mapDestination,
  mapFood,
  mapExperience,
  mapAccommodation,
  mapEvent,
  mapTransport,
} from "@/backend/data";
import type {
  Destination,
  Food,
  Experience,
  Accommodation,
  EventItem,
  TransportRoute,
} from "@/backend/data";
import type { DestinationRow } from "@/backend/data/rows";
import type { TourismCandidate } from "@/backend/recommendation";

const fullDestinationRow = {
  id: "d1",
  name: "Loktak Lake",
  district: "Bishnupur",
  category: "Nature",
  description: "Largest fresh water lake",
  latitude: 24.55,
  longitude: 93.78,
  distance_from_imphal: 48,
  estimated_cost: 300,
  estimated_visit_duration: "3-4 hours",
  best_time: "November-March",
  tags: ["lake", "boating"],
  opening_hours: null,
  contact: null,
  image_url: null,
  source_name: "Manipur Tourism",
  source_url: "https://manipurtourism.gov.in/district-wise-destination/",
  notes: "verified",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const expectedDestination: Destination = {
  id: "d1",
  name: "Loktak Lake",
  district: "Bishnupur",
  category: "Nature",
  description: "Largest fresh water lake",
  latitude: 24.55,
  longitude: 93.78,
  distanceFromImphal: 48,
  estimatedCost: 300,
  estimatedVisitDuration: "3-4 hours",
  bestTime: "November-March",
  tags: ["lake", "boating"],
  openingHours: null,
  contact: null,
  imageUrl: null,
  sourceName: "Manipur Tourism",
  sourceUrl: "https://manipurtourism.gov.in/district-wise-destination/",
  notes: "verified",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  recorded.length = 0;
  state.rows = [];
  state.error = null;
});

describe("destination mapping", () => {
  it("maps a row into the domain type and returns typed values", async () => {
    state.rows = [fullDestinationRow];
    const results = await listDestinations();

    expectTypeOf(results).toEqualTypeOf<Destination[]>();
    expect(results).toEqual([expectedDestination]);
  });

  it("preserves NULL database fields as null", () => {
    const mapped = mapDestination({
      id: "d2",
      name: "Spare",
      district: null,
      category: "General",
      description: null,
      latitude: null,
      longitude: null,
      distance_from_imphal: null,
      estimated_cost: null,
      estimated_visit_duration: null,
      best_time: null,
      tags: null,
      opening_hours: null,
      contact: null,
      image_url: null,
      source_name: null,
      source_url: null,
      notes: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    } as unknown as DestinationRow);

    expect(mapped.district).toBeNull();
    expect(mapped.estimatedCost).toBeNull();
    expect(mapped.latitude).toBeNull();
    expect(mapped.longitude).toBeNull();
    expect(mapped.tags).toEqual([]);
  });

  it("returns an empty list for empty results", async () => {
    state.rows = [];
    await expect(listDestinations()).resolves.toEqual([]);
  });

  it("returns null from getDestination when a row is missing", async () => {
    state.rows = [];
    const result = await getDestination("missing");
    expectTypeOf(result).toEqualTypeOf<Destination | null>();
    expect(result).toBeNull();
  });

  it("returns a mapped row from getDestination", async () => {
    state.rows = [fullDestinationRow];
    await expect(getDestination("d1")).resolves.toEqual(expectedDestination);
    expect(recorded).toContainEqual({ op: "eq", args: ["id", "d1"] });
  });
});

describe("destination filters", () => {
  it("applies district, category and interest filters", async () => {
    state.rows = [fullDestinationRow];
    await listDestinations({
      district: " Bishnupur ",
      category: "Nature",
      interests: ["lake", " boating "],
    });

    expect(recorded.map((call) => [call.op, call.args[0]])).toContainEqual([
      "eq",
      "district",
    ]);
    expect(recorded.map((call) => [call.op, call.args[0]])).toContainEqual([
      "eq",
      "category",
    ]);
    expect(recorded).toContainEqual({
      op: "overlaps",
      args: ["tags", ["lake", "boating"]],
    });
    expect(recorded.map((call) => call.op)).toContain("order");
    expect(mockClient.from).toHaveBeenCalledWith("destinations");
  });

  it("ignores empty filter values", async () => {
    state.rows = [fullDestinationRow];
    await listDestinations({ district: "  ", interests: [] });

    const ops = recorded.map((call) => call.op);
    expect(ops).not.toContain("eq");
    expect(ops).not.toContain("overlaps");
  });

  it("converts destinations to engine candidates with coordinates only when known", async () => {
    state.rows = [
      fullDestinationRow,
      { ...fullDestinationRow, id: "d3", latitude: null, longitude: null },
    ];
    const candidates = await listDestinationCandidates();

    expectTypeOf(candidates).toEqualTypeOf<TourismCandidate[]>();
    expect(candidates[0].coordinates).toEqual({ latitude: 24.55, longitude: 93.78 });
    expect(candidates[1].coordinates).toBeNull();
  });
});

describe("other tables", () => {
  it("maps food rows", async () => {
    state.rows = [
      {
        id: "f1",
        name: "Eromba",
        location: null,
        district: null,
        latitude: null,
        longitude: null,
        cuisine: "Manipuri",
        local_dishes: ["eromba", "ngari"],
        price_range: null,
        opening_hours: null,
        contact: null,
        image_url: null,
        tags: ["traditional"],
        source_name: "Outlook Traveller",
        source_url: "https://outlook.in",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const results = await listFood();
    expectTypeOf(results).toEqualTypeOf<Food[]>();
    expect(results[0]).toMatchObject({
      name: "Eromba",
      localDishes: ["eromba", "ngari"],
      cuisine: "Manipuri",
      tags: ["traditional"],
    });
  });

  it("maps experience rows including nullable booleans", async () => {
    state.rows = [
      {
        id: "e1",
        name: "Shirui Trek",
        location: "Shirui Hills",
        district: "Ukhrul",
        category: "Trekking",
        description: null,
        duration: null,
        estimated_cost: null,
        best_time: "May-June",
        difficulty: null,
        booking_required: null,
        contact: null,
        image_url: null,
        tags: ["trek"],
        source_name: "Manipur Tourism",
        source_url: "https://manipurtourism.gov.in/",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const results = await listExperiences();
    expectTypeOf(results).toEqualTypeOf<Experience[]>();
    expect(results[0]).toMatchObject({
      name: "Shirui Trek",
      bookingRequired: null,
      bestTime: "May-June",
    });
  });

  it("maps accommodation rows", async () => {
    state.rows = [
      {
        id: "a1",
        name: "Classic Grande",
        location: null,
        district: "Imphal East",
        latitude: null,
        longitude: null,
        type: "Hotel",
        price_range: null,
        facilities: [],
        contact: "0385-2422139",
        booking_url: null,
        image_url: null,
        source_name: "Manipur Tourism",
        source_url: "https://manipurtourism.gov.in/find-accommodation/",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const results = await listAccommodation();
    expectTypeOf(results).toEqualTypeOf<Accommodation[]>();
    expect(results[0]).toMatchObject({ name: "Classic Grande", type: "Hotel" });
  });

  it("maps event rows", async () => {
    state.rows = [
      {
        id: "ev1",
        name: "Shirui Lily Festival",
        category: "Festival",
        start_date: "2025-05-20",
        end_date: "2025-05-24",
        year: 2025,
        annual_or_one_time: "annual",
        location: "Ukhrul",
        district: "Ukhrul",
        description: null,
        organizer: "Department of Tourism",
        official_url: "https://manipurtourism.gov.in/shirui-lily-festival/",
        image_url: null,
        source_name: "Manipur Tourism",
        source_url: "https://manipurtourism.gov.in/shirui-lily-festival/",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const results = await listEvents();
    expectTypeOf(results).toEqualTypeOf<EventItem[]>();
    expect(results[0]).toMatchObject({
      name: "Shirui Lily Festival",
      startDate: "2025-05-20",
      annualOrOneTime: "annual",
      year: 2025,
    });
  });

  it("maps transport rows", async () => {
    state.rows = [
      {
        id: "t1",
        origin: "Imphal",
        destination: "Loktak Lake",
        transport_type: "Road",
        approx_distance: 48,
        approx_time: null,
        notes: null,
        source_name: "Manipur Tourism",
        source_url: "https://manipurtourism.gov.in/",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const results = await listTransport();
    expectTypeOf(results).toEqualTypeOf<TransportRoute[]>();
    expect(results[0]).toMatchObject({
      origin: "Imphal",
      destination: "Loktak Lake",
      approxDistance: 48,
      approxTime: null,
    });
  });
});

describe("single-get functions", () => {
  it("returns null from getFood when row is missing", async () => {
    state.rows = [];
    const result = await getFood("missing");
    expect(result).toBeNull();
  });

  it("returns mapped food from getFood", async () => {
    state.rows = [
      {
        id: "f1",
        name: "Eromba",
        location: null,
        district: null,
        latitude: null,
        longitude: null,
        cuisine: "Manipuri",
        local_dishes: ["eromba"],
        price_range: null,
        opening_hours: null,
        contact: null,
        image_url: null,
        tags: ["traditional"],
        source_name: "Outlook Traveller",
        source_url: "https://outlook.in",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const result = await getFood("f1");
    expect(result).toMatchObject({ name: "Eromba", cuisine: "Manipuri" });
    expect(recorded).toContainEqual({ op: "eq", args: ["id", "f1"] });
  });

  it("returns null from getExperience when row is missing", async () => {
    state.rows = [];
    const result = await getExperience("missing");
    expect(result).toBeNull();
  });

  it("returns mapped experience from getExperience", async () => {
    state.rows = [
      {
        id: "e1",
        name: "Shirui Trek",
        location: "Shirui Hills",
        district: "Ukhrul",
        category: "Trekking",
        description: null,
        duration: null,
        estimated_cost: null,
        best_time: "May-June",
        difficulty: null,
        booking_required: null,
        contact: null,
        image_url: null,
        tags: ["trek"],
        source_name: "Manipur Tourism",
        source_url: "https://manipurtourism.gov.in/",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const result = await getExperience("e1");
    expect(result).toMatchObject({ name: "Shirui Trek", category: "Trekking" });
  });

  it("returns null from getAccommodation when row is missing", async () => {
    state.rows = [];
    const result = await getAccommodation("missing");
    expect(result).toBeNull();
  });

  it("returns mapped accommodation from getAccommodation", async () => {
    state.rows = [
      {
        id: "a1",
        name: "Classic Grande",
        location: null,
        district: "Imphal East",
        latitude: null,
        longitude: null,
        type: "Hotel",
        price_range: null,
        facilities: [],
        contact: null,
        booking_url: null,
        image_url: null,
        source_name: "Manipur Tourism",
        source_url: "https://manipurtourism.gov.in/",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const result = await getAccommodation("a1");
    expect(result).toMatchObject({ name: "Classic Grande", type: "Hotel" });
  });

  it("returns null from getEvent when row is missing", async () => {
    state.rows = [];
    const result = await getEvent("missing");
    expect(result).toBeNull();
  });

  it("returns mapped event from getEvent", async () => {
    state.rows = [
      {
        id: "ev1",
        name: "Shirui Lily Festival",
        category: "Festival",
        start_date: "2025-05-20",
        end_date: "2025-05-24",
        year: 2025,
        annual_or_one_time: "annual",
        location: "Ukhrul",
        district: "Ukhrul",
        description: null,
        organizer: null,
        official_url: null,
        image_url: null,
        source_name: "Manipur Tourism",
        source_url: "https://manipurtourism.gov.in/",
        notes: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ];
    const result = await getEvent("ev1");
    expect(result).toMatchObject({ name: "Shirui Lily Festival", category: "Festival" });
  });

  it("throws DataAccessError from getFood on database failure", async () => {
    state.error = { message: "connection failed", code: "08001" };
    await expect(getFood("f1")).rejects.toThrow(DataAccessError);
  });

  it("throws DataAccessError from getExperience on database failure", async () => {
    state.error = { message: "connection failed", code: "08001" };
    await expect(getExperience("e1")).rejects.toThrow(DataAccessError);
  });

  it("throws DataAccessError from getAccommodation on database failure", async () => {
    state.error = { message: "connection failed", code: "08001" };
    await expect(getAccommodation("a1")).rejects.toThrow(DataAccessError);
  });

  it("throws DataAccessError from getEvent on database failure", async () => {
    state.error = { message: "connection failed", code: "08001" };
    await expect(getEvent("ev1")).rejects.toThrow(DataAccessError);
  });
});

describe("error handling", () => {
  it("does not return fake data when the database fails", async () => {
    state.error = { message: "connection failed", code: "08001" };

    await expect(listDestinations()).rejects.toBeInstanceOf(DataAccessError);
    await expect(listDestinations()).rejects.toMatchObject({
      name: "DataAccessError",
      code: "08001",
    });
    await expect(listFood()).rejects.toMatchObject({ name: "DataAccessError" });
    await expect(listExperiences()).rejects.toThrow(DataAccessError);
    await expect(listAccommodation()).rejects.toThrow(DataAccessError);
    await expect(listEvents()).rejects.toThrow(DataAccessError);
    await expect(listTransport()).rejects.toThrow(DataAccessError);
    await expect(getDestination("d1")).rejects.toThrow(DataAccessError);
  });

  it("includes the context in the thrown message", async () => {
    state.error = { message: "boom", code: "PGRST116" };
    try {
      await listDestinations();
      throw new Error("should have thrown");
    } catch (error) {
      expect(String(error)).toContain("listDestinations");
    }
  });
});

describe("converter", () => {
  it("builds a TourismCandidate from a Destination", () => {
    const request = toTourismCandidate(expectedDestination);
    expectTypeOf(request).toEqualTypeOf<TourismCandidate>();
    expect(request).toEqual({
      id: "d1",
      name: "Loktak Lake",
      category: "Nature",
      tags: ["lake", "boating"],
      district: "Bishnupur",
      coordinates: { latitude: 24.55, longitude: 93.78 },
      distanceFromImphal: 48,
      estimatedCost: 300,
      estimatedVisitDuration: "3-4 hours",
      bestTime: "November-March",
    });
  });

  it("never invents coordinates when they are missing", () => {
    const request = toTourismCandidate({
      ...expectedDestination,
      latitude: null,
      longitude: null,
    });
    expect(request.coordinates).toBeNull();
  });
});

describe("module exports", () => {
  it("exposes mapper functions", () => {
    expect(mapDestination).toBeTypeOf("function");
    expect(mapFood).toBeTypeOf("function");
    expect(mapExperience).toBeTypeOf("function");
    expect(mapAccommodation).toBeTypeOf("function");
    expect(mapEvent).toBeTypeOf("function");
    expect(mapTransport).toBeTypeOf("function");
  });
});