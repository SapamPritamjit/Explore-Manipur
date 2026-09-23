export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TourismCandidate {
  id: string;
  name: string;
  category: string;
  tags: string[];
  district?: string | null;
  coordinates?: Coordinates | null;
  distanceFromImphal?: number | null;
  estimatedCost?: number | null;
  estimatedVisitDuration?: string | null;
  bestTime?: string | null;
}

export interface RecommendationInput {
  durationDays: number;
  budget?: number | null;
  interests?: string[];
  startingLocation?: { label: string; coordinates?: Coordinates | null } | null;
  preferredDistricts?: string[];
  preferredCategories?: string[];
}

export type BudgetStatus =
  | "affordable"
  | "over-budget"
  | "unknown-cost"
  | "no-budget-specified";

export type DistanceKind = "haversine" | "imphal-estimate" | "unknown";

export interface ScoringBreakdown {
  interest: number;
  budget: number;
  geographic: number;
  time: number;
  matchedInterests: string[];
  matchedTags: string[];
  costKnown: boolean;
  budgetStatus: BudgetStatus;
  distanceKm: number | null;
  distanceKind: DistanceKind;
  visitHours: number | null;
  availableHours: number;
  timeKnown: boolean;
}

export interface RecommendationResult {
  candidate: TourismCandidate;
  score: number;
  breakdown: ScoringBreakdown;
  explanation: string[];
}