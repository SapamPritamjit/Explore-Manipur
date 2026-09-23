import type { Coordinates } from "@/backend/recommendation";
import { isValidDateString } from "./dates";
import type {
  ValidationIssue,
  WeatherRequestInput,
  WeatherRequestValidation,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function stringArray(value: unknown, issues: ValidationIssue[]): string[] {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    issues.push({
      field: "destinationIds",
      message: "destinationIds must be an array of strings when provided.",
    });
    return [];
  }
  return (value as string[])
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function validateWeatherRequest(
  input: WeatherRequestInput
): WeatherRequestValidation {
  const issues: ValidationIssue[] = [];

  const destinationIds = stringArray(input.destinationIds, issues);

  let coordinates: Coordinates | null = null;
  if (input.coordinates != null) {
    if (!isRecord(input.coordinates)) {
      issues.push({
        field: "coordinates",
        message: "coordinates must be an object with latitude and longitude.",
      });
    } else {
      const { latitude, longitude } = input.coordinates;
      const latitudeOk =
        isFiniteNumber(latitude) && latitude >= -90 && latitude <= 90;
      const longitudeOk =
        isFiniteNumber(longitude) && longitude >= -180 && longitude <= 180;

      if (!latitudeOk) {
        issues.push({
          field: "coordinates.latitude",
          message: "coordinates.latitude must be a number between -90 and 90.",
        });
      }
      if (!longitudeOk) {
        issues.push({
          field: "coordinates.longitude",
          message: "coordinates.longitude must be a number between -180 and 180.",
        });
      }
      if (latitudeOk && longitudeOk) {
        coordinates = {
          latitude: latitude as number,
          longitude: longitude as number,
        };
      }
    }
  }

  let label: string | null = null;
  if (input.label != null) {
    if (typeof input.label !== "string" || input.label.trim().length === 0) {
      issues.push({
        field: "label",
        message: "label must be a non-empty string when provided.",
      });
    } else {
      label = input.label.trim();
    }
  }

  let startDate: string | null = null;
  if (input.startDate != null) {
    if (typeof input.startDate !== "string" || input.startDate.trim().length === 0) {
      issues.push({
        field: "startDate",
        message: "startDate must be a date string (YYYY-MM-DD) when provided.",
      });
    } else {
      const trimmed = input.startDate.trim();
      if (!isValidDateString(trimmed)) {
        issues.push({
          field: "startDate",
          message: "startDate must be a valid date in YYYY-MM-DD format.",
        });
      } else {
        startDate = trimmed;
      }
    }
  }

  let days = 3;
  if (input.days != null) {
    if (
      !isFiniteNumber(input.days) ||
      !Number.isInteger(input.days) ||
      input.days < 1 ||
      input.days > 7
    ) {
      issues.push({
        field: "days",
        message: "days must be an integer between 1 and 7 when provided.",
      });
    } else {
      days = input.days;
    }
  }

  if (coordinates === null && destinationIds.length === 0) {
    issues.push({
      field: "destinationIds",
      message: "At least one of destinationIds or coordinates must be provided.",
    });
  }

  if (issues.length > 0) {
    return { kind: "invalid", issues };
  }

  return {
    kind: "valid",
    request: {
      destinationIds,
      coordinates,
      label,
      startDate,
      days,
      timezone: "Asia/Kolkata",
    },
  };
}