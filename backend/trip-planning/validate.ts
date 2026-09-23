import type { Coordinates } from "./types";
import type {
  NormalizedTripPlanRequest,
  TripPlanRequestInput,
  ValidationIssue,
} from "./types";

export type TripPlanValidationOutcome =
  | { kind: "valid"; request: NormalizedTripPlanRequest }
  | { kind: "invalid"; issues: ValidationIssue[] };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function stringList(value: unknown, field: string, issues: ValidationIssue[]): string[] {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value)) {
    issues.push({ field, message: `${field} must be an array of strings when provided.` });
    return [];
  }
  if (value.some((entry) => !isString(entry))) {
    issues.push({ field, message: `${field} must be an array of strings.` });
    return [];
  }
  return (value as string[])
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function optionalString(
  value: unknown,
  field: string,
  issues: ValidationIssue[]
): string | null {
  if (value == null) {
    return null;
  }
  if (!isString(value) || value.trim().length === 0) {
    issues.push({ field, message: `${field} must be a non-empty string when provided.` });
    return null;
  }
  return value.trim();
}

export function validateTripPlanRequest(
  input: TripPlanRequestInput
): TripPlanValidationOutcome {
  const issues: ValidationIssue[] = [];

  const durationDays = input.tripDurationDays;
  if (!isFiniteNumber(durationDays) || durationDays < 1) {
    issues.push({
      field: "tripDurationDays",
      message: "tripDurationDays must be a number >= 1.",
    });
  }

  let budget: number | null = null;
  if (input.budget != null) {
    if (!isFiniteNumber(input.budget) || input.budget < 0) {
      issues.push({
        field: "budget",
        message: "budget must be a non-negative number when provided.",
      });
    } else {
      budget = input.budget;
    }
  }

  const interests = stringList(input.interests, "interests", issues);

  let label = "";
  if (input.startingLocation != null) {
    if (!isString(input.startingLocation)) {
      issues.push({
        field: "startingLocation",
        message: "startingLocation must be a string when provided.",
      });
    } else {
      label = input.startingLocation.trim();
    }
  }

  let coordinates: Coordinates | null = null;
  const latitudeProvided = input.startingLatitude != null;
  const longitudeProvided = input.startingLongitude != null;

  if (latitudeProvided !== longitudeProvided) {
    issues.push({
      field: "startingLatitude",
      message:
        "startingLatitude and startingLongitude must both be provided, or both omitted.",
    });
  } else if (latitudeProvided && longitudeProvided) {
    const latitudeInRange =
      isFiniteNumber(input.startingLatitude) &&
      input.startingLatitude >= -90 &&
      input.startingLatitude <= 90;
    const longitudeInRange =
      isFiniteNumber(input.startingLongitude) &&
      input.startingLongitude >= -180 &&
      input.startingLongitude <= 180;

    if (!latitudeInRange) {
      issues.push({
        field: "startingLatitude",
        message: "startingLatitude must be a number between -90 and 90 when provided.",
      });
    }
    if (!longitudeInRange) {
      issues.push({
        field: "startingLongitude",
        message: "startingLongitude must be a number between -180 and 180 when provided.",
      });
    }
    if (latitudeInRange && longitudeInRange) {
      coordinates = {
        latitude: input.startingLatitude as number,
        longitude: input.startingLongitude as number,
      };
    }
  }

  let dailyAvailableHours: number | null = null;
  if (input.dailyAvailableHours != null) {
    if (!isFiniteNumber(input.dailyAvailableHours) || input.dailyAvailableHours <= 0) {
      issues.push({
        field: "dailyAvailableHours",
        message: "dailyAvailableHours must be a positive number when provided.",
      });
    } else {
      dailyAvailableHours = input.dailyAvailableHours;
    }
  }

  const district = optionalString(input.district, "district", issues);
  const category = optionalString(input.category, "category", issues);

  if (issues.length > 0) {
    return { kind: "invalid", issues };
  }

  return {
    kind: "valid",
    request: {
      durationDays: durationDays as number,
      budget,
      interests,
      startingLocation: label ? { label, coordinates } : null,
      dailyAvailableHours,
      district,
      category,
    },
  };
}