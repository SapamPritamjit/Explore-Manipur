import {
  listAccommodation,
  listDestinations,
  listEvents,
  listExperiences,
  listFood,
  listTransport,
} from "@/backend/data";
import { validateAssistantRequest } from "./validate";
import { retrieveTourismData } from "./retrieve";
import type { RetrievedTourismItem } from "./retrieve";
import { generateGroundedAnswer } from "./ground";
import type {
  AssistantDataset,
  AssistantMode,
  AssistantRequestInput,
  AssistantResult,
  AssistantResponse,
  SourceReference,
  TourismTable,
} from "./types";

const HELP_MESSAGE = [
  "Hi! I am the Explore Manipur tourism assistant. I answer only from the",
  "verified tourism database - destinations, food, experiences, accommodation,",
  "events and inter-place travel routes.",
  "",
  "Try asking:",
  "- \"Which nature spots are near Imphal?\"",
  "- \"Tell me about Loktak Lake.\"",
  "- \"What festivals happen in Manipur?\"",
  "- \"Where can I stay in Imphal?\"",
  "- \"What traditional dishes should I try?\"",
].join("\n");

const NO_INFO_MESSAGE = [
  "I could not find anything about that in the current Manipur tourism dataset.",
  "I can only answer from verified tourism records (destinations, food, experiences,",
  "accommodation, events and travel routes), and I will not invent information.",
  "",
  "Try rephrasing with a place name, an activity, a district, a dish, or a festival.",
].join("\n");

const FALLBACK_PREFIX =
  "The AI model is temporarily unavailable, so here is a plain summary taken " +
  "directly from the tourism database:";

const FALLBACK_LIMIT = 5;

function sourcesFrom(items: readonly RetrievedTourismItem[]): SourceReference[] {
  const seen = new Set<string>();
  const sources: SourceReference[] = [];
  for (const item of items) {
    const key = `${item.table}:${item.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    sources.push({
      table: item.table,
      name: item.name,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
    });
  }
  return sources;
}

function usedTablesFrom(items: readonly RetrievedTourismItem[]): TourismTable[] {
  const tables = new Set<TourismTable>();
  for (const item of items) {
    tables.add(item.table);
  }
  return [...tables] as TourismTable[];
}

function shorten(detail: string, maxLength: number): string {
  if (detail.length <= maxLength) {
    return detail;
  }
  const cut = detail.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const end = lastSpace > 0 ? lastSpace : cut.length;
  return `${cut.slice(0, end)}…`;
}

function fallbackAnswer(items: readonly RetrievedTourismItem[]): string {
  const bullets = items.slice(0, FALLBACK_LIMIT).map(
    (item) => `- **${item.name}** — ${shorten(item.detail, 160)}`
  );
  return [FALLBACK_PREFIX, "", ...bullets].join("\n");
}

function buildResponse(
  answer: string,
  items: readonly RetrievedTourismItem[],
  mode: AssistantMode
): AssistantResponse {
  return {
    answer,
    sources: sourcesFrom(items),
    grounded: mode !== "help",
    mode,
    usedTables: usedTablesFrom(items),
  };
}

export async function runAssistant(
  input: AssistantRequestInput
): Promise<AssistantResult> {
  const outcome = validateAssistantRequest(input);
  if (outcome.kind === "invalid") {
    return { ok: false, kind: "validation", issues: outcome.issues };
  }
  const request = outcome.request;

  let dataset: AssistantDataset;
  try {
    const [destinations, food, experiences, accommodation, events, transport] =
      await Promise.all([
        listDestinations(),
        listFood(),
        listExperiences(),
        listAccommodation(),
        listEvents(),
        listTransport(),
      ]);
    dataset = { destinations, food, experiences, accommodation, events, transport };
  } catch (error) {
    return {
      ok: false,
      kind: "data",
      error: {
        code: "data-error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load tourism data for the assistant.",
      },
    };
  }

  const retrieval = retrieveTourismData(request.message, dataset);

  if (retrieval.isGreeting) {
    return { ok: true, response: buildResponse(HELP_MESSAGE, [], "help") };
  }

  if (retrieval.items.length === 0) {
    return { ok: true, response: buildResponse(NO_INFO_MESSAGE, [], "no-info") };
  }

  try {
    const generated = await generateGroundedAnswer({
      question: request.message,
      items: retrieval.items,
      tripContext: request.tripContext,
    });
    return {
      ok: true,
      response: buildResponse(generated.answer, retrieval.items, "grounded-llm"),
    };
  } catch {
    return {
      ok: true,
      response: buildResponse(
        fallbackAnswer(retrieval.items),
        retrieval.items,
        "grounded-fallback"
      ),
    };
  }
}