import { normalizeTerm } from "@/backend/recommendation";
import type { AssistantDataset, TourismTable } from "./types";
import type {
  Accommodation,
  Destination,
  EventItem,
  Experience,
  Food,
  TransportRoute,
} from "@/backend/data";

export interface RetrievedTourismItem {
  table: TourismTable;
  id: string;
  name: string;
  detail: string;
  sourceName: string | null;
  sourceUrl: string | null;
}

export interface RetrievalResult {
  items: RetrievedTourismItem[];
  terms: string[];
  isGreeting: boolean;
}

export interface RetrievalOptions {
  limit?: number;
}

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "at", "to", "for", "and", "or",
  "is", "are", "was", "were", "be", "what", "which", "where", "when",
  "how", "who", "do", "does", "did", "can", "could", "would", "will",
  "you", "your", "tell", "me", "about", "please", "i", "im", "my",
  "there", "it", "this", "that", "we", "they", "them", "any", "some",
  "with", "from", "like", "want", "would", "should", "give", "info",
  "lot", "so", "much", "very", "really",
]);

const GREETING_TERMS = new Set([
  "hi", "hello", "hey", "namaste", "namaskar", "thanks", "thank",
  "bye", "goodbye", "yo", "hiya",
]);

function tokenize(value: string): string[] {
  return normalizeTerm(value)
    .split(" ")
    .filter((token) => token.length > 0);
}

function queryTerms(message: string): string[] {
  return tokenize(message).filter((token) => !STOPWORDS.has(token));
}

export function isGreeting(message: string): boolean {
  const terms = tokenize(message).filter((token) => !STOPWORDS.has(token));
  if (terms.length === 0) return false;
  return terms.every((term) => GREETING_TERMS.has(term));
}

interface IndexedRecord {
  table: TourismTable;
  id: string;
  name: string;
  nameTokens: Set<string>;
  facetTokens: Set<string>;
  tagTokens: Set<string>;
  fullTokens: Set<string>;
  detail: string;
  sourceName: string | null;
  sourceUrl: string | null;
}

const TABLE_ORDER: Record<TourismTable, number> = {
  destinations: 0,
  food: 1,
  experiences: 2,
  accommodation: 3,
  events: 4,
  transport: 5,
};

function index(
  table: TourismTable,
  id: string,
  name: string,
  className: string,
  facets: string,
  tags: readonly string[],
  fullBody: string,
  detail: string,
  sourceName: string | null,
  sourceUrl: string | null
): IndexedRecord {
  return {
    table,
    id,
    name,
    nameTokens: new Set(tokenize(name)),
    facetTokens: new Set(tokenize(`${className} ${facets}`)),
    tagTokens: new Set(tokenize(tags.join(" "))),
    fullTokens: new Set(tokenize(fullBody)),
    detail,
    sourceName,
    sourceUrl,
  };
}

function renderSource(sourceName: string | null, sourceUrl: string | null): string {
  const name = sourceName ?? "unlisted";
  const url = sourceUrl ? ` — ${sourceUrl}` : " (no URL in record)";
  return `Source: ${name}${url}`;
}

function renderDestination(row: Destination): string {
  const parts: string[] = [
    `${row.name} (${row.category}${row.district ? `, ${row.district}` : ""})`,
  ];
  if (row.description) parts.push(row.description);
  if (row.distanceFromImphal != null)
    parts.push(`Distance from Imphal: about ${row.distanceFromImphal} km (estimated)`);
  if (row.estimatedVisitDuration) parts.push(`Typical visit: ${row.estimatedVisitDuration}`);
  if (row.bestTime) parts.push(`Best time: ${row.bestTime}`);
  if (row.openingHours) parts.push(`Opening hours: ${row.openingHours}`);
  if (row.contact) parts.push(`Contact: ${row.contact}`);
  if (row.tags.length > 0) parts.push(`Tags: ${row.tags.join(", ")}`);
  parts.push(renderSource(row.sourceName, row.sourceUrl));
  return parts.join(". ");
}

