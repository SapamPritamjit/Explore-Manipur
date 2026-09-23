import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TripPlanRecommendation {
  candidate: {
    id: string;
    name: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    tags: string[];
    imageUrl: string | null;
    estimatedVisitDuration: string | null;
    cost: number | null;
    category: string;
    sourceName: string | null;
    sourceUrl: string | null;
  };
  score: number;
  explanation: string | string[];
  matchedInterests?: string[];
  breakdown?: {
    matchedInterests?: string[];
    [key: string]: unknown;
  };
  selected: boolean;
}

export interface TripPlanResponse {
  request: Record<string, unknown>;
  recommendations: TripPlanRecommendation[];
  itinerary: Record<string, unknown>;
  costSummary: Record<string, unknown>;
  warnings: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
}

export function normalizeTripPlan(plan: TripPlanResponse | null): TripPlanResponse | null {
  if (!plan) return null;
  const recommendations = Array.isArray(plan.recommendations)
    ? plan.recommendations.map((rec) => ({
        ...rec,
        matchedInterests: Array.isArray(rec.matchedInterests)
          ? rec.matchedInterests
          : Array.isArray(rec.breakdown?.matchedInterests)
            ? rec.breakdown.matchedInterests
            : [],
        explanation: rec.explanation ?? "",
        candidate: {
          ...rec.candidate,
          tags: Array.isArray(rec.candidate?.tags) ? rec.candidate.tags : [],
        },
      }))
    : [];
  return {
    ...plan,
    recommendations,
    warnings: Array.isArray(plan.warnings) ? plan.warnings : [],
  };
}

interface TripState {
  tripPlan: TripPlanResponse | null;
  selectedDestinationIds: string[];
  setTripPlan: (plan: TripPlanResponse) => void;
  toggleDestination: (id: string) => void;
  clearTripPlan: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      tripPlan: null,
      selectedDestinationIds: [],
      setTripPlan: (plan) => set({ tripPlan: normalizeTripPlan(plan) }),
      toggleDestination: (id) =>
        set((state) => {
          const exists = state.selectedDestinationIds.includes(id);
          return {
            selectedDestinationIds: exists
              ? state.selectedDestinationIds.filter((did) => did !== id)
              : [...state.selectedDestinationIds, id],
          };
        }),
      clearTripPlan: () => set({ tripPlan: null, selectedDestinationIds: [] }),
    }),
    {
      name: "explore-manipur-trip",
      onRehydrateStorage: () => (state) => {
        if (state?.tripPlan) {
          state.tripPlan = normalizeTripPlan(state.tripPlan);
        }
      },
    }
  )
);
