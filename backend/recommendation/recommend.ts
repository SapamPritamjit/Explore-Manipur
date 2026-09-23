import { overallScore } from "./weights";
import { scoreInterest } from "./interest";
import { scoreBudget } from "./budget";
import { scoreGeography } from "./geography";
import { scoreTimeFit } from "./timefit";
import { normalizeTerm, toRupees } from "./text";
import type {
  RecommendationInput,
  RecommendationResult,
  TourismCandidate,
} from "./types";

function applyFilters(
  input: RecommendationInput,
  candidates: readonly TourismCandidate[]
): TourismCandidate[] {
  let result = [...candidates];

  const districts = (input.preferredDistricts ?? [])
    .map(normalizeTerm)
    .filter((value) => value.length > 0);
  if (districts.length > 0) {
    result = result.filter((candidate) => {
      const candidateDistrict = normalizeTerm(candidate.district ?? "");
      return candidateDistrict.length > 0 && districts.includes(candidateDistrict);
    });
  }

  const categories = (input.preferredCategories ?? [])
    .map(normalizeTerm)
    .filter((value) => value.length > 0);
  if (categories.length > 0) {
    result = result.filter((candidate) =>
      categories.includes(normalizeTerm(candidate.category))
    );
  }

  return result;
}

function buildExplanation(input: RecommendationInput, result: RecommendationResult): string[] {
  const { breakdown, score, candidate } = result;
  const lines: string[] = [];

  if (input.interests?.length) {
    lines.push(
      breakdown.matchedInterests.length > 0
        ? `Interests: matched ${breakdown.matchedInterests.length} of ${input.interests.length} (${breakdown.matchedInterests.join(", ")}).`
        : "Interests: none of your interests matched this destination."
    );
  } else {
    lines.push("Interests: no interests provided; all destinations scored neutrally.");
  }

  if (breakdown.budgetStatus === "affordable") {
    lines.push(`Budget: estimated cost Rs ${toRupees(candidate.estimatedCost as number)} is within your budget.`);
  } else if (breakdown.budgetStatus === "over-budget") {
    lines.push(`Budget: estimated cost Rs ${toRupees(candidate.estimatedCost as number)} exceeds your budget.`);
  } else if (breakdown.budgetStatus === "unknown-cost") {
    lines.push("Budget: cost is not recorded; affordability was not assessed.");
  } else {
    lines.push("Budget: no budget was specified; affordability was not assessed.");
  }

  if (breakdown.distanceKind === "haversine") {
    lines.push(`Distance: about ${toRupees(breakdown.distanceKm as number)} km from your start point.`);
  } else if (breakdown.distanceKind === "imphal-estimate") {
    lines.push(`Distance: about ${toRupees(breakdown.distanceKm as number)} km from Imphal (estimated).`);
  } else {
    lines.push("Distance: travel distance is unavailable; scored neutrally.");
  }

  if (breakdown.timeKnown) {
    lines.push(
      `Time: needs about ${breakdown.visitHours} hours; your trip has about ${breakdown.availableHours} active hours.`
    );
  } else {
    lines.push("Time: visit duration is not recorded; scored neutrally.");
  }

  lines.push(`Overall score: ${score.toFixed(1)} / 100.`);
  return lines;
}

function scoreCandidate(
  input: RecommendationInput,
  candidate: TourismCandidate
): RecommendationResult {
  const interests = input.interests ?? [];
  const interest = scoreInterest(interests, candidate.category, candidate.tags);

  const budget = scoreBudget(input.budget, candidate.estimatedCost);

  const geography = scoreGeography(input.startingLocation, {
    coordinates: candidate.coordinates ?? null,
    distanceFromImphal: candidate.distanceFromImphal ?? null,
  });

  const time = scoreTimeFit(input.durationDays, candidate.estimatedVisitDuration);

  const components = {
    interest: interest.score,
    budget: budget.score,
    geographic: geography.score,
    time: time.score,
  };

  const result: RecommendationResult = {
    candidate,
    score: overallScore(components),
    breakdown: {
      ...components,
      matchedInterests: interest.matchedInterests,
      matchedTags: interest.matchedTags,
      costKnown: budget.costKnown,
      budgetStatus: budget.budgetStatus,
      distanceKm: geography.distanceKm,
      distanceKind: geography.distanceKind,
      visitHours: time.visitHours,
      availableHours: time.availableHours,
      timeKnown: time.timeKnown,
    },
    explanation: [],
  };

  result.explanation = buildExplanation(input, result);
  return result;
}

export function recommend(
  input: RecommendationInput,
  candidates: readonly TourismCandidate[]
): RecommendationResult[] {
  const filtered = applyFilters(input, candidates);

  const results = filtered.map((candidate) => scoreCandidate(input, candidate));

  results.sort(
    (a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name)
  );

  return results;
}