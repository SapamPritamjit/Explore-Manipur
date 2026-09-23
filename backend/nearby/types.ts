import type { Coordinates } from "@/backend/recommendation";

export interface NearbyRequestInput {
  latitude?: unknown;
  longitude?: unknown;
  radiusKm?: unknown;
  kinds?: unknown;
  limitPerKind?: unknown;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export type NearbyKind = "destinations" | "food" | "experiences" | "accommodation";

export const NEARBY_KINDS: readonly NearbyKind[] = [
  "destinations",
  "food",
  "experiences",
  "accommodation",
];

export interface NormalizedNearbyRequest {
  center: Coordinates;
  radiusKm: number;
  kinds: NearbyKind[];
  limitPerKind: number;
}

export type NearbyRequestValidation =
  | { kind: "valid"; request: NormalizedNearbyRequest }
  | { kind: "invalid"; issues: ValidationIssue[] };

export interface NearbyPlace {
  id: string;
  name: string;
  kind: NearbyKind;
  category: string | null;
  district: string | null;
  coordinates: Coordinates;
  distanceKm: number;
  sourceName: string | null;
  sourceUrl: string | null;
}

export interface NearbyGroup {
  kind: NearbyKind;
  items: NearbyPlace[];
  skippedWithoutCoordinates: number;
}

export type NearbyWarningCode = "missing-coordinates" | "no-places-nearby";

export interface NearbyWarning {
  code: NearbyWarningCode;
  message: string;
}

export interface NearbyResponse {
  request: NormalizedNearbyRequest;
  groups: NearbyGroup[];
  totalMatches: number;
  warnings: NearbyWarning[];
}

export type NearbyResult =
  | { ok: true; response: NearbyResponse }
  | { ok: false; kind: "validation"; issues: ValidationIssue[] }
  | { ok: false; kind: "data"; error: { code: string; message: string } };