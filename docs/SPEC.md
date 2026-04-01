# PartyScout - Product Specification

## Overview

PartyScout is a parent-centric birthday party planning application that helps families find and book the perfect party venue. Users can explore ideas via an AI-powered chat assistant, browse curated idea cards on a landing page, or walk through a guided 5-step planning wizard.

## Problem Statement

Planning a party or event is stressful:
- Too many venue options with no clear way to filter by age, setting, or occasion
- Difficulty matching venues to age-appropriate activities
- Unclear pricing and what's included
- No easy way to compare options side-by-side
- Hard to find outdoor venues that actually are outdoor

## Solution

Three entry points matching how parents actually think:

```
Landing page → browse idea cards → venue results
Landing page → Ask AI (chat) → venue results
Landing page → Wizard (5-step guided flow) → venue results
```

## Target Users

- **Primary**: Parents planning birthday parties for children ages 1-18
- **Secondary**: Anyone planning any party or event — graduations, baby showers, corporate events, quinceañeras, anniversaries, and more

---

## Core Features

### Landing Page

The app opens on a landing page with:
- **Hero section**: occasion pills (Birthday, Just because), AI chat bar, quick-start chips
- **Celebrating someone specific?**: persona chips (Little Kids, Tweens, Teens, Adults) — pre-fill age and trigger venue search when city is set
- **Top party ideas**: horizontally scrollable idea cards (Active Play, Creative, Escape Rooms, Arcades, Nature & Outdoors, Cooking Classes, Food categories, etc.)
- **City input**: "Search near [city]" row above idea cards; clicking an idea card with a city set goes directly to venue results
- **How it works**: 3-step explainer
- **Footer CTA**: secondary entry to wizard

### AI Chat Panel

- Triggered from the "Ask AI" button in the nav or the hero chat bar
- Slides in as a fixed right-side panel (400px wide) anchored dynamically below the nav
- Sends conversation history to `POST /api/chat` and streams the response via Server-Sent Events (SSE)
- Displays:
  - Streamed text with markdown support: bold text rendered as styled chips, paragraphs, and lists
  - Venue list results (one per line with name + "View" link)
  - Bouncing typing indicator during streaming
  - Quick-reply chips for common follow-ups
- Clicking a venue in chat selects it and opens Step 5 (Party Details)
- Chat history is preserved while the panel is open (unmount resets it)

### 1. Child Information — Wizard Step 1
- Child's age (drives party type suggestions)
- Party date: separate date and time inputs (stored as ISO datetime string)

### 2. Location & Logistics — Wizard Step 2
- City entry (e.g. "Boston, MA")
- Indoor/Outdoor/Any preference
- Maximum distance willing to travel (miles)

### 3. Party Preferences — Wizard Step 3
- **Party Type Selection**: 6 broad categories, filtered by indoor/outdoor setting from Step 2
  - Active Play (trampoline, gymnastics, skating, swimming)
  - Creative (arts, crafts, cooking, science)
  - Amusement (arcade, movies, escape rooms, bowling)
  - Outdoor (parks, zoos, farms, adventure) — hidden for indoor setting
  - Characters & Performers (magicians, princesses, entertainers)
  - Social & Dining (restaurants, cafes, party rooms) — hidden for outdoor setting
- Guest count input
- Budget range slider
- Venue search triggered directly from this step

### 4. Venue Results — Wizard Step 4
- Smart-matched venues sorted by relevance
- Match score (0-100) based on:
  - Age appropriateness (25 points)
  - Budget fit (25 points)
  - Capacity match (20 points)
  - Distance (15 points)
  - Rating quality (10 points)
  - Venue type match (5 points)
- Filter chips (All, Indoor, Outdoor, 4+ Stars)
- Sort options (Best Match, Highest Rated, Closest, Lowest Price)
- Compare mode (select up to 3 venues)
- Color-coded weather badge on outdoor venue cards (green/amber/red): temperature, condition, rain risk
  - Weather fetched from `/api/v2/weather/forecast` when outdoor venues + party date + ZIP are present

### 5. Party Details — Wizard Step 5
- Selected venue information
- What's included / what to bring / suggested add-ons
- Contact/booking information
- Estimated total cost
- Full-width weather card for outdoor venues: high/low temp, rain %, condition, and "Typical for this time of year" label for CLIMATE_AVERAGE forecast type

### Saved Events
- Save icon on venue cards saves a venue (requires Firebase sign-in)
- SaveModal captures event date, party types, and guest count at save time
- Saved Events page (nav link) lists all saved venues with details; accessible across devices
- Delete saved events from the page

### All Ideas Page
- Accessible via "See all →" on the landing page
- Full grid of idea cards with city pre-filled
- Clicking a card with a city triggers venue search directly

---

## Technical Architecture

### Frontend
- **Framework**: React 19 with Vite 7
- **State Management**: React Context + useReducer (`PartyPlannerContext`)
- **Styling**: Co-located CSS per component, CSS variables in `App.css`
- **Authentication**: Firebase Auth (Google + email/password); optional — app works without it
- **Hosting**: Google Cloud Run + Cloud CDN via HTTPS load balancer

### Backend
- **Framework**: Spring Boot 3.3.5 with Kotlin
- **API Style**: RESTful JSON + SSE streaming for chat
- **AI**: LLM integration for intent extraction, venue filtering, and chat response generation
- **External APIs**: Google Places API (New), Weather API
- **Authentication**: Firebase Admin SDK (JWT verification)
- **Hosting**: Google Cloud Run
- **Secrets**: Google Secret Manager

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Google Places  │
│   (React)   │◀────│  (Kotlin)   │◀────│      API        │
└─────────────┘     └─────────────┘     └─────────────────┘
      │                    │
      │ SSE stream         ▼
      │             ┌─────────────┐
      └─────────────│     LLM     │
                    │  (Chat AI)  │
                    └─────────────┘
