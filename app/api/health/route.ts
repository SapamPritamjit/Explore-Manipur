import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasPublishableKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const hasSecretKey = Boolean(process.env.SUPABASE_SECRET_KEY);
  const hasGroq = Boolean(process.env.GROQ_API_KEY);

  const base = {
    app: "Explore Manipur",
    status: "ok" as string,
    config: {
      supabaseUrl: hasUrl,
      supabasePublishableKey: hasPublishableKey,
      supabaseSecretKey: hasSecretKey,
      groqApiKey: hasGroq,
    },
    database: "not_configured" as string,
    time: new Date().toISOString(),
  };

  if (!hasUrl || !hasPublishableKey) {
    return NextResponse.json({ ...base, status: "degraded", database: "missing_config" });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const probeKey = process.env.SUPABASE_SECRET_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, probeKey!);

  try {
    const { error } = await client
      .from("destinations")
      .select("count", { count: "exact", head: true });
    if (error) {
      return NextResponse.json({
        ...base,
        status: "degraded",
        database: "tables_pending",
        detail: error.message,
      });
    }
    return NextResponse.json({ ...base, database: "connected" });
  } catch (error) {
    return NextResponse.json({
      ...base,
      status: "degraded",
      database: "error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}