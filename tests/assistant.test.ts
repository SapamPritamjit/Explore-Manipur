import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/data", async (importActual) => {
  const actual = await importActual<typeof import("@/backend/data")>();
  return {
    ...actual,
    listDestinations: vi.fn(),
    listFood: vi.fn(),
    listExperiences: vi.fn(),
    listAccommodation: vi.fn(),
    listEvents: vi.fn(),
    listTransport: vi.fn(),
  };
});

import { generateGroundedAnswer, retrieveTourismData, runAssistant } from "@/backend/assistant";
import type { AssistantDataset } from "@/backend/assistant";
import type { RetrievedTourismItem } from "@/backend/assistant";
import {
  listAccommodation,
  listDestinations,
  listEvents,
  listExperiences,
  listFood,
  listTransport,
} from "@/backend/data";
import type {
  Accommodation,
  Destination,
  EventItem,
  Experience,
  Food,
  TransportRoute,
} from "@/backend/data";

const mockedListDestinations = vi.mocked(listDestinations);
const mockedListFood = vi.mocked(listFood);
const mockedListExperiences = vi.mocked(listExperiences);
const mockedListAccommodation = vi.mocked(listAccommodation);
const mockedListEvents = vi.mocked(listEvents);
const mockedListTransport = vi.mocked(listTransport);

const timestamp = "2026-01-01T00:00:00Z";

