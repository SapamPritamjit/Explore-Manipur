import type {
  Coordinates,
  DistanceKind,
  TourismCandidate,
} from "../recommendation";

export type ItineraryWarningCode =
  | "invalid-duration"
  | "exceeds-duration"
  | "exceeds-daily-time"
  | "unknown-cost"
  | "unknown-visit-duration"
  | "unknown-travel-time"
  | "unknown-travel-distance";

export interface ItineraryWarning {
  code: ItineraryWarningCode;
  message: string;
}

export interface ItineraryInput {
  durationDays: number;
  destinations: TourismCandidate[];
  startingLocation?: { label: string; coordinates?: Coordinates | null } | null;
  budget?: number | null;
  dailyAvailableHours?: number | null;
}

export interface ItineraryStop {
  destination: TourismCandidate;
  visitHours: number | null;
  visitDurationUnknown: boolean;
  costKnown: boolean;
  estimatedCost: number | null;
}

export interface TravelSegment {
  from: string;
  to: string;
  distanceKm: number | null;
  distanceType: DistanceKind;
  travelTime: string | null;
  travelTimeUnknown: boolean;
}

export interface DayCost {
  knownSubtotal: number;
  unknownCount: number;
}

export interface ItineraryDay {
  dayNumber: number;
  stops: ItineraryStop[];
  travelSegments: TravelSegment[];
  availableHours: number;
  scheduledHours: number;
  usedKnownHours: number;
  unknownDurationCount: number;
  overCapacity: boolean;
  cost: DayCost;
}

export type BudgetStatus =
  | "within-budget"
  | "exceeds-budget"
  | "unknown-costs"
  | "no-budget";

export interface ItineraryCostSummary {
  knownSubtotal: number;
  unknownCount: number;
  estimatedTotal: number | null;
  budgetStatus: BudgetStatus;
}

export interface Itinerary {
  requestedDays: number;
  usedDays: number;
  dailyAvailableHours: number;
  totalStops: number;
  orderedDestinationIds: string[];
  days: ItineraryDay[];
  cost: ItineraryCostSummary;
  warnings: ItineraryWarning[];
}