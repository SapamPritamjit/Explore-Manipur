import { NextResponse } from "next/server";
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = [
  "destinations",
  "food",
  "experiences",
  "accommodation",
  "events",
  "transport",
] as const;

type ExploreType = (typeof VALID_TYPES)[number];

function isExploreType(value: string): value is ExploreType {
  return (VALID_TYPES as readonly string[]).includes(value);
}

function errorBody(code: string, message: string) {
  return { ok: false, error: { code, message } };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  const district = url.searchParams.get("district") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const interestsParam = url.searchParams.get("interests");
  const interests = interestsParam
    ? interestsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  if (!type || !isExploreType(type)) {
    return NextResponse.json(
      errorBody(
        "invalid-type",
        `type query parameter is required. Must be one of: ${VALID_TYPES.join(", ")}.`
      ),
      { status: 400 }
    );
  }

  try {
    if (id) {
      return await handleGet(type, id);
    }
    return await handleList(type, { district, category, interests });
  } catch (error) {
    if (error instanceof DataAccessError) {
      return NextResponse.json(
        errorBody("data-error", error.message),
        { status: 500 }
      );
    }
    return NextResponse.json(
      errorBody(
        "internal-error",
        error instanceof Error ? error.message : "Unexpected error."
      ),
      { status: 500 }
    );
  }
}

async function handleList(
  type: ExploreType,
  filters: { district?: string; category?: string; interests?: string[] }
) {
  switch (type) {
    case "destinations": {
      const data = await listDestinations({
        district: filters.district,
        category: filters.category,
        interests: filters.interests,
      });
      return NextResponse.json({ ok: true, data });
    }
    case "food": {
      const data = await listFood();
      return NextResponse.json({ ok: true, data });
    }
    case "experiences": {
      const data = await listExperiences();
      return NextResponse.json({ ok: true, data });
    }
    case "accommodation": {
      const data = await listAccommodation();
      return NextResponse.json({ ok: true, data });
    }
    case "events": {
      const data = await listEvents();
      return NextResponse.json({ ok: true, data });
    }
    case "transport": {
      const data = await listTransport();
      return NextResponse.json({ ok: true, data });
    }
  }
}

async function handleGet(type: ExploreType, id: string) {
  switch (type) {
    case "destinations": {
      const data = await getDestination(id);
      if (!data) {
        return NextResponse.json(errorBody("not-found", "Destination not found."), { status: 404 });
      }
      return NextResponse.json({ ok: true, data });
    }
    case "food": {
      const data = await getFood(id);
      if (!data) {
        return NextResponse.json(errorBody("not-found", "Food record not found."), { status: 404 });
      }
      return NextResponse.json({ ok: true, data });
    }
    case "experiences": {
      const data = await getExperience(id);
      if (!data) {
        return NextResponse.json(errorBody("not-found", "Experience not found."), { status: 404 });
      }
      return NextResponse.json({ ok: true, data });
    }
    case "accommodation": {
      const data = await getAccommodation(id);
      if (!data) {
        return NextResponse.json(errorBody("not-found", "Accommodation not found."), { status: 404 });
      }
      return NextResponse.json({ ok: true, data });
    }
    case "events": {
      const data = await getEvent(id);
      if (!data) {
        return NextResponse.json(errorBody("not-found", "Event not found."), { status: 404 });
      }
      return NextResponse.json({ ok: true, data });
    }
    case "transport": {
      return NextResponse.json(
        errorBody("unsupported", "Single transport lookup is not supported."),
        { status: 400 }
      );
    }
  }
}