import {
  NEARBY_KINDS,
  type NearbyKind,
  type NearbyRequestInput,
  type NearbyRequestValidation,
  type ValidationIssue,
} from "./types";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateNearbyRequest(
  input: NearbyRequestInput
): NearbyRequestValidation {
  const issues: ValidationIssue[] = [];

  const latitudeValid =
    isFiniteNumber(input.latitude) && input.latitude >= -90 && input.latitude <= 90;
  if (!latitudeValid) {
    issues.push({
      field: "latitude",
      message: "latitude must be a number between -90 and 90.",
    });
  }

  const longitudeValid =
    isFiniteNumber(input.longitude) && input.longitude >= -180 && input.longitude <= 180;
  if (!longitudeValid) {
    issues.push({
      field: "longitude",
      message: "longitude must be a number between -180 and 180.",
    });
  }

  let radiusKm = 50;
  if (input.radiusKm != null) {
    if (
      !isFiniteNumber(input.radiusKm) ||
      input.radiusKm <= 0 ||
      input.radiusKm > 300
    ) {
      issues.push({
        field: "radiusKm",
        message: "radiusKm must be a number between 1 and 300 when provided.",
      });
    } else {
      radiusKm = input.radiusKm;
    }
  }

  let kinds: NearbyKind[] = [...NEARBY_KINDS];
  if (input.kinds != null) {
    const raw = input.kinds;
    if (
      !Array.isArray(raw) ||
      raw.some((entry) => typeof entry !== "string")
    ) {
      issues.push({
        field: "kinds",
        message: "kinds must be an array of strings when provided.",
      });
      kinds = [];
    } else {
      const entries = (raw as string[])
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      const valid: NearbyKind[] = [];
      for (const entry of entries) {
        if ((NEARBY_KINDS as readonly string[]).includes(entry)) {
          valid.push(entry as NearbyKind);
        } else {
          issues.push({
            field: "kinds",
            message: `unknown nearby kind "${entry}". Allowed: ${NEARBY_KINDS.join(", ")}.`,
          });
        }
      }
      if (valid.length > 0) {
        kinds = valid;
      }
    }
  }

  let limitPerKind = 10;
  if (input.limitPerKind != null) {
    if (
      !isFiniteNumber(input.limitPerKind) ||
      !Number.isInteger(input.limitPerKind) ||
      input.limitPerKind < 1 ||
      input.limitPerKind > 50
    ) {
      issues.push({
        field: "limitPerKind",
        message: "limitPerKind must be an integer between 1 and 50 when provided.",
      });
    } else {
      limitPerKind = input.limitPerKind;
    }
  }

  if (issues.length > 0) {
    return { kind: "invalid", issues };
  }

  return {
    kind: "valid",
    request: {
      center: {
        latitude: input.latitude as number,
        longitude: input.longitude as number,
      },
      radiusKm,
      kinds,
      limitPerKind,
    },
  };
}