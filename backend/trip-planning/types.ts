import type {
  Coordinates,
  RecommendationResult,
  ScoringBreakdown,
  TourismCandidate,
} from "@/backend/recommendation";
import type { Itinerary, ItineraryCostSummary } from "@/backend/itinerary";

export interface TripPlanRequestInput {
  tripDurationDays?: unknown;
  budget?: unknown;
  interests?: unknown;
  startingLocation?: unknown;
  startingLatitude?: unknown;
  startingLongitude?: unknown;
  dailyAvailableHours?: unknown;
  district?: unknown;
  category?: unknown;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface NormalizedTripPlanRequest {
  durationDays: number;
  budget: number | null;
  interests: string[];
  startingLocation: { label: string; coordinates: Coordinates | null } | null;
  dailyAvailableHours: number | null;
  district: string | null;
  category: string | null;
}

export type StartingLocationSource =
  | "provided-coordinates"
  | "imphal-label-fallback"
  | "label-only";

export interface TripPlanRecommendation extends RecommendationResult {
  selected: boolean;
}

export interface TripPlanWarning {
  code: string;
  message: string;
  source: "planning" | "itinerary";
}

export interface MissingDataCounts {
  withoutCoordinates: number;
  withoutCost: number;
  withoutVisitDuration: number;
}

export interface TripPlanMetadata {
  loadedDestinationCount: number;
  candidateCount: number;
  selectedDestinationCount: number;
  missing: MissingDataCounts;
  startingLocation: {
    label: string;
    coordinates: Coordinates | null;
    source: StartingLocationSource;
  } | null;
}

export interface TripPlanResponse {
  request: NormalizedTripPlanRequest;
  recommendations: TripPlanRecommendation[];
  itinerary: Itinerary;
  costSummary: ItineraryCostSummary;
  warnings: TripPlanWarning[];
  metadata: TripPlanMetadata;
}

export type TripPlanResult =
  | { ok: true; response: TripPlanResponse }
  | { ok: false; issues: ValidationIssue[] };

export type { Coordinates, Itinerary, ScoringBreakdown, TourismCandidate };