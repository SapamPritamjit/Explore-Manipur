import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/backend/assistant", async (importActual) => {
  const actual = await importActual<typeof import("@/backend/assistant")>();
  return { ...actual, runAssistant: vi.fn() };
});

import { POST } from "@/app/api/assistant/route";
import { runAssistant } from "@/backend/assistant";
import type { AssistantResponse } from "@/backend/assistant";

const mockedRunAssistant = vi.mocked(runAssistant);

const okResponse: AssistantResponse = {
  answer: "No records matched.",
  sources: [],
  grounded: true,
  mode: "no-info",
  usedTables: [],
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  mockedRunAssistant.mockReset();
});

describe("POST /api/assistant", () => {
  it("returns 200 with the assistant response", async () => {
    mockedRunAssistant.mockResolvedValue({ ok: true, response: okResponse });

    const response = await post({ message: "Tell me about Loktak Lake" });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(okResponse);
  });

  it("returns 400 with validation issues", async () => {
    mockedRunAssistant.mockResolvedValue({
      ok: false,
      kind: "validation",
      issues: [{ field: "message", message: "message must be a non-empty string." }],
    });

    const response = await post({ message: "" });
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
    expect(mockedRunAssistant).not.toHaveBeenCalled();
  });

  it("returns 500 for a data-layer error", async () => {
    mockedRunAssistant.mockResolvedValue({
      ok: false,
      kind: "data",
      error: { code: "data-error", message: "listDestinations: connection failed" },
    });

    const response = await post({ message: "Tell me about Loktak Lake" });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("data-error");
  });
});