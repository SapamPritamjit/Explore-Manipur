import { GEO_MAX_DISTANCE_KM, MAX_SCORE, NEUTRAL_SCORE } from "./weights";
import { haversineKm } from "./haversine";
import { isImphalLabel } from "./text";
import type { Coordinates, DistanceKind, TourismCandidate } from "./types";

export interface GeographyResult {
  score: number;
  distanceKm: number | null;
  distanceKind: DistanceKind;
}

function distanceScore(km: number): number {
  const raw = MAX_SCORE - (km / GEO_MAX_DISTANCE_KM) * MAX_SCORE;
  return Math.max(0, Math.min(MAX_SCORE, raw));
}

function roundKm(km: number): number {
  return Math.round(km * 10) / 10;
}

export interface StartLocationInput {
  label: string;
  coordinates?: Coordinates | null;
}

export function scoreGeography(
  start: StartLocationInput | null | undefined,
  candidate: Pick<
    TourismCandidate,
    "coordinates" | "distanceFromImphal"
  >
): GeographyResult {
  const startCoords = start?.coordinates;
  const destinationCoords = candidate.coordinates;

  if (startCoords && destinationCoords) {
    const km = haversineKm(startCoords, destinationCoords);
    return {
      score: distanceScore(km),
      distanceKm: roundKm(km),
      distanceKind: "haversine",
    };
  }

  if (start && isImphalLabel(start.label) && candidate.distanceFromImphal != null) {
    const km = candidate.distanceFromImphal;
    return {
      score: distanceScore(km),
      distanceKm: km,
      distanceKind: "imphal-estimate",
    };
  }

  return {
    score: NEUTRAL_SCORE,
    distanceKm: null,
    distanceKind: "unknown",
  };
}