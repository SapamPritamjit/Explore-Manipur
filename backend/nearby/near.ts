import { haversineKm } from "@/backend/recommendation";
import type { Coordinates } from "@/backend/recommendation";
import {
  listAccommodation,
  listDestinations,
  listExperiences,
  listFood,
} from "@/backend/data";
import type {
  Accommodation,
  Destination,
  Experience,
  Food,
} from "@/backend/data";
import { validateNearbyRequest } from "./validate";
import type {
  NearbyGroup,
  NearbyKind,
  NearbyPlace,
  NearbyRequestInput,
  NearbyResult,
  NearbyResponse,
  NearbyWarning,
  NormalizedNearbyRequest,
} from "./types";

export interface NearbyDataset {
  destinations: readonly Destination[];
  food: readonly Food[];
  experiences: readonly Experience[];
  accommodation: readonly Accommodation[];
}

interface NearbyRecord {
  id: string;
  name: string;
  kind: NearbyKind;
  category: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
}

function destinationRecords(destinations: readonly Destination[]): NearbyRecord[] {
  return destinations.map((destination) => ({
    id: destination.id,
    name: destination.name,
    kind: "destinations",
    category: destination.category,
    district: destination.district,
    latitude: destination.latitude,
    longitude: destination.longitude,
    sourceName: destination.sourceName,
    sourceUrl: destination.sourceUrl,
  }));
}

function foodRecords(food: readonly Food[]): NearbyRecord[] {
  return food.map((entry) => ({
    id: entry.id,
    name: entry.name,
    kind: "food",
    category: entry.cuisine,
    district: entry.district,
    latitude: entry.latitude,
    longitude: entry.longitude,
    sourceName: entry.sourceName,
    sourceUrl: entry.sourceUrl,
  }));
}

function experienceRecords(experiences: readonly Experience[]): NearbyRecord[] {
  return experiences.map((experience) => ({
    id: experience.id,
    name: experience.name,
    kind: "experiences",
    category: experience.category,
    district: experience.district,
    latitude: null,
    longitude: null,
    sourceName: experience.sourceName,
    sourceUrl: experience.sourceUrl,
  }));
}

function accommodationRecords(
  accommodation: readonly Accommodation[]
): NearbyRecord[] {
  return accommodation.map((entry) => ({
    id: entry.id,
    name: entry.name,
    kind: "accommodation",
    category: entry.type,
    district: entry.district,
    latitude: entry.latitude,
    longitude: entry.longitude,
    sourceName: entry.sourceName,
    sourceUrl: entry.sourceUrl,
  }));
}

function recordsForKind(dataset: NearbyDataset, kind: NearbyKind): NearbyRecord[] {
  switch (kind) {
    case "destinations":
      return destinationRecords(dataset.destinations);
    case "food":
      return foodRecords(dataset.food);
    case "experiences":
      return experienceRecords(dataset.experiences);
    case "accommodation":
      return accommodationRecords(dataset.accommodation);
  }
}

function toPlace(
  record: NearbyRecord,
  center: Coordinates,
  distanceMarginKm: number
): NearbyPlace | null {
  if (
    record.latitude === null ||
    record.longitude === null ||
    !Number.isFinite(record.latitude) ||
    !Number.isFinite(record.longitude)
  ) {
    return null;
  }
  const coordinates: Coordinates = {
    latitude: record.latitude,
    longitude: record.longitude,
  };
  const distanceKm = Math.round(haversineKm(center, coordinates) * 10) / 10;
  if (distanceKm > distanceMarginKm * 1.000001) {
    return null;
  }
  return {
    id: record.id,
    name: record.name,
    kind: record.kind,
    category: record.category,
    district: record.district,
    coordinates,
    distanceKm,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
  };
}

function buildGroup(
  kind: NearbyKind,
  records: readonly NearbyRecord[],
  request: NormalizedNearbyRequest
): NearbyGroup {
  let skippedWithoutCoordinates = 0;
  const places: NearbyPlace[] = [];

  for (const record of records) {
    const place = toPlace(record, request.center, request.radiusKm);
    if (place === null) {
      if (
        record.latitude === null ||
        record.longitude === null ||
        !Number.isFinite(record.latitude) ||
        !Number.isFinite(record.longitude)
      ) {
        skippedWithoutCoordinates += 1;
      }
      continue;
    }
    places.push(place);
  }

  places.sort(
    (a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name)
  );

  return {
    kind,
    items: places.slice(0, request.limitPerKind),
    skippedWithoutCoordinates,
  };
}

export function findNearbyInDataset(
  dataset: NearbyDataset,
  request: NormalizedNearbyRequest
): NearbyResponse {
  const groups: NearbyGroup[] = request.kinds.map((kind) =>
    buildGroup(kind, recordsForKind(dataset, kind), request)
  );

  const totalMatches = groups.reduce((sum, group) => sum + group.items.length, 0);

  const warnings: NearbyWarning[] = [];

  const skipped = groups.reduce(
    (sum, group) => sum + group.skippedWithoutCoordinates,
    0
  );
  if (skipped > 0) {
    warnings.push({
      code: "missing-coordinates",
      message: `${skipped} nearby record(s) were skipped because their coordinates are not recorded in the tourism database.`,
    });
  }

  if (totalMatches === 0) {
    warnings.push({
      code: "no-places-nearby",
      message: `No verified places were found within ${request.radiusKm} km of the given coordinates.`,
    });
  }

  return {
    request,
    groups,
    totalMatches,
    warnings,
  };
}

export async function findNearby(input: NearbyRequestInput): Promise<NearbyResult> {
  const outcome = validateNearbyRequest(input);
  if (outcome.kind === "invalid") {
    return { ok: false, kind: "validation", issues: outcome.issues };
  }
  const request = outcome.request;

  let dataset: NearbyDataset;
  try {
    const [destinations, food, experiences, accommodation] = await Promise.all([
      listDestinations(),
      listFood(),
      listExperiences(),
      listAccommodation(),
    ]);
    dataset = { destinations, food, experiences, accommodation };
  } catch (error) {
    return {
      ok: false,
      kind: "data",
      error: {
        code: "data-error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load the tourism dataset for the nearby search.",
      },
    };
  }

  return { ok: true, response: findNearbyInDataset(dataset, request) };
}