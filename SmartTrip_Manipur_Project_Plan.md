# Explore Manipur --- Hackathon Project Plan

**Hackathon:** Re-Imagining Manipur Hackathon 2026\
**Problem Statement:** #1 --- Smart Manipur Tourism Discovery Platform\
**Deadline:** 23 September 2026\
**Primary goal:** Build a working, polished V1 that demonstrates one
complete tourism journey end-to-end.

------------------------------------------------------------------------

## 1. Product Vision

Explore Manipur is a digital tourism discovery platform that helps
visitors:

> **Tell us what kind of trip you want → discover relevant places → get
> personalized recommendations → build an itinerary → see it on a map →
> ask a tourism assistant.**

The product should connect destinations, food, experiences, events,
accommodation and transport information instead of behaving like a
simple tourism directory.

### Core principle

**V1 must be complete enough to demo even if we never build V2.**

Future versions should extend the same architecture rather than require
rebuilding V1.

------------------------------------------------------------------------

# 2. Roadmap

## V1 --- Hackathon MVP --- MANDATORY

### User journey

1.  Enter trip preferences
2.  Get personalized destination recommendations
3.  Explore destination details
4.  Add destinations to a trip
5.  Generate a day-by-day itinerary
6.  View the itinerary on a map
7.  Ask the tourism assistant
8.  Optionally adjust the itinerary based on weather

### V1 features

-   Trip duration
-   Budget
-   Starting location
-   Interest selection
-   Tourism database
-   Recommendation engine
-   Destination discovery
-   Destination detail pages/cards
-   Add-to-trip functionality
-   Itinerary generation
-   Estimated trip cost
-   Approximate travel time/distance
-   Map with destinations and route/order
-   AI tourism assistant
-   Recommendation explanations
-   Weather-aware adjustment if feasible
-   Explore Nearby if feasible
-   Loading/error/empty states
-   Responsive polished UI

### V1 recommendation engine

Do NOT train an ML model for the hackathon.

Use transparent scoring:

-   Interest match: 40%
-   Budget compatibility: 20%
-   Distance/geographic fit: 20%
-   Time compatibility: 20%

Every recommendation should ideally explain why it was recommended.

Example:

> Recommended because it matches your Nature interest, fits your budget,
> and works within your available time.

### V1 AI architecture

Do not make a generic chatbot.

Use:

User question → retrieve relevant tourism data → LLM → grounded answer

The assistant should answer from the project's tourism dataset and
should not invent unsupported facts.

If the dataset does not contain an answer, the assistant should clearly
say that the information is unavailable.

### V1 screens

1.  Home / Trip Preferences
2.  Discover / Recommendations
3.  Map
4.  My Trip / Itinerary
5.  AI Tourism Assistant

### V1 demo scenario

Example:

> I have 3 days, ₹8,000, and I like Nature + Culture + Food.

Then demonstrate:

1.  Personalized recommendations
2.  Recommendation explanation
3.  Select destinations
4.  Generate itinerary
5.  Show route on map
6.  Show weather-aware adjustment if available
7.  Ask: "What can I explore near Loktak Lake?"

This should be the main judging/demo story.

------------------------------------------------------------------------

# 3. V2 --- Smarter Tourism

Only begin V2 after V1 is stable.

### Recommendation improvements

Move from fixed rule-based ranking toward learning from real usage:

-   clicks
-   saves
-   selected destinations
-   completed trips
-   ratings
-   searches
-   time spent

Only introduce ML when there is enough real data to justify it.

### Dynamic itinerary optimization

Consider:

-   opening hours
-   travel time
-   distance
-   weather
-   budget
-   available hours
-   user interests
-   destination duration

### Events

Create a richer events/festivals system:

-   upcoming events
-   dates
-   locations
-   categories
-   official information
-   event recommendations based on trip dates/interests

### Accommodation

Add richer hotels/homestays:

-   price range
-   facilities
-   location
-   contact
-   external booking URL

Do not build booking/payment infrastructure in the hackathon V1.

### Food discovery

Expand:

-   Manipuri dishes
-   restaurants
-   local food experiences
-   food trails
-   local cuisine recommendations

------------------------------------------------------------------------

# 4. V3 --- Real Smart Tourism Ecosystem

### User profiles

-   interests
-   saved places
-   previous trips
-   preferences
-   ratings

### Local business ecosystem

Potential participants:

-   hotels
-   homestays
-   restaurants
-   guides
-   drivers
-   artisans
-   tour operators
-   experience providers

Long-term model:

Tourists ↕ Explore Manipur ↕ Local businesses

### Local guide marketplace

Future workflow:

Search → Compare → Book → Pay → Review

### Multilingual/voice assistant

Potential languages:

-   English
-   Meiteilon/Manipuri
-   Hindi
-   Bengali
-   other useful regional languages

