# Explore Manipur

Hackathon MVP for Re-Imagining Manipur 2026 (deadline 23 Sep 2026).

Full roadmap:
`SmartTrip_Manipur_Project_Plan.md`

Trust the project plan over memory or assumptions.

## Core Priority

Working end-to-end journey > feature count > architecture elegance.

The V1 product is:

User enters trip preferences
→ personalized tourism recommendations
→ destination discovery
→ select destinations
→ generate itinerary
→ view itinerary on a map
→ ask a tourism assistant

The goal is a polished, working hackathon MVP, not a production-scale tourism platform.

## Stack

These choices are decided. Do not swap technologies without explicit approval.

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase hosted PostgreSQL
- `@supabase/supabase-js`
- Leaflet + React Leaflet
- OpenStreetMap tiles
- Groq API via plain `fetch`
- Open-Meteo via plain `fetch`
- Zustand with localStorage persistence
- Vitest
- ESLint

Architecture:

- Single Next.js application
- No separate backend service
- No microservices
- No vector database
- No custom routing engine
- No unnecessary infrastructure

## Application Architecture

### Data access

- Server Components query Supabase through thin wrappers in `lib/data/`.
- Keep database access isolated from UI components.
- Client components must not contain service-role credentials.
- Do not expose server-only environment variables through `NEXT_PUBLIC_*`.

### API routes

Only create route handlers when they are actually required.

Current planned routes:

- `app/api/assistant/route.ts`
- `app/api/health/route.ts`

The assistant route is server-side because it uses the Groq API key.

The health route must never expose secrets.

### Recommendation engine

Recommendation logic lives in:

`lib/recommendation/`

It must be:

- Pure TypeScript
- Deterministic
- Unit-tested
- Easy to understand
- Independent from the UI

V1 scoring:

- Interest match: 40%
- Budget fit: 20%
- Geographic/distance fit: 20%
- Time fit: 20%

Every recommendation must provide a human-readable explanation of why it was recommended.

Do not introduce ML training in V1.

### Itinerary engine

Itinerary logic lives in:

`lib/itinerary/`

Keep it deterministic and testable.

Do not build a complex optimization engine for V1.

### Map

Use Leaflet + OpenStreetMap.

Because Leaflet requires the browser:

- Map components must be client-side.
- Use dynamic import with SSR disabled where required.
- Handle Leaflet CSS correctly.
- Do not create a custom map renderer.
- Do not build a custom routing engine.

V1 map behavior:

- Destination markers
- Selected destinations
- Ordered itinerary path/polyline
- Estimated distance/time

Any seed travel distance or travel time must be clearly labeled as:

`estimated`

Do not present estimates as live routing data.

## AI Tourism Assistant

The assistant must use retrieval/grounding.

Required flow:

User question
→ retrieve relevant tourism data
→ provide retrieved context to the LLM
→ generate answer from that context

Do not build a pure:

`user → LLM`

chatbot.

The assistant must:

- Prefer information from our tourism database.
- Use retrieved destination/food/experience/accommodation/event data.
- Avoid inventing tourism facts.
- If the required information is unavailable, clearly say that it is unavailable.
- Never fabricate prices, coordinates, opening hours, contacts, event dates, permits, or other factual tourism information.

Groq credentials are server-only.

Never use:

`NEXT_PUBLIC_GROQ_API_KEY`

## Data Rules

Tourism data quality is critical.

Never invent:

- Prices
- Coordinates
- Opening hours
- Event dates
- Contact numbers
- Addresses
- URLs
- Tourism facts
- Accommodation information
- Travel times presented as factual
- Availability

If information cannot be verified:

- Use `NULL` where appropriate.
- Use `TBD` only where the database plan explicitly permits it.
- Do not guess.

Every factual database row must contain:

- `source_name`
- `source_url`

Prefer official sources, especially:

`https://manipurtourism.gov.in/`

Use other reliable sources when necessary and record the source.

A smaller verified dataset is better than a large unreliable dataset.

Target for V1:

- Approximately 20–30 verified destinations
- 10–15 food records
- 5–10 experiences
- 10–15 accommodation records
- 5–10 events/festivals

Do not create fake/demo tourism records that could be mistaken for real information.

Placeholder UI data must be clearly marked as placeholder.

## Database

Supabase PostgreSQL is the V1 database.

Use UUID primary keys:

`id uuid primary key default gen_random_uuid()`

Use:

- `text[]` for tags where appropriate
- numeric latitude/longitude
- TypeScript Haversine calculations for distance

Do not introduce PostGIS unless explicitly approved.

Every factual row needs source information.

RLS should be enabled appropriately.

The browser must never have access to the Supabase service-role key.

Seed data should be loaded through SQL/import tooling, not client-side writes.

## Environment Variables

Expected environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
GROQ_API_KEY
```

## State Management

Use Zustand for V1 trip state.

Persist only appropriate client-side trip state, such as:

- Trip preferences
- Selected destination IDs

Do not store secrets in Zustand/localStorage.

## V1 Scope

Mandatory V1 features:

1. Trip preferences
2. Tourism database
3. Transparent recommendation engine
4. Destination discovery
5. Add destinations to trip
6. Day-by-day itinerary
7. Map
8. Grounded AI tourism assistant
9. Weather-aware adjustment if feasible
10. Responsive polished UI
11. Loading states
12. Empty states
13. Error states

Priority order under deadline:

P0:
- Discovery
- Recommendation
- Itinerary
- Map

P1:
- AI assistant
- Weather
- Explore Nearby

P2:
- Safety/emergency information
- Travel information
- Accessibility information
- Permit/travel requirement information
- Richer transport information

If time becomes limited, protect P0 before P1/P2.

## Do NOT Build in V1

Do not build these unless explicitly approved:

- ML training
- Custom recommendation model
- Microservices
- Custom map/routing infrastructure
- Payment system
- Booking infrastructure
- Complex authentication
- Government dashboard
- Marketplace
- Voice assistant
- Mobile application
- Large admin system
- Unnecessary CMS
- Unnecessary third-party infrastructure

Do not expand scope because a feature sounds useful.

## UI Requirements

The V1 application should have these main areas:

1. Home / Trip Preferences
2. Discover / Recommendations
3. My Trip / Itinerary
4. Map
5. AI Assistant

The UI must be:

- Responsive
- Clean
- Tourism-focused
- Fast to understand
- Demo-friendly
- Consistent

Every data-dependent screen should have appropriate:

- Loading state
- Empty state
- Error state

Do not leave broken links or dead navigation.

## Coding Rules

- Use TypeScript.
- Avoid `any` unless there is a documented reason.
- Keep functions small and testable.
- Prefer simple solutions.
- Do not duplicate business logic.
- Keep business logic outside UI components.
- Do not add dependencies without a clear reason.
- Do not rewrite working code unnecessarily.
- Do not change the agreed architecture without approval.
- Do not silently expand scope.
- Follow the existing project plan.

Before adding a dependency, ask:

1. Is it actually necessary?
2. Can the requirement be solved with existing dependencies or native APIs?
3. Will it increase hackathon risk?

Prefer the simplest solution.

## Testing

Required scripts:

```text
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```