```

---

## API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v2/auth/me` | Required | Get or create user profile after sign-in |
| DELETE | `/api/v2/auth/me` | Required | Delete account (GDPR soft-delete) |

### Party Wizard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v2/party-wizard/search` | Optional | Venue search with scoring, filtering, enrichment |
| GET | `/api/v2/party-wizard/party-types` | None | All party type taxonomy |
| GET | `/api/v2/party-wizard/party-types/{age}` | None | Age-filtered party type suggestions |
| POST | `/api/v2/party-wizard/estimate-budget` | None | Budget estimate for party config |
| GET | `/api/v2/party-wizard/party-details` | None | Included items, add-ons, duration for selected types |

### Chat (SSE)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | Optional | AI chat with SSE streaming — extracts intent, searches venues, streams response |

### Saved Events & Profiles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v2/saved-events` | Required | List saved events for user |
| POST | `/api/v2/saved-events` | Required | Save a venue as an event |
| DELETE | `/api/v2/saved-events/{id}` | Required | Unsave an event |
| POST | `/api/v2/saved-events/merge` | Required | Merge guest data from multiple saved events |
| GET | `/api/v2/profiles` | Required | List profiles for multi-person planning |
| POST | `/api/v2/profiles` | Required | Create a profile |
| DELETE | `/api/v2/profiles/{id}` | Required | Delete a profile |

### Places & Utilities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v2/places/autocomplete` | None | City autocomplete (up to 5 US city suggestions) |
| GET | `/api/v2/weather/forecast` | None | Weather forecast by ZIP code and date |
| POST | `/api/v2/feedback` | None | Submit feedback or bug report |

---

## Party Type Taxonomy

| Type | Display Name | Ages | Venues |
|------|--------------|------|--------|
| `active_play` | Active Play | 3-16 | Trampoline parks, gyms, skating rinks, pools |
| `creative` | Creative | 4-14 | Art studios, cooking classes, science centers |
| `amusement` | Amusement | 5-18 | Arcades, theaters, escape rooms, bowling |
| `outdoor` | Outdoor | 3-16 | Parks, zoos, farms, adventure parks |
| `characters_performers` | Characters & Performers | 2-10 | Entertainment venues, event spaces |
| `social_dining` | Social & Dining | 1-18 | Restaurants, cafes, party rooms |

## Idea Cards (Landing Page)

| Card | Category | Query |
|------|----------|-------|
| Trampoline Parks | Active Play | trampoline park birthday party |
| Escape Rooms | Adventure | escape room birthday party |
| Bowling | Bowling | bowling alley birthday party |
| Arcade Games | Amusement | arcade birthday party |
| Nature & Outdoors | Outdoor | outdoor birthday party venues |
| Art & Craft Parties | Creative | art studio birthday party |
| Cooking Classes | Creative | cooking class birthday party |
| Pizza Party | Food | pizza restaurant birthday party |
| Bakery & Cake | Food | bakery cake birthday party |
| Food Trucks | Food | food truck birthday party catering |
| BBQ & Grill | Food | bbq restaurant birthday party |

---

## Match Score Algorithm

| Factor | Max Points | Calculation |
|--------|------------|-------------|
| Age Appropriateness | 25 | Is venue suitable for child's age? |
| Budget Match | 25 | Estimated cost within user's budget? |
| Capacity Match | 20 | Can venue handle guest count? |
| Distance | 15 | Within preferred travel distance? |
| Rating Quality | 10 | Google rating + review count |
| Venue Type Match | 5 | Direct match to party type? |

---

## Non-Functional Requirements

### Performance
- Page load: < 2 seconds
- API response: < 3 seconds
- Venue search: < 5 seconds
- Chat first token: < 2 seconds

### Scalability
- Cloud Run auto-scaling (0-10 instances)
- Stateless backend design
- SSE connections handled per-request with cancellation on client disconnect

### Security
- No PII stored beyond Firebase UID + saved events
- API keys and service account credentials in Secret Manager
- Firebase Authentication for user sign-in (optional — core features work unauthenticated)
- HTTPS only

### Availability
- 99.5% uptime target
- Graceful degradation on API failures

---

## Future Enhancements

### Phase 2
- [x] User accounts (Firebase Authentication — Google + email/password)
- [x] Saved events (heart venues, persist across sessions)
- [x] AI chat assistant with SSE streaming
- [x] Landing page with idea cards and personas
- [ ] Venue reviews from parents
- [ ] Direct booking integration
- [ ] Party checklist generator

### Phase 3
- [ ] Vendor marketplace (cakes, decorations)
- [ ] Party invitation creator
- [ ] Budget tracker
- [ ] Mobile app (React Native)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Wizard completion rate | > 60% |
| Venue click-through rate | > 40% |
| Return visitors | > 25% |
| Average session duration | > 3 minutes |

---

## Glossary

| Term | Definition |
|------|------------|
| Match Score | 0-100 rating of how well a venue fits user criteria |
| Party Type | Broad category of party activity |
| Wizard | Multi-step guided form for party planning |
| Venue | Location that hosts birthday parties |
| Chat Panel | AI-powered side panel that streams venue recommendations |
| Idea Card | Clickable card on landing page representing a party category |
| Persona Chip | Age-group shortcut (Little Kids, Tweens, Teens, Adults) that pre-fills age |
| SSE | Server-Sent Events — used for streaming chat responses from backend to frontend |
