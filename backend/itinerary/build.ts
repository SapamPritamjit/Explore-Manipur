import { orderDestinations } from "./order";
import { buildStops, finalizeDays, packDays } from "./pack";
import { buildDaySegments } from "./travel";
import { DEFAULT_DAILY_HOURS, UNKNOWN_ACTIVITY_HOURS } from "./constants";
import type {
  BudgetStatus,
  Itinerary,
  ItineraryCostSummary,
  ItineraryInput,
  ItineraryWarning,
} from "./types";

function resolveRequestedDays(durationDays: number): number {
  return durationDays > 0 ? Math.ceil(durationDays) : 1;
}

function resolveDailyHours(dailyAvailableHours: number | null | undefined): number {
  return dailyAvailableHours && dailyAvailableHours > 0
    ? dailyAvailableHours
    : DEFAULT_DAILY_HOURS;
}

export function buildItinerary(input: ItineraryInput): Itinerary {
  const warnings: ItineraryWarning[] = [];
  const rawDuration = input.durationDays;
  const invalidDuration = !(rawDuration > 0);
  if (invalidDuration) {
    warnings.push({
      code: "invalid-duration",
      message: `Trip duration "${rawDuration}" is not positive; assuming 1 day.`,
    });
  }
  const requestedDays = resolveRequestedDays(rawDuration);
  const dailyHours = resolveDailyHours(input.dailyAvailableHours);

  const ordered = orderDestinations(input.startingLocation, input.destinations);
  const orderedIds = ordered.map((destination) => destination.id);

  const stops = buildStops(ordered);
  const { days: packedDays, overflowDays } = packDays(
    stops,
    requestedDays,
    dailyHours
  );

  const usedDays = packedDays.length;
  if (overflowDays > 0) {
    warnings.push({
      code: "exceeds-duration",
      message: `The requested ${requestedDays}-day itinerary could not fit all ${stops.length} stops; ${overflowDays} additional day(s) were needed.`,
    });
  }

  const itineraryDays = finalizeDays(packedDays, dailyHours).map((day) => {
    const stopsInDay = day.stops;
    const segments = buildDaySegments(input.startingLocation, stopsInDay);
    return { ...day, travelSegments: segments };
  });

  for (const day of itineraryDays) {
    if (day.overCapacity) {
      const single = day.stops.find(
        (stop) => (stop.visitHours ?? UNKNOWN_ACTIVITY_HOURS) > day.availableHours
      );
      const name = single ? single.destination.name : "a stop";
      warnings.push({
        code: "exceeds-daily-time",
        message: `Day ${day.dayNumber}: "${name}" needs more hours than the ${day.availableHours}-hour daily limit.`,
      });
    }
  }

  const unknownCostCount = itineraryDays.reduce(
    (sum, day) => sum + day.cost.unknownCount,
    0
  );
  if (unknownCostCount > 0) {
    warnings.push({
      code: "unknown-cost",
      message: `${unknownCostCount} of ${stops.length} stops have no estimated cost.`,
    });
  }

  const unknownDurationCount = itineraryDays.reduce(
    (sum, day) => sum + day.unknownDurationCount,
    0
  );
  if (unknownDurationCount > 0) {
    warnings.push({
      code: "unknown-visit-duration",
      message: `Visit duration is not recorded for ${unknownDurationCount} of ${stops.length} stops.`,
    });
  }

  const allSegments = itineraryDays.flatMap((day) => day.travelSegments);
  const unknownDistanceSegments = allSegments.filter(
    (segment) => segment.distanceType === "unknown"
  ).length;
  if (unknownDistanceSegments > 0) {
    warnings.push({
      code: "unknown-travel-distance",
      message: `Travel distance could not be computed for ${unknownDistanceSegments} segment(s); coordinates are missing for one or both endpoints.`,
    });
  }

  if (
    allSegments.length > 0 &&
    allSegments.some((segment) => segment.travelTimeUnknown)
  ) {
    warnings.push({
      code: "unknown-travel-time",
      message:
        "Travel time is not recorded for any segment; travel times are unknown (Haversine distances are straight-line estimates, not road times).",
    });
  }

  const cost = summarizeCost(input.budget, itineraryDays);

  return {
    requestedDays,
    usedDays,
    dailyAvailableHours: dailyHours,
    totalStops: stops.length,
    orderedDestinationIds: orderedIds,
    days: itineraryDays,
    cost,
    warnings,
  };
}

function summarizeCost(
  budget: number | null | undefined,
  days: Itinerary["days"]
): ItineraryCostSummary {
  const knownSubtotal = days.reduce(
    (sum, day) => sum + day.cost.knownSubtotal,
    0
  );
  const unknownCount = days.reduce((sum, day) => sum + day.cost.unknownCount, 0);

  let budgetStatus: BudgetStatus;
  if (budget == null) {
    budgetStatus = "no-budget";
  } else if (unknownCount > 0) {
    budgetStatus = "unknown-costs";
  } else {
    budgetStatus = knownSubtotal <= budget ? "within-budget" : "exceeds-budget";
  }

  return {
    knownSubtotal,
    unknownCount,
    estimatedTotal: unknownCount === 0 ? knownSubtotal : null,
    budgetStatus,
  };
}