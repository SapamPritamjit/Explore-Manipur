import type {
  Accommodation,
  Destination,
  EventItem,
  Experience,
  Food,
  TransportRoute,
} from "@/backend/data";

export type TourismTable =
  | "destinations"
  | "food"
  | "experiences"
  | "accommodation"
  | "events"
  | "transport";

export interface AssistantDataset {
  readonly destinations: readonly Destination[];
  readonly food: readonly Food[];
  readonly experiences: readonly Experience[];
  readonly accommodation: readonly Accommodation[];
  readonly events: readonly EventItem[];
  readonly transport: readonly TransportRoute[];
}

export interface AssistantTripContext {
  destinations?: string[];
  interests?: string[];
  district?: string | null;
  category?: string | null;
}

export interface AssistantRequestInput {
  message?: unknown;
  tripContext?: unknown;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface NormalizedAssistantRequest {
  message: string;
  tripContext: {
    destinations: string[];
    interests: string[];
    district: string | null;
    category: string | null;
  };
}

export type AssistantRequestValidation =
  | { kind: "valid"; request: NormalizedAssistantRequest }
  | { kind: "invalid"; issues: ValidationIssue[] };

export interface SourceReference {
  table: TourismTable;
  name: string;
  sourceName: string | null;
  sourceUrl: string | null;
}

export type AssistantMode =
  | "grounded-llm"
  | "grounded-fallback"
  | "no-info"
  | "help";

export interface AssistantResponse {
  answer: string;
  sources: SourceReference[];
  grounded: boolean;
  mode: AssistantMode;
  usedTables: TourismTable[];
}

export type AssistantResult =
  | { ok: true; response: AssistantResponse }
  | { ok: false; kind: "validation"; issues: ValidationIssue[] }
  | { ok: false; kind: "data"; error: { code: string; message: string } };