Voice queries could support situations such as:

> "I have two hours before my bus. What can I visit?"

### Emergency tourist mode

Potential features:

-   police
-   hospitals
-   tourism office
-   emergency contacts
-   nearest safe/relevant locations

------------------------------------------------------------------------

# 5. V4 --- State Tourism Intelligence Platform

Long-term direction:

## Tourist side

-   discovery
-   recommendations
-   itinerary
-   navigation
-   AI assistant
-   bookings
-   reviews

## Business side

-   listings
-   availability
-   bookings
-   customer information
-   offers

## Government side

-   tourist arrival trends
-   destination popularity
-   seasonal demand
-   event attendance
-   accommodation demand
-   feedback
-   tourism infrastructure insights

The long-term product can become a tourism ecosystem and intelligence
platform, not just a travel-planning app.

------------------------------------------------------------------------

# 6. V1 Architecture

Keep the architecture simple.

``` text
Next.js / React Frontend
          |
          v
     API / Server
          |
    +-----+------+
    |            |
    v            v
PostgreSQL    Recommendation
/ Supabase       Engine
    |            |
    +-----+------+
          |
          v
       AI / RAG
          |
     +----+----+
     |         |
     v         v
   Maps      Weather
    API        API
```

### Preferred stack

-   Frontend: Next.js + React
-   UI: Tailwind CSS
-   Database: PostgreSQL / Supabase
-   Backend: Next.js server/API or a small API layer
-   Recommendation engine: TypeScript rule-based scoring
-   AI: LLM API + retrieval over tourism data
-   Maps: existing map provider
-   Weather: existing weather API
-   Deployment: simple web deployment

### Do NOT build

-   microservices
-   custom maps
-   custom routing engine
-   ML training infrastructure
-   payment infrastructure
-   complex authentication
-   custom translation engine
-   custom speech recognition
-   complicated admin systems
-   mobile app unless the web MVP is already complete

------------------------------------------------------------------------

# 7. V1 Database Plan

The database should contain structured tourism information.

## Priority 1 --- Destinations

Target: 20--30 high-quality entries.

Fields:

``` text
id
name
district
category
description
latitude
longitude
distance_from_imphal
estimated_cost
estimated_visit_duration
best_time
tags
opening_hours
contact
image_url
source_url
source_name
notes
```

Categories can include:

-   Nature
-   Culture
-   Heritage
-   Adventure
-   Spiritual
-   Shopping
-   Other relevant tourism categories

Do not invent factual information. Unknown fields should remain unknown
until verified.

## Priority 2 --- Food

Target: 10--15 places/experiences.

Fields:

``` text
id
name
location
district
latitude
longitude
cuisine
local_dishes
price_range
opening_hours
contact
image_url
source_url
source_name
```

Collect both restaurants and local food experiences where useful.

## Priority 3 --- Experiences

Target: 5--10.

Fields:

``` text
id
name
location
district
category
description
duration
estimated_cost
best_time
difficulty
booking_required
contact
image_url
source_url
source_name
```

Possible categories:

-   Trekking
-   Boating
-   Cultural experience
-   Handicrafts
-   Village experience
-   Photography
-   Adventure
-   Other local experiences

## Priority 4 --- Accommodation

Target: 10--15.

Fields:

``` text
id
name
location
district
latitude
longitude
type
price_range
facilities
contact
booking_url
image_url
source_url
source_name
```

Types can include:

-   Hotel
-   Homestay
-   Guest house
-   Other relevant accommodation

## Priority 5 --- Events/Festivals

Target: 5--10 useful events initially.

Fields:

``` text
id
name
category
start_date
end_date
location
district
description
organizer
annual_or_one_time
official_url
image_url
source_name
source_url
year
```

IMPORTANT:

Use official sources where possible.

The Manipur Tourism events page is an official source:
https://manipurtourism.gov.in/events/

Do not assume the events page is itself a complete event database.
Search relevant official festival/event pages and linked official
information.

If a date is not verified, use `TBD`/null rather than inventing a date.

## Priority 6 --- Transport

Keep this simple in V1.

Possible fields:

``` text
id
origin
destination
transport_type
approx_distance
approx_time
notes
source
```

Do not build a custom routing system. Use a maps/routing API for actual
route calculations.

------------------------------------------------------------------------

# 8. Data Collection Rules

The data team can work in Excel, Google Sheets or CSV.

Each factual record should have a source.

Example:

``` text
Loktak Lake
Bishnupur
Nature
48 km
3–4 hours
₹500
latitude
longitude
lake, boating, nature, photography
source_name: Manipur Tourism
source_url: ...
```

### Data priorities

``` text
P0 — 20–30 destinations
P1 — 10–15 food entries
P1 — 5–10 experiences
P1 — 10–15 accommodation entries
P1 — 5–10 events
P2 — transport details
```