function destination(name: string, overrides: Partial<Destination> = {}): Destination {
  return {
    id: `d-${name}`,
    name,
    category: "General",
    tags: [],
    district: null,
    latitude: null,
    longitude: null,
    description: null,
    distanceFromImphal: null,
    estimatedCost: null,
    estimatedVisitDuration: null,
    bestTime: null,
    openingHours: null,
    contact: null,
    imageUrl: null,
    sourceName: "Manipur Tourism",
    sourceUrl: "https://manipurtourism.gov.in/",
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function food(name: string, overrides: Partial<Food> = {}): Food {
  return {
    id: `f-${name}`,
    name,
    cuisine: null,
    localDishes: [],
    tags: [],
    location: null,
    district: null,
    latitude: null,
    longitude: null,
    priceRange: null,
    openingHours: null,
    contact: null,
    imageUrl: null,
    sourceName: "Outlook Traveller",
    sourceUrl: "https://outlook.in",
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function experience(name: string, overrides: Partial<Experience> = {}): Experience {
  return {
    id: `e-${name}`,
    name,
    category: "General",
    tags: [],
    location: null,
    district: null,
    description: null,
    duration: null,
    estimatedCost: null,
    bestTime: null,
    difficulty: null,
    bookingRequired: null,
    contact: null,
    imageUrl: null,
    sourceName: "Manipur Tourism",
    sourceUrl: "https://manipurtourism.gov.in/",
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function accommodation(name: string, overrides: Partial<Accommodation> = {}): Accommodation {
  return {
    id: `a-${name}`,
    name,
    location: null,
    district: null,
    latitude: null,
    longitude: null,
    type: null,
    priceRange: null,
    facilities: [],
    contact: null,
    bookingUrl: null,
    imageUrl: null,
    sourceName: "Manipur Tourism",
    sourceUrl: "https://manipurtourism.gov.in/",
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function eventItem(name: string, overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: `ev-${name}`,
    name,
    category: null,
    startDate: null,
    endDate: null,
    year: null,
    annualOrOneTime: null,
    location: null,
    district: null,
    description: null,
    organizer: null,
    officialUrl: null,
    imageUrl: null,
    sourceName: "Manipur Tourism",
    sourceUrl: "https://manipurtourism.gov.in/",
    notes: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function transport(origin: string, overrides: Partial<TransportRoute> = {}): TransportRoute {
  return {
    id: `t-${origin}`,
    origin,
    destination: "Loktak Lake",
    transportType: "Road",
    approxDistance: 48,
    approxTime: null,
    notes: null,
    sourceName: "Manipur Tourism",
    sourceUrl: "https://manipurtourism.gov.in/",
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

function dataset(): AssistantDataset {
  return {
    destinations: [
      destination("Loktak Lake", {
        category: "Nature",
        district: "Bishnupur",
        tags: ["lake", "boating"],
        description:
          "Largest fresh-water lake in North East India, known for its floating islands.",
        distanceFromImphal: 48,
      }),
      destination("Kangla Fort", {
        category: "Heritage",
        district: "Imphal West",
        tags: ["fort", "history"],
        description: "Ancient seat of the Manipur kingdom.",
      }),
    ],
    food: [
      food("Eromba", {
        cuisine: "Manipuri (Meitei)",
        localDishes: ["eromba", "ngari"],
        tags: ["traditional"],
      }),
    ],
    experiences: [
      experience("Boating at Loktak", {
        category: "Boating",
        district: "Bishnupur",
        tags: ["boating", "lake"],
      }),
    ],
    accommodation: [
      accommodation("The Classic Hotel", {
        type: "Hotel",
        district: "Imphal East",
        contact: "0385-2443969",
      }),
    ],
    events: [
      eventItem("Shirui Lily Festival", {
        category: "Festival",
        district: "Ukhrul",
        startDate: "2025-05-20",
        endDate: "2025-05-24",
        annualOrOneTime: "annual",
        description: "State-level festival celebrating the endangered Shirui Lily.",
      }),
    ],
    transport: [transport("Imphal")],
  };
}

function groqFetch(content: string) {
  const fn = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content } }] }),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

function groqFetchError(detail: string) {
  const fn = vi.fn().mockResolvedValue({
    ok: false,
    status: 503,
    json: async () => ({ error: { message: detail } }),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("retrieveTourismData", () => {
  const data = dataset();

  it("matches by name", () => {
    const result = retrieveTourismData("Loktak Lake", data);
    expect(result.items[0]).toMatchObject({ table: "destinations", name: "Loktak Lake" });
  });

  it("matches by tag", () => {
    const result = retrieveTourismData("boating", data);
    expect(result.items[0]).toMatchObject({ table: "experiences", name: "Boating at Loktak" });
    expect(result.items[1]).toMatchObject({ table: "destinations", name: "Loktak Lake" });
  });

  it("matches by district", () => {
    const result = retrieveTourismData("ukhrul festival", data);
    expect(result.items[0]).toMatchObject({ table: "events", name: "Shirui Lily Festival" });
  });

  it("matches by cuisine", () => {
    const result = retrieveTourismData("manipuri food", data);
    expect(result.items[0]).toMatchObject({ table: "food", name: "Eromba" });
  });

  it("matches by description text", () => {
    const result = retrieveTourismData("floating islands", data);
    expect(result.items.some((item) => item.name === "Loktak Lake")).toBe(true);
  });

  it("returns items with a rendered detail and source", () => {
    const result = retrieveTourismData("Loktak Lake", data);
    expect(result.items[0].detail).toContain("Distance from Imphal: about 48 km (estimated)");
    expect(result.items[0].sourceUrl).toBe("https://manipurtourism.gov.in/");
  });

  it("returns no matches and is not a greeting", () => {
    const result = retrieveTourismData("quantum computing chips", data);
    expect(result.items).toEqual([]);
    expect(result.isGreeting).toBe(false);
  });

  it("detects greetings", () => {
    expect(retrieveTourismData("hi", data).isGreeting).toBe(true);
    expect(retrieveTourismData("Thanks a lot", data).isGreeting).toBe(true);
    expect(retrieveTourismData("hello there", data).isGreeting).toBe(true);
  });

  it("removes stopwords from the query terms", () => {
    const result = retrieveTourismData("tell me about Loktak Lake", data);
    expect(result.terms.sort()).toEqual(["lake", "loktak"]);
  });

  it("is deterministic", () => {
    const a = retrieveTourismData("lakes and boating in manipur", data);
    const b = retrieveTourismData("lakes and boating in manipur", data);
    expect(a).toEqual(b);
  });
});

describe("generateGroundedAnswer", () => {
  it("sends a grounded prompt and returns the model answer", async () => {
    const fetchFn = groqFetch("Loktak Lake is a large freshwater lake.");
    vi.stubEnv("GROQ_API", "test-key");

    const items: RetrievedTourismItem[] = [
      {
        table: "destinations",
        id: "d-Loktak Lake",
        name: "Loktak Lake",
        detail: "Loktak Lake (Nature, Bishnupur). Record detail.",
        sourceName: "Manipur Tourism",
        sourceUrl: "https://manipurtourism.gov.in/",
      },
    ];

    const result = await generateGroundedAnswer({
      question: "Tell me about Loktak Lake",
      items,
      apiKey: "explicit-key",
      model: "test-model",
    });

    expect(result.answer).toBe("Loktak Lake is a large freshwater lake.");
    expect(fetchFn).toHaveBeenCalledTimes(1);

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer explicit-key");
    const body = JSON.parse(String(init.body));
    expect(body.model).toBe("test-model");
    expect(body.messages[0].content).toContain("Never invent");
    expect(body.messages[1].content).toContain("GROUNDED CONTEXT");
    expect(body.messages[1].content).toContain("Loktak Lake (Nature, Bishnupur)");
  });

  it("passes the trip context into the prompt", async () => {
    groqFetch("ok");
    vi.stubEnv("GROQ_API", "test-key");

    await generateGroundedAnswer({
      question: "Where can I go boating?",
      items: [],
      tripContext: { interests: ["nature"], destinations: ["Loktak Lake"], district: "Bishnupur", category: "Nature" },
      apiKey: "explicit-key",
    });

    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    void url;
    const body = JSON.parse(String(init.body));
    expect(body.messages[1].content).toContain("current trip context");
    expect(body.messages[1].content).toContain("Loktak Lake");
  });

  it("throws when no API key is configured", async () => {
    delete process.env.GROQ_API;
    delete process.env.GROQ_API_KEY;
    await expect(
      generateGroundedAnswer({ question: "hi", items: [] })
    ).rejects.toMatchObject({ code: "assistant-misconfigured" });
  });

  it("throws groq-empty for an empty completion", async () => {
    groqFetch("   ");
    await expect(
      generateGroundedAnswer({ question: "x", items: [], apiKey: "k" })
    ).rejects.toMatchObject({ code: "groq-empty" });
  });

  it("surfaces the upstream error message", async () => {
    groqFetchError("rate limited, slow down");
    await expect(
      generateGroundedAnswer({ question: "x", items: [], apiKey: "k" })
    ).rejects.toMatchObject({ code: "groq-upstream" });
    await expect(
      generateGroundedAnswer({ question: "x", items: [], apiKey: "k" })
    ).rejects.toThrow("rate limited");
  });

  it("wraps network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    await expect(
      generateGroundedAnswer({ question: "x", items: [], apiKey: "k" })
    ).rejects.toMatchObject({ name: "AssistantError", code: "groq-fetch" });
  });

  it("keeps AssistantError codes on structured failures", async () => {
    groqFetch("fine");
    const result = await generateGroundedAnswer({
      question: "x",
      items: [],
      apiKey: "k",
    });
    expect(result.answer).toBe("fine");
  });
});

describe("runAssistant", () => {
  beforeEach(() => {
    vi.stubEnv("GROQ_API", "test-key");
    mockedListDestinations.mockResolvedValue([...dataset().destinations]);
    mockedListFood.mockResolvedValue([...dataset().food]);
    mockedListExperiences.mockResolvedValue([...dataset().experiences]);
    mockedListAccommodation.mockResolvedValue([...dataset().accommodation]);
    mockedListEvents.mockResolvedValue([...dataset().events]);
    mockedListTransport.mockResolvedValue([...dataset().transport]);
  });

  it("returns a grounded LLM answer with sources", async () => {
    groqFetch("Loktak Lake is a large freshwater lake in Bishnupur.");

    const result = await runAssistant({ message: "Tell me about Loktak Lake" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.mode).toBe("grounded-llm");
    expect(result.response.grounded).toBe(true);
    expect(result.response.answer).toBe("Loktak Lake is a large freshwater lake in Bishnupur.");
    expect(result.response.sources).toContainEqual({
      table: "destinations",
      name: "Loktak Lake",
      sourceName: "Manipur Tourism",
      sourceUrl: "https://manipurtourism.gov.in/",
    });
    expect(result.response.sources.length).toBe(3);
    expect(result.response.usedTables).toContain("destinations");
  });

  it("falls back to a grounded summary when Groq is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    const result = await runAssistant({ message: "Tell me about Loktak Lake" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.mode).toBe("grounded-fallback");
    expect(result.response.grounded).toBe(true);
    expect(result.response.answer).toContain("Loktak Lake");
    expect(result.response.sources.length).toBeGreaterThan(0);
  });

  it("never invents answers when nothing matches", async () => {
    const fetchFn = vi.fn();
    vi.stubGlobal("fetch", fetchFn);

    const result = await runAssistant({ message: "quantum computing chips" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.mode).toBe("no-info");
    expect(result.response.grounded).toBe(true);
    expect(result.response.sources).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("returns help text for a greeting without calling the model", async () => {
    const fetchFn = vi.fn();
    vi.stubGlobal("fetch", fetchFn);

    const result = await runAssistant({ message: "hi" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.response.mode).toBe("help");
    expect(result.response.grounded).toBe(false);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("validates an empty message", async () => {
    const result = await runAssistant({ message: "" });
    expect(result).toEqual({
      ok: false,
      kind: "validation",
      issues: [{ field: "message", message: "message must be a non-empty string." }],
    });
  });

  it("validates a non-string message", async () => {
    const result = await runAssistant({ message: 42 });
    expect(result.ok).toBe(false);
    if (result.ok || result.kind !== "validation") return;
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("validates tripContext shape", async () => {
    const result = await runAssistant({ message: "hi", tripContext: ["x"] });
    expect(result.ok).toBe(false);
    if (result.ok || result.kind !== "validation") return;
    expect(result.issues.some((issue) => issue.field === "tripContext")).toBe(true);
  });

  it("returns a data error when the data layer fails", async () => {
    mockedListDestinations.mockRejectedValue(new Error("connection refused"));
    const result = await runAssistant({ message: "Tell me about Loktak Lake" });
    expect(result.ok).toBe(false);
    if (result.ok || result.kind !== "data") return;
    expect(result.error.code).toBe("data-error");
    expect(result.error.message).toContain("connection refused");
  });
});