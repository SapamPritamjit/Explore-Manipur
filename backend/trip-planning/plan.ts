import { buildItinerary, DEFAULT_DAILY_HOURS, UNKNOWN_ACTIVITY_HOURS } from "@/backend/itinerary";
import type { Itinerary } from "@/backend/itinerary";
import { isImphalLabel, parseVisitHours, recommend } from "@/backend/recommendation";
import type { RecommendationResult, TourismCandidate } from "@/backend/recommendation";
import { listDestinations, toTourismCandidates } from "@/backend/data";
import { validateTripPlanRequest } from "./validate";
import type {
  MissingDataCounts,
  NormalizedTripPlanRequest,
  StartingLocationSource,
  TripPlanRecommendation,
  TripPlanRequestInput,
  TripPlanResult,
  TripPlanResponse,
  TripPlanWarning,
} from "./types";

function estimateVisitHours(candidate: TourismCandidate): number {
  return parseVisitHours(candidate.estimatedVisitDuration) ?? UNKNOWN_ACTIVITY_HOURS;
}

function buildItineraryForSelection(
  selection: readonly TourismCandidate[],
  request: NormalizedTripPlanRequest
): Itinerary {
  return buildItinerary({
    durationDays: request.durationDays,
    destinations: [...selection],
    startingLocation: request.startingLocation,
    budget: request.budget,
    dailyAvailableHours: request.dailyAvailableHours,
  });
}

function exceedsRequestedDuration(itinerary: Itinerary): boolean {
  return itinerary.warnings.some((warning) => warning.code === "exceeds-duration");
}

export interface DestinationSelection {
  selection: TourismCandidate[];
  itinerary: Itinerary;
  trimmed: boolean;
}

export function selectDestinationsForTrip(
  recommendations: readonly RecommendationResult[],
  request: NormalizedTripPlanRequest
): DestinationSelection {
  const dailyHours =
    request.dailyAvailableHours !== null
      ? request.dailyAvailableHours
      : DEFAULT_DAILY_HOURS;
  const totalCapacity = dailyHours * request.durationDays;

  const candidates: TourismCandidate[] = [];
  let usedHours = 0;
  for (const result of recommendations) {
    const hours = estimateVisitHours(result.candidate);
    if (candidates.length === 0) {
      candidates.push(result.candidate);
      usedHours += hours;
      continue;
    }
    if (usedHours + hours <= totalCapacity + 1e-9) {
      candidates.push(result.candidate);
      usedHours += hours;
      continue;
    }
    break;
  }

  let selection = candidates;
  let itinerary = buildItineraryForSelection(selection, request);
  while (exceedsRequestedDuration(itinerary) && selection.length > 1) {
    selection = selection.slice(0, -1);
    itinerary = buildItineraryForSelection(selection, request);
  }

  return { selection, itinerary, trimmed: selection.length < recommendations.length };
}

function countMissing(candidates: readonly TourismCandidate[]): MissingDataCounts {
  let withoutCoordinates = 0;
  let withoutCost = 0;
  let withoutVisitDuration = 0;

  for (const candidate of candidates) {
    if (!candidate.coordinates) {
      withoutCoordinates += 1;
    }
    if (
      candidate.estimatedCost == null ||
      !Number.isFinite(candidate.estimatedCost)
    ) {
      withoutCost += 1;
    }
    if (parseVisitHours(candidate.estimatedVisitDuration) == null) {
      withoutVisitDuration += 1;
    }
  }

  return { withoutCoordinates, withoutCost, withoutVisitDuration };
}

function startingLocationSource(
  request: NormalizedTripPlanRequest
): StartingLocationSource {
  if (!request.startingLocation) {
    return "label-only";
  }
  if (request.startingLocation.coordinates) {
    return "provided-coordinates";
  }
  if (isImphalLabel(request.startingLocation.label)) {
    return "imphal-label-fallback";
  }
  return "label-only";
}

function buildPlanningWarnings(
  request: NormalizedTripPlanRequest,
  loadedCount: number,
  candidateCount: number,
  selectionTrimmed: boolean
): TripPlanWarning[] {
  const warnings: TripPlanWarning[] = [];

  if (loadedCount === 0) {
    warnings.push({
      code: "no-destinations-found",
      message: "The destination database returned no destinations.",
      source: "planning",
    });
  } else if (candidateCount === 0) {
    warnings.push({
      code: "no-recommendations",
      message:
        "No destinations matched the requested filters; the itinerary is empty.",
      source: "planning",
    });
  }

  if (!request.startingLocation?.coordinates) {
    warnings.push({
      code: "starting-coordinates-unavailable",
      message:
        "No exact starting coordinates were provided; distance scoring and route distance fall back to Imphal estimates where available.",
      source: "planning",
    });
  }

  if (selectionTrimmed && candidateCount > 1) {
    warnings.push({
      code: "destination-selection-trimmed",
      message:
        "Some recommended destinations were excluded from the itinerary so it fits within the requested trip duration.",
      source: "planning",
    });
  }

  return warnings;
}

export async function planTrip(input: TripPlanRequestInput): Promise<TripPlanResult> {
  const outcome = validateTripPlanRequest(input);
  if (outcome.kind === "invalid") {
    return { ok: false, issues: outcome.issues };
  }
  const request = outcome.request;

  const destinations = await listDestinations();
  const pool = toTourismCandidates(destinations);

  const results = recommend(
    {
      durationDays: request.durationDays,
      budget: request.budget,
      interests: request.interests,
      startingLocation: request.startingLocation,
      preferredDistricts: request.district ? [request.district] : undefined,
      preferredCategories: request.category ? [request.category] : undefined,
    },
    pool
  );

  const { selection, itinerary, trimmed } = selectDestinationsForTrip(
    results,
    request
  );

  const selectedIds = new Set(selection.map((candidate) => candidate.id));

  const recommendations: TripPlanRecommendation[] = results.map((result) => ({
    ...result,
    selected: selectedIds.has(result.candidate.id),
  }));

  const planningWarnings = buildPlanningWarnings(
    request,
    pool.length,
    results.length,
    trimmed
  );

  const itineraryWarnings: TripPlanWarning[] = itinerary.warnings.map((warning) => ({
    code: warning.code,
    message: warning.message,
    source: "itinerary",
  }));

  const response: TripPlanResponse = {
    request,
    recommendations,
    itinerary,
    costSummary: itinerary.cost,
    warnings: [...planningWarnings, ...itineraryWarnings],
    metadata: {
      loadedDestinationCount: pool.length,
      candidateCount: results.length,
      selectedDestinationCount: selection.length,
      missing: countMissing(pool),
      startingLocation: request.startingLocation
        ? {
            label: request.startingLocation.label,
            coordinates: request.startingLocation.coordinates,
            source: startingLocationSource(request),
          }
        : null,
    },
  };

  return { ok: true, response };
}