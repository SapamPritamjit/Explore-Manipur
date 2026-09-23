import type {
  AssistantRequestInput,
  AssistantRequestValidation,
  ValidationIssue,
} from "./types";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown, field: string, issues: ValidationIssue[]): string[] {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value) || value.some((entry) => !isString(entry))) {
    issues.push({ field, message: `${field} must be an array of strings when provided.` });
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

export function validateAssistantRequest(
  input: AssistantRequestInput
): AssistantRequestValidation {
  const issues: ValidationIssue[] = [];

  if (!isString(input.message) || input.message.trim().length === 0) {
    issues.push({ field: "message", message: "message must be a non-empty string." });
  }
  const message = isString(input.message) ? input.message.trim() : "";

  let destinations: string[] = [];
  let interests: string[] = [];
  let district: string | null = null;
  let category: string | null = null;

  if (input.tripContext != null) {
    if (!isRecord(input.tripContext)) {
      issues.push({ field: "tripContext", message: "tripContext must be an object when provided." });
    } else {
      destinations = stringArray(input.tripContext.destinations, "tripContext.destinations", issues);
      interests = stringArray(input.tripContext.interests, "tripContext.interests", issues);
      district = optionalString(input.tripContext.district, "tripContext.district", issues);
      category = optionalString(input.tripContext.category, "tripContext.category", issues);
    }
  }

  if (issues.length > 0) {
    return { kind: "invalid", issues };
  }

  return {
    kind: "valid",
    request: {
      message,
      tripContext: { destinations, interests, district, category },
    },
  };
}