Do not waste time collecting hundreds of records before the application
works.

**20--30 verified destinations are more valuable for the hackathon than
hundreds of weak records.**

------------------------------------------------------------------------

# 9. Data Team Assignment

While developers build, the data team should work independently.

### Person/Team A --- Destinations

Collect:

-   name
-   district
-   category
-   description
-   coordinates
-   cost
-   duration
-   tags
-   best time
-   source

### Person/Team B --- Food + Experiences

Collect:

-   restaurants
-   local dishes
-   food experiences
-   cultural/adventure experiences
-   coordinates
-   cost
-   duration
-   sources

### Person/Team C --- Accommodation + Events

Collect:

-   hotels
-   homestays
-   festivals
-   events
-   dates
-   locations
-   official URLs
-   sources

### One person should verify the data

Before importing:

-   duplicates
-   missing names
-   bad coordinates
-   unsupported claims
-   inconsistent categories
-   invalid URLs
-   missing sources

------------------------------------------------------------------------

# 10. V1 UI Requirements

## Home

Show:

-   Explore Manipur branding
-   trip duration
-   budget
-   interests
-   starting location
-   Plan My Trip

## Discover

Show:

-   recommended destinations
-   image
-   category
-   cost
-   duration
-   distance
-   why recommended
-   Add to Trip

## Destination detail

Show:

-   image
-   description
-   location
-   cost
-   duration
-   tags
-   map/location
-   source/official information
-   Add to Trip

## My Trip

Show:

-   Day 1
-   Day 2
-   Day 3
-   destination ordering
-   estimated cost
-   estimated travel time
-   remove/reorder where practical

## Map

Show:

-   markers
-   selected destinations
-   route/order
-   destination details

## AI Assistant

Show:

-   chat interface
-   suggested questions
-   grounded answers
-   clear fallback when information is unavailable

------------------------------------------------------------------------

# 11. Build Order

Build in this exact order.

## Phase 0 --- Project setup

-   initialize repository
-   create Next.js application
-   configure Tailwind
-   configure database
-   create project structure
-   create AGENTS.md
-   create environment variable structure
-   verify local build

Definition of done:

-   application runs
-   database connection works
-   project builds

## Phase 1 --- Tourism data

-   create schema
-   create seed/import mechanism
-   add initial destinations
-   add initial food
-   add experiences
-   add events
-   add accommodation

Definition of done:

-   data can be queried
-   data renders in the application

## Phase 2 --- Home/preferences

Build:

-   duration selector
-   budget selector
-   interest selector
-   starting location
-   Plan My Trip

Definition of done:

-   preferences are stored in application state
-   user can continue to Discover

## Phase 3 --- Recommendation engine

Implement:

``` text
interest = 40%
budget = 20%
distance = 20%
time = 20%
```

Definition of done:

-   ranked recommendations
-   deterministic results
-   explanation for each recommendation
-   scoring logic tested

## Phase 4 --- Discover

Build:

-   recommendation cards
-   filters
-   destination details
-   Add to Trip

Definition of done:

-   user can discover and select places

## Phase 5 --- Itinerary

Build:

-   day grouping
-   destination ordering
-   cost estimate
-   duration estimate

Definition of done:

-   1/2/3 day trip generates an understandable itinerary

## Phase 6 --- Map

Build:

-   markers
-   selected destinations
-   route/order
-   destination information

Definition of done:

-   itinerary can be understood geographically

## Phase 7 --- AI assistant

Build:

-   tourism data retrieval
-   LLM response
-   context-aware questions
-   fallback when API is unavailable

Definition of done:

-   assistant answers from project data
-   unsupported facts are not fabricated

## Phase 8 --- Weather adjustment

If time permits:

-   weather API
-   identify bad-weather activities
-   suggest alternatives
-   move outdoor activities where possible

Definition of done:

-   demonstrate at least one weather-aware adjustment

## Phase 9 --- Explore Nearby

If time permits:

-   current/selected location
-   nearby destinations
-   nearby food
-   nearby experiences
-   nearby accommodation

Definition of done:

-   nearby results are sorted by distance

## Phase 10 --- Polish

Only after functionality works:

-   responsive UI
-   loading states
-   error states
-   empty states
-   animations
-   spacing
-   typography
-   images
-   final demo flow

------------------------------------------------------------------------

# 12. OpenCode Workflow

OpenCode should be treated as a coding agent, not as the product
architect.

OpenCode supports project-level `AGENTS.md` instructions, which are
loaded into the project context. It also provides Plan and Build agents;
Plan is intended for analysis/planning while Build performs development
work. Use these deliberately.

Official OpenCode documentation: https://opencode.ai/en/docs

## First step

Inside the project:

``` text
opencode
```

Then use `/init` if needed to generate/update the project `AGENTS.md`.

