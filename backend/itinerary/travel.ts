import { haversineKm, isImphalLabel } from "../recommendation";
import type { Coordinates, DistanceKind } from "../recommendation";
import { hasValidCoordinates } from "./order";
import type { ItineraryStop, TravelSegment } from "./types";

export interface SegmentEndpoint {
  name: string;
  coordinates?: Coordinates | null;
  isStart?: boolean;
  label?: string;
  distanceFromImphal?: number | null;
}

function roundKm(km: number): number {
  return Math.round(km * 10) / 10;
}

function stopEndpoint(stop: ItineraryStop): SegmentEndpoint {
  return {
    name: stop.destination.name,
    coordinates: stop.destination.coordinates ?? null,
    distanceFromImphal: stop.destination.distanceFromImphal ?? null,
  };
}

export function segmentDistanceInfo(
  from: SegmentEndpoint,
  to: SegmentEndpoint
): { distanceKm: number | null; distanceType: DistanceKind } {
  const fromCoordinates = hasValidCoordinates(from.coordinates)
    ? from.coordinates
    : null;
  const toCoordinates = hasValidCoordinates(to.coordinates)
    ? to.coordinates
    : null;

  if (fromCoordinates && toCoordinates) {
    return {
      distanceKm: roundKm(haversineKm(fromCoordinates, toCoordinates)),
      distanceType: "haversine",
    };
  }

  if (
    from.isStart &&
    isImphalLabel(from.label ?? "") &&
    to.distanceFromImphal != null
  ) {
    return {
      distanceKm: to.distanceFromImphal,
      distanceType: "imphal-estimate",
    };
  }

  if (
    to.isStart &&
    isImphalLabel(to.label ?? "") &&
    from.distanceFromImphal != null
  ) {
    return {
      distanceKm: from.distanceFromImphal,
      distanceType: "imphal-estimate",
    };
  }

  return { distanceKm: null, distanceType: "unknown" };
}

export function makeSegment(from: SegmentEndpoint, to: SegmentEndpoint): TravelSegment {
  const distance = segmentDistanceInfo(from, to);
  return {
    from: from.name,
    to: to.name,
    distanceKm: distance.distanceKm,
    distanceType: distance.distanceType,
    travelTime: null,
    travelTimeUnknown: true,
  };
}

export function buildDaySegments(
  start: { label: string; coordinates?: Coordinates | null } | null | undefined,
  stops: readonly ItineraryStop[]
): TravelSegment[] {
  const segments: TravelSegment[] = [];

  if (stops.length === 0) {
    return segments;
  }

  const startEndpoint: SegmentEndpoint = {
    name: start?.label ?? "Start",
    coordinates: start?.coordinates ?? null,
    isStart: true,
    label: start?.label,
  };

  segments.push(makeSegment(startEndpoint, stopEndpoint(stops[0])));

  for (let i = 1; i < stops.length; i++) {
    segments.push(makeSegment(stopEndpoint(stops[i - 1]), stopEndpoint(stops[i])));
  }

  segments.push(makeSegment(stopEndpoint(stops[stops.length - 1]), startEndpoint));

  return segments;
}