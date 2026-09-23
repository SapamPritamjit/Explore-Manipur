import { DAY_HOURS_PER_DAY, MAX_SCORE, NEUTRAL_SCORE } from "./weights";

export function parseVisitHours(raw: string | null | undefined): number | null {
  if (!raw) {
    return null;
  }
  const lower = raw.toLowerCase().trim();
  if (!lower) {
    return null;
  }

  const bestNumber = (pattern: RegExp): number[] =>
    Array.from(lower.matchAll(pattern), (match) => parseFloat(match[1])).filter(
      (value) => !Number.isNaN(value)
    );

  const minutes = Math.max(0, ...bestNumber(/(\d+(?:\.\d+)?)\s*(?:min|minute)/g));
  if (minutes > 0) {
    return Math.round((minutes / 60) * 10) / 10;
  }

  const hours = Math.max(0, ...bestNumber(/(\d+(?:\.\d+)?)\s*(?:hr|hour|hours)/g));
  if (hours > 0) {
    return hours;
  }

  const days = Math.max(0, ...bestNumber(/(\d+(?:\.\d+)?)\s*(?:day|days)/g));
  if (days > 0) {
    return Math.round(days * DAY_HOURS_PER_DAY * 10) / 10;
  }

  if (/half\s*(?:a\s*)?day/.test(lower)) {
    return DAY_HOURS_PER_DAY / 2;
  }

  return null;
}

export interface TimeFitResult {
  score: number;
  visitHours: number | null;
  availableHours: number;
  timeKnown: boolean;
}

export function scoreTimeFit(
  durationDays: number,
  estimatedVisitDuration: string | null | undefined
): TimeFitResult {
  const availableHours = durationDays > 0 ? durationDays * DAY_HOURS_PER_DAY : 0;
  const visitHours = parseVisitHours(estimatedVisitDuration);

  if (visitHours == null || visitHours <= 0) {
    return {
      score: NEUTRAL_SCORE,
      visitHours: null,
      availableHours,
      timeKnown: false,
    };
  }

  const score = Math.max(
    0,
    Math.min(MAX_SCORE, (availableHours / visitHours) * MAX_SCORE)
  );

  return {
    score,
    visitHours,
    availableHours,
    timeKnown: true,
  };
}