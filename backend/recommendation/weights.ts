export const SCORE_WEIGHTS = {
  interest: 0.4,
  budget: 0.2,
  geographic: 0.2,
  time: 0.2,
} as const;

export const MAX_SCORE = 100;
export const NEUTRAL_SCORE = 50;
export const GEO_MAX_DISTANCE_KM = 300;
export const DAY_HOURS_PER_DAY = 8;

export function overallScore(components: {
  interest: number;
  budget: number;
  geographic: number;
  time: number;
}): number {
  return (
    components.interest * SCORE_WEIGHTS.interest +
    components.budget * SCORE_WEIGHTS.budget +
    components.geographic * SCORE_WEIGHTS.geographic +
    components.time * SCORE_WEIGHTS.time
  );
}

export function validateWeights(): boolean {
  const total =
    SCORE_WEIGHTS.interest +
    SCORE_WEIGHTS.budget +
    SCORE_WEIGHTS.geographic +
    SCORE_WEIGHTS.time;
  return Math.abs(total - 1) < 1e-9;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(MAX_SCORE, value));
}