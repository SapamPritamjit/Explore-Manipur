import { AssistantError } from "./errors";
import type { RetrievedTourismItem } from "./retrieve";
import type { NormalizedAssistantRequest } from "./types";

export const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const GROQ_TIMEOUT_MS = 20000;

export interface GroundedAnswerInput {
  question: string;
  items: readonly RetrievedTourismItem[];
  tripContext?: NormalizedAssistantRequest["tripContext"] | null;
  apiKey?: string;
  model?: string;
}

export function resolveGroqApiKey(): string | null {
  return process.env.GROQ_API ?? process.env.GROQ_API_KEY ?? null;
}

export const SYSTEM_PROMPT = `You are the Explore Manipur tourism assistant. You answer ONLY from the "GROUNDED CONTEXT" provided in the user's message.

Rules:
- Never invent destinations, prices, coordinates, opening hours, contacts, addresses, permits, event dates, travel times, availability, URLs, or any tourism fact.
- If a fact is not present in the GROUNDED CONTEXT, state that it is not available in the tourism dataset. Do not guess.
- Prefer the provided tourism database records over general knowledge.
- When you rely on a specific record, refer to it by name and mention its source.
- Do not fabricate URLs or sources. Only mention a source that appears in the GROUNDED CONTEXT.
- Answer concisely in 80-180 words using simple markdown (short paragraphs or bullets).
- If the question is not about Manipur tourism, politely say you can only answer tourism questions about Manipur.
- If the GROUNDED CONTEXT contains nothing relevant, say the information is unavailable.`;

function buildContextBlock(items: readonly RetrievedTourismItem[]): string {
  return items
    .map((item, index) => `${index + 1}. ${item.detail}`)
    .join("\n");
}

function buildTripContextBlock(
  tripContext?: NormalizedAssistantRequest["tripContext"] | null
): string | null {
  if (!tripContext) {
    return null;
  }
  const parts: string[] = [];
  if (tripContext.interests.length > 0) {
    parts.push(`interests: ${tripContext.interests.join(", ")}`);
  }
  if (tripContext.district) {
    parts.push(`district: ${tripContext.district}`);
  }
  if (tripContext.category) {
    parts.push(`category: ${tripContext.category}`);
  }
  if (tripContext.destinations.length > 0) {
    parts.push(`planned destinations: ${tripContext.destinations.join(", ")}`);
  }
  return parts.length > 0 ? parts.join("; ") : null;
}

function buildUserPrompt(input: GroundedAnswerInput): string {
  const lines: string[] = [`Question: ${input.question}`, ""];
  const tripContext = buildTripContextBlock(input.tripContext);
  if (tripContext) {
    lines.push(`The user's current trip context: ${tripContext}.`, "");
  }
  lines.push(
    "GROUNDED CONTEXT (tourism database records retrieved for this question):"
  );
  lines.push(buildContextBlock(input.items));
  return lines.join("\n");
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: unknown } }>;
  error?: { message?: unknown };
}

export async function generateGroundedAnswer(
  input: GroundedAnswerInput
): Promise<{ answer: string }> {
  const apiKey = input.apiKey ?? resolveGroqApiKey();
  if (!apiKey) {
    throw new AssistantError(
      "Groq API key is not configured on the server (GROQ_API / GROQ_API_KEY).",
      "assistant-misconfigured"
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: input.model ?? DEFAULT_GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(input) },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = `Groq API returned HTTP ${response.status}.`;
      try {
        const body = (await response.json()) as ChatCompletionResponse;
        if (typeof body.error?.message === "string") {
          detail = body.error.message;
        }
      } catch {
        // ignore JSON parse failure; keep the HTTP status detail
      }
      throw new AssistantError(detail, "groq-upstream");
    }

    const body = (await response.json()) as ChatCompletionResponse;
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new AssistantError(
        "The model returned an empty response.",
        "groq-empty"
      );
    }
    return { answer: content.trim() };
  } catch (error) {
    if (error instanceof AssistantError) {
      throw error;
    }
    throw new AssistantError(
      error instanceof Error ? error.message : String(error),
      "groq-fetch"
    );
  } finally {
    clearTimeout(timer);
  }
}