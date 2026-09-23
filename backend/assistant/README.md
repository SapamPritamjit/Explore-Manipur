# AI Tourism Assistant

Grounded, retrieval-based tourism assistant in `lib/assistant/`. Backend-first,
server-only (uses the Groq API key). It is **not** a pure `user -> LLM`
chatbot: every question is answered only from tourism records retrieved from the
verified dataset via `lib/data/`.

## Flow

```text
Question
  -> validateAssistantRequest        (lib/assistant/validate.ts)
  -> load all six tables             (lib/data/, mocked in tests)
  -> retrieveTourismData             (lib/assistant/retrieve.ts, deterministic keyword retrieval)
  -> generateGroundedAnswer          (lib/assistant/ground.ts, Groq via plain fetch)
  -> AssistantResponse
```

## Request shape (POST /api/assistant)

```jsonc
{
  "message": "Tell me about Loktak Lake",   // required, non-empty string
  "tripContext": {                          // optional
    "destinations": ["Loktak Lake"],
    "interests": ["nature"],
    "district": "Bishnupur",
    "category": "Nature"
  }
}
```

## Retrieval

Deterministic, no vector database, no ML. Terms are extracted from the question
(stopwords removed) and each record in the six tables is scored against:

- name tokens (weight 3), partial name match for terms >= 4 chars (weight 2)
- facet tokens - district / category / cuisine / type (weight 2)
- tag tokens (weight 2)
- description / full-text tokens (weight 1)

Records are ranked by score (ties broken by table order, then name) and the top
`limit` (default 12) records form the grounded context.

## Grounding

`generateGroundedAnswer` sends the question plus the retrieved records to Groq
(`POST https://api.groq.com/openai/v1/chat/completions`) with a strict system
prompt:

- answer **only** from the GROUNDED CONTEXT
- never invent prices, coordinates, hours, contacts, dates, permits, URLs,
  travel times or availability
- state clearly when a fact is not in the dataset
- do not fabricate sources or URLs

The API key is read server-side from `GROQ_API` (fallback `GROQ_API_KEY`); it is
never exposed to the client and never a `NEXT_PUBLIC_*` value.

## Response shape

```jsonc
{
  "answer": "markdown text...",
  "sources": [{ "table": "destinations", "name": "Loktak Lake", "sourceName": "Manipur Tourism", "sourceUrl": "https://..." }],
  "grounded": true,
  "mode": "grounded-llm",
  "usedTables": ["destinations"]
}
```

`grounded` is `false` only in `help` mode (a pure greeting). `mode`:

- `grounded-llm` - answer produced by Groq from retrieved records
- `grounded-fallback` - Groq unavailable/failed; a plain summary of the top
  retrieved records is returned (still grounded, nothing invented)
- `no-info` - no records matched; the assistant says information is unavailable
- `help` - greeting detected; lists what the assistant can answer

## Safety behavior

- Empty/greeting questions never reach the LLM.
- With zero matches, the assistant returns the `no-info` answer instead of
  asking the model to guess.
- Any Groq failure (missing key, HTTP error, empty completion, timeout) falls
  back to `grounded-fallback` - the API route still returns 200 with verified
  data rather than fabricating an answer.

## Files

- `types.ts` - request, response, dataset, mode/result types.
- `errors.ts` - `AssistantError`.
- `validate.ts` - message + optional tripContext validation.
- `retrieve.ts` - deterministic keyword retrieval + record rendering.
- `ground.ts` - Groq call via plain `fetch` (timeout, upstream error parsing).
- `assistant.ts` - orchestration, greeting/no-info/fallback paths.

## Tests

`tests/assistant.test.ts` mocks `@/lib/data` and stubs the global `fetch`, so
retrieval, grounding and fallback behavior run with no network or credentials.
`tests/assistant-api.test.ts` mocks `runAssistant` to assert the route's 400/500
JSON contract.