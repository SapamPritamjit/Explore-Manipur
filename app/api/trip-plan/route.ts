import { NextResponse } from "next/server";
import { planTrip } from "@/backend/trip-planning";
import type { TripPlanRequestInput } from "@/backend/trip-planning";
import { DataAccessError } from "@/backend/data";

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

  try {
    const result = await planTrip(body as TripPlanRequestInput);
    if (!result.ok) {
      return NextResponse.json(
        errorBody("validation-error", "Request failed validation.", result.issues),
        { status: 400 }
      );
    }
    return NextResponse.json(result.response);
  } catch (error) {
    const code = error instanceof DataAccessError ? "data-error" : "internal-error";
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while planning the trip.";
    return NextResponse.json(errorBody(code, message), { status: 500 });
  }
}