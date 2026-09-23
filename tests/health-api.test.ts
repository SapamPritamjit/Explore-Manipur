import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      ),
    })),
  })),
}));

describe("GET /api/health", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function getHealth() {
    const { GET } = await import("@/app/api/health/route");
    return GET();
  }

  it("returns degraded with missing_config when SUPABASE_URL is absent", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const response = await getHealth();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.app).toBe("Explore Manipur");
    expect(body.status).toBe("degraded");
    expect(body.database).toBe("missing_config");
    expect(body.config.supabaseUrl).toBe(false);
    expect(body.config.supabasePublishableKey).toBe(false);
    expect(body.time).toBeDefined();
  });

  it("returns degraded with missing_config when only URL is set", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const response = await getHealth();
    const body = await response.json();
    expect(body.status).toBe("degraded");
    expect(body.database).toBe("missing_config");
  });

  it("does not expose secret values in config booleans", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiJ9.secret";
    process.env.SUPABASE_SECRET_KEY = "super-secret-key";
    process.env.GROQ_API_KEY = "gsk_abc123";

    const response = await getHealth();
    const body = await response.json();

    expect(typeof body.config.supabaseUrl).toBe("boolean");
    expect(typeof body.config.supabasePublishableKey).toBe("boolean");
    expect(typeof body.config.supabaseSecretKey).toBe("boolean");
    expect(typeof body.config.groqApiKey).toBe("boolean");
    expect(body.config.supabaseUrl).toBe(true);
    expect(body.config.supabasePublishableKey).toBe(true);
    expect(body.config.supabaseSecretKey).toBe(true);
    expect(body.config.groqApiKey).toBe(true);

    expect(JSON.stringify(body)).not.toContain("super-secret-key");
    expect(JSON.stringify(body)).not.toContain("gsk_abc123");
    expect(JSON.stringify(body)).not.toContain("eyJhbGciOiJIUzI1NiJ9.secret");
  });

  it("reports connected when supabase probe succeeds", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "pubkey";

    const response = await getHealth();
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBe("connected");
  });

  it("includes an ISO timestamp", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const response = await getHealth();
    const body = await response.json();
    expect(new Date(body.time).toISOString()).toBe(body.time);
  });
});
