import { parseVisitHours } from "../recommendation";
import type { TourismCandidate } from "../recommendation";
import { UNKNOWN_ACTIVITY_HOURS } from "./constants";
import type { ItineraryDay, ItineraryStop } from "./types";

export interface PackedDay {
  dayNumber: number;
  scheduledHours: number;
  usedKnownHours: number;
  unknownDurationCount: number;
  stops: ItineraryStop[];
  costKnownSubtotal: number;
  costUnknownCount: number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function buildStop(destination: TourismCandidate): ItineraryStop {
  const visitHours = parseVisitHours(destination.estimatedVisitDuration);
  const estimatedCost = isFiniteNumber(destination.estimatedCost)
    ? destination.estimatedCost
    : null;
  return {
    destination,
    visitHours,
    visitDurationUnknown: visitHours == null,
    costKnown: estimatedCost !== null,
    estimatedCost,
  };
}

export function buildStops(destinations: readonly TourismCandidate[]): ItineraryStop[] {
  return destinations.map(buildStop);
}

export interface PackingResult {
  days: PackedDay[];
  overflowDays: number;
}

export function packDays(
  stops: readonly ItineraryStop[],
  requestedDays: number,
  dailyAvailableHours: number
): PackingResult {
  const days: PackedDay[] = [];
  let current: PackedDay | null = null;

  for (const stop of stops) {
    const hours = stop.visitHours ?? UNKNOWN_ACTIVITY_HOURS;

    if (current && current.scheduledHours + hours <= dailyAvailableHours) {
      appendStop(current, stop, hours);
      continue;
    }

    current = createDay(days.length + 1);
    appendStop(current, stop, hours);
    days.push(current);
  }

  const overflowDays =
    days.length > requestedDays ? days.length - requestedDays : 0;

  return { days, overflowDays };
}

function createDay(dayNumber: number): PackedDay {
  return {
    dayNumber,
    scheduledHours: 0,
    usedKnownHours: 0,
    unknownDurationCount: 0,
    stops: [],
    costKnownSubtotal: 0,
    costUnknownCount: 0,
  };
}

function appendStop(day: PackedDay, stop: ItineraryStop, hours: number): void {
  day.stops.push(stop);
  day.scheduledHours += hours;
  if (stop.visitHours != null) {
    day.usedKnownHours += stop.visitHours;
  } else {
    day.unknownDurationCount += 1;
  }
  if (stop.costKnown) {
    day.costKnownSubtotal += stop.estimatedCost ?? 0;
  } else {
    day.costUnknownCount += 1;
  }
}

export function finalizeDays(
  packed: readonly PackedDay[],
  dailyAvailableHours: number
): ItineraryDay[] {
  return packed.map((day) => ({
    dayNumber: day.dayNumber,
    stops: day.stops,
    travelSegments: [],
    availableHours: dailyAvailableHours,
    scheduledHours: day.scheduledHours,
    usedKnownHours: day.usedKnownHours,
    unknownDurationCount: day.unknownDurationCount,
    overCapacity: day.scheduledHours > dailyAvailableHours,
    cost: {
      knownSubtotal: day.costKnownSubtotal,
      unknownCount: day.costUnknownCount,
    },
  }));
}