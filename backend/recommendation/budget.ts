import { MAX_SCORE, NEUTRAL_SCORE } from "./weights";
import type { BudgetStatus } from "./types";

export interface BudgetResult {
  score: number;
  budgetStatus: BudgetStatus;
  costKnown: boolean;
}

export function scoreBudget(
  budget: number | null | undefined,
  estimatedCost: number | null | undefined
): BudgetResult {
  const hasBudget = typeof budget === "number" && !Number.isNaN(budget);
  const hasCost = typeof estimatedCost === "number" && !Number.isNaN(estimatedCost);

  if (!hasBudget) {
    return {
      score: NEUTRAL_SCORE,
      budgetStatus: "no-budget-specified",
      costKnown: hasCost,
    };
  }

  if (!hasCost) {
    return {
      score: NEUTRAL_SCORE,
      budgetStatus: "unknown-cost",
      costKnown: false,
    };
  }

  const cost = estimatedCost as number;
  const available = budget as number;

  if (cost <= available) {
    return {
      score: MAX_SCORE,
      budgetStatus: "affordable",
      costKnown: true,
    };
  }

  if (available <= 0) {
    return {
      score: 0,
      budgetStatus: "over-budget",
      costKnown: true,
    };
  }

  const score = Math.max(0, MAX_SCORE - ((cost - available) / available) * MAX_SCORE);

  return {
    score,
    budgetStatus: "over-budget",
    costKnown: true,
  };
}