Commit `AGENTS.md` so the whole team gets the same project guidance.

## Before each major feature

Use Plan mode first.

Tell OpenCode:

> Analyze the existing project and create a practical implementation
> plan for this feature. Do not make code changes yet.

Review the plan.

Then switch to Build and say:

> Implement the approved plan. Keep the existing architecture. Do not
> add unrelated features. Run the relevant checks and fix errors.

## One feature at a time

Do NOT give OpenCode:

> Build the entire tourism platform.

Instead:

1.  Set up database
2.  Build preferences
3.  Build recommendation engine
4.  Build discovery
5.  Build itinerary
6.  Build map
7.  Build AI
8.  Build weather
9.  Polish

After every major phase:

-   run the app
-   test the feature
-   inspect the result
-   fix errors
-   commit

------------------------------------------------------------------------

# 13. AGENTS.md Core Instructions

The project root should contain an `AGENTS.md` with instructions similar
to:

``` md
# Explore Manipur

## Goal

Build a hackathon MVP for the Smart Manipur Tourism Discovery Platform.

Working MVP > feature count.

## V1

1. Trip preferences
2. Tourism database
3. Recommendation engine
4. Destination discovery
5. Itinerary
6. Map
7. AI tourism assistant
8. Weather adjustment if feasible

## Rules

- Keep architecture simple.
- Prefer working features.
- Use verified/seeded tourism data.
- Keep recommendation logic transparent.
- Do not train ML.
- Do not build microservices.
- Do not build custom maps.
- Do not build payments.
- Do not add unnecessary authentication.
- Do not add features outside the current phase without approval.
- Handle API failures gracefully.
- Do not invent tourism facts.

## Verification

After meaningful changes:

- run type checking
- run lint
- run tests where available
- run the application
- verify the changed feature manually

## Definition of Done

A feature is not complete until it:
- builds
- runs
- works in the browser
- has reasonable loading/error states
- does not break existing functionality
```

------------------------------------------------------------------------

# 14. Definition of Done --- Entire V1

V1 is complete when a judge can do this without developer assistance:

``` text
Open Explore Manipur
      ↓
Select:
3 days
₹8,000
Nature + Culture + Food
      ↓
Click Plan My Trip
      ↓
See personalized recommendations
      ↓
Understand why places were recommended
      ↓
Add destinations
      ↓
Generate itinerary
      ↓
See estimated cost/time
      ↓
Open map
      ↓
See route
      ↓
Ask tourism assistant a question
      ↓
Receive grounded answer
```

If weather is implemented:

``` text
Weather changes
      ↓
System suggests itinerary adjustment
```

That is the V1 finish line.

------------------------------------------------------------------------

# 15. V1 Priority Levels

## P0 --- Must work

-   project setup
-   database
-   tourism data
-   preferences
-   recommendations
-   discovery
-   itinerary
-   map
-   end-to-end demo

## P1 --- Strong additions

-   AI assistant
-   recommendation explanations
-   weather
-   Explore Nearby

## P2 --- Polish

-   animations
-   better filtering
-   favorites
-   additional data
-   advanced itinerary optimization

## Not for tomorrow

-   ML training
-   payments
-   booking infrastructure
-   marketplace
-   complex authentication
-   government dashboard
-   mobile app
-   custom maps
-   custom routing
-   voice assistant

------------------------------------------------------------------------

# 16. Team Operating Rule

Every developer should work on a clear phase/feature.

Do not have multiple people randomly modifying the same core files.

Suggested split:

``` text
Developer 1
Frontend + UI

Developer 2
Database + data integration

Developer 3
Recommendation + itinerary logic

Developer 4
Maps + AI/API integration
```

If fewer developers are available, combine roles.

The data team works in parallel with developers.

------------------------------------------------------------------------

# 17. Demo Preparation

The final demo should tell one story.

### Opening

> "Today, tourists have information scattered across different sources.
> Explore Manipur brings discovery, recommendations, itinerary planning and
> tourism assistance into one journey."

### Demo

> "I have three days, ₹8,000, and I want Nature, Culture and Food."

Then demonstrate:

1.  Preferences
2.  Recommendations
3.  Why recommendation
4.  Add destinations
5.  Itinerary
6.  Map
7.  Weather adjustment
8.  AI assistant

### Do not demo every feature

A coherent journey is stronger than showing 20 unfinished features.

------------------------------------------------------------------------

# 18. Product Principle

## V1

**Complete the journey.**

## V2

**Make the journey smarter.**

## V3

**Connect the tourism ecosystem.**

## V4

**Turn tourism data into a state-level platform.**

------------------------------------------------------------------------

# 19. Current Execution Rule

**Working \> complete.**

If a feature threatens the stability of the core V1 journey, postpone
it.

The team should always ask:

> "Does this help us complete the main tourist journey?"

If no, it goes to V2+.