function renderFood(row: Food): string {
  const parts: string[] = [row.name];
  if (row.cuisine) parts.push(row.cuisine);
  if (row.localDishes.length > 0) parts.push(`Popular dishes: ${row.localDishes.join(", ")}`);
  if (row.location) parts.push(`Location: ${row.location}`);
  if (row.district) parts.push(`District: ${row.district}`);
  if (row.priceRange) parts.push(`Price range: ${row.priceRange}`);
  if (row.openingHours) parts.push(`Opening hours: ${row.openingHours}`);
  if (row.tags.length > 0) parts.push(`Tags: ${row.tags.join(", ")}`);
  parts.push(renderSource(row.sourceName, row.sourceUrl));
  return parts.join(". ");
}

function renderExperience(row: Experience): string {
  const parts: string[] = [
    `${row.name} (${row.category}${row.district ? `, ${row.district}` : ""})`,
  ];
  if (row.description) parts.push(row.description);
  if (row.location) parts.push(`Location: ${row.location}`);
  if (row.duration) parts.push(`Duration: ${row.duration}`);
  if (row.estimatedCost != null) parts.push(`Estimated cost: Rs ${row.estimatedCost}`);
  if (row.bestTime) parts.push(`Best time: ${row.bestTime}`);
  if (row.difficulty) parts.push(`Difficulty: ${row.difficulty}`);
  if (row.tags.length > 0) parts.push(`Tags: ${row.tags.join(", ")}`);
  parts.push(renderSource(row.sourceName, row.sourceUrl));
  return parts.join(". ");
}

function renderAccommodation(row: Accommodation): string {
  const parts: string[] = [
    `${row.name}${row.type ? ` (${row.type})` : ""}${row.district ? `, ${row.district}` : ""}`,
  ];
  if (row.location) parts.push(`Location: ${row.location}`);
  if (row.priceRange) parts.push(`Price range: ${row.priceRange}`);
  if (row.facilities.length > 0) parts.push(`Facilities: ${row.facilities.join(", ")}`);
  if (row.contact) parts.push(`Contact: ${row.contact}`);
  if (row.bookingUrl) parts.push(`Booking: ${row.bookingUrl}`);
  parts.push(renderSource(row.sourceName, row.sourceUrl));
  return parts.join(". ");
}

function renderEvent(row: EventItem): string {
  const parts: string[] = [
    `${row.name}${row.category ? ` (${row.category})` : ""}${row.district ? `, ${row.district}` : ""}`,
  ];
  if (row.description) parts.push(row.description);
  if (row.location) parts.push(`Location: ${row.location}`);
  if (row.startDate) parts.push(`Dates: ${row.startDate}${row.endDate ? ` to ${row.endDate}` : ""}`);
  if (row.organizer) parts.push(`Organizer: ${row.organizer}`);
  if (row.annualOrOneTime) parts.push(`Schedule: ${row.annualOrOneTime}`);
  if (row.officialUrl) parts.push(`Official page: ${row.officialUrl}`);
  parts.push(renderSource(row.sourceName, row.sourceUrl));
  return parts.join(". ");
}

function renderTransport(row: TransportRoute): string {
  const parts: string[] = [`${row.origin} → ${row.destination}`];
  if (row.transportType) parts.push(`Type: ${row.transportType}`);
  if (row.approxDistance != null)
    parts.push(`Approx distance: ${row.approxDistance} km (estimated)`);
  if (row.approxTime) parts.push(`Approx time: ${row.approxTime}`);
  if (row.notes) parts.push(row.notes);
  parts.push(renderSource(row.sourceName, row.sourceUrl));
  return parts.join(". ");
}

