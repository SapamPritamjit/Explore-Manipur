import { NextResponse } from "next/server";
import { runAssistant } from "@/backend/assistant";
import type { AssistantRequestInput } from "@/backend/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorBody(code: string, message: string, details?: unknown) {
  return {
    ok: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      errorBody("invalid-json", "POST body must be a valid JSON object."),
      { status: 400 }
    );
  }

  const result = await runAssistant(body as AssistantRequestInput);

  if (!result.ok) {
    if (result.kind === "validation") {
      return NextResponse.json(
        errorBody("validation-error", "Request failed validation.", result.issues),
        { status: 400 }
      );
    }
    return NextResponse.json(errorBody(result.error.code, result.error.message), {
      status: 500,
    });
  }

  return NextResponse.json(result.response);
}