function buildIndex(dataset: AssistantDataset): IndexedRecord[] {
  const records: IndexedRecord[] = [];

  records.push(
    ...dataset.destinations.map((row) =>
      index(
        "destinations",
        row.id,
        row.name,
        row.category,
        row.district ?? "",
        row.tags,
        [row.name, row.district ?? "", row.category, row.description ?? "", row.bestTime ?? ""].join(" "),
        renderDestination(row),
        row.sourceName,
        row.sourceUrl
      )
    )
  );

  records.push(
    ...dataset.food.map((row) =>
      index(
        "food",
        row.id,
        row.name,
        row.cuisine ?? "",
        row.district ?? "",
        row.tags,
        [row.name, row.cuisine ?? "", row.localDishes.join(" "), row.location ?? "", row.district ?? ""].join(" "),
        renderFood(row),
        row.sourceName,
        row.sourceUrl
      )
    )
  );

  records.push(
    ...dataset.experiences.map((row) =>
      index(
        "experiences",
        row.id,
        row.name,
        row.category,
        row.district ?? "",
        row.tags,
        [row.name, row.category, row.district ?? "", row.description ?? "", row.bestTime ?? "", row.location ?? ""].join(" "),
        renderExperience(row),
        row.sourceName,
        row.sourceUrl
      )
    )
  );

  records.push(
    ...dataset.accommodation.map((row) =>
      index(
        "accommodation",
        row.id,
        row.name,
        row.type ?? "",
        row.district ?? "",
        row.facilities,
        [row.name, row.type ?? "", row.district ?? "", row.location ?? "", row.facilities.join(" ")].join(" "),
        renderAccommodation(row),
        row.sourceName,
        row.sourceUrl
      )
    )
  );

  records.push(
    ...dataset.events.map((row) =>
      index(
        "events",
        row.id,
        row.name,
        row.category ?? "",
        row.district ?? "",
        [],
        [row.name, row.category ?? "", row.district ?? "", row.description ?? "", row.organizer ?? "", row.location ?? ""].join(" "),
        renderEvent(row),
        row.sourceName,
        row.sourceUrl
      )
    )
  );

  records.push(
    ...dataset.transport.map((row) =>
      index(
        "transport",
        row.id,
        `${row.origin} to ${row.destination}`,
        row.transportType ?? "",
        row.destination,
        [],
        [row.origin, row.destination, row.transportType ?? "", row.notes ?? ""].join(" "),
        renderTransport(row),
        row.sourceName,
        row.sourceUrl
      )
    )
  );

  return records;
}

function termWeight(record: IndexedRecord, term: string): number {
  const lowerName = record.name.toLowerCase();
  if (record.nameTokens.has(term)) {
    return 3;
  }
  if (record.facetTokens.has(term)) {
    return 2;
  }
  if (record.tagTokens.has(term)) {
    return 2;
  }
  if (term.length >= 4 && lowerName.includes(term)) {
    return 2;
  }
  if (record.fullTokens.has(term)) {
    return 1;
  }
  return 0;
}

function scoreRecord(
  record: IndexedRecord,
  terms: readonly string[]
): { score: number; matched: string[] } {
  let score = 0;
  const matched: string[] = [];
  for (const term of terms) {
    const weight = termWeight(record, term);
    if (weight > 0) {
      score += weight;
      matched.push(term);
    }
  }
  return { score, matched };
}

function toItem(record: IndexedRecord): RetrievedTourismItem {
  const { table, id, name, detail, sourceName, sourceUrl } = record;
  return { table, id, name, detail, sourceName, sourceUrl };
}

export function retrieveTourismData(
  message: string,
  dataset: AssistantDataset,
  options: RetrievalOptions = {}
): RetrievalResult {
  const limit = options.limit ?? 12;
  const terms = queryTerms(message);

  const records = buildIndex(dataset);
  const scored: Array<{ record: IndexedRecord; score: number }> = [];

  for (const record of records) {
    const { score } = scoreRecord(record, terms);
    if (score > 0) {
      scored.push({ record, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const tableDiff = TABLE_ORDER[a.record.table] - TABLE_ORDER[b.record.table];
    if (tableDiff !== 0) {
      return tableDiff;
    }
    return a.record.name.localeCompare(b.record.name);
  });

  return {
    items: scored.slice(0, limit).map(({ record }) => toItem(record)),
    terms,
    isGreeting: isGreeting(message),
  };
}