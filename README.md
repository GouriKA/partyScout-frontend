# PartyScout Frontend

React 19 single-page application for planning parties and events. Includes an AI-powered chat assistant (Scout), a guided planning wizard, venue search with indoor/outdoor filtering, saved events, weather forecasts, and user authentication via Firebase.

## Tech Stack

- **Framework**: React 19 + Vite 7
- **State**: React Context + useReducer
- **Auth**: Firebase Authentication
- **Tests**: Vitest + React Testing Library (unit/integration), Playwright (E2E)
- **Linting**: ESLint 9
- **Server**: nginx (production)

## Quick Start

### Prerequisites

- Node.js 20+
- Backend running at `http://localhost:8080`

### Local Development

```bash
npm install
npm run dev        # http://localhost:5173
```

## Project Structure

```
src/
├── App.jsx                          # Root — providers + routing
├── App.css                          # Global design system + CSS variables
├── context/
│   ├── PartyPlannerContext.jsx       # Wizard state, all API calls, venue search
│   ├── AuthContext.jsx               # Firebase auth state
│   └── SavedEventsContext.jsx        # Saved events state
├── components/
│   ├── landing/
│   │   ├── LandingPage.jsx           # Landing page with unified search bar + AI chat
│   │   └── LandingPage.css
│   ├── wizard/
│   │   ├── WizardContainer.jsx       # Step router
│   │   ├── StepIndicator.jsx         # Progress bar
│   │   ├── Step1_ChildInfo.jsx       # Name, age, party date
│   │   ├── Step2_Preferences.jsx     # Party type, guest count, budget
│   │   ├── Step3_Location.jsx        # City, indoor/outdoor, distance
│   │   ├── Step4_VenueResults.jsx    # Venue list with filter + sort chips
│   │   └── Step5_PartyDetails.jsx    # Selected venue details
│   ├── venue/
│   │   ├── VenueCard.jsx             # Venue card with weather, save, compare
│   │   ├── VenueCompare.jsx          # Side-by-side comparison (max 3)
│   │   └── VenueFilters.jsx          # Rating/price/setting filter selects
│   ├── savedevents/
│   │   ├── SavedEventsPage.jsx       # Saved events list
│   │   └── SaveModal.jsx             # Save event modal
│   └── common/
│       ├── Button.jsx                # Shared button (loading state, variants)
│       ├── Input.jsx                 # Labeled input with hint
│       ├── FeedbackModal.jsx         # Feedback form (pre-filled from auth)
│       ├── PartyTypeSelector.jsx     # Multi-select dropdown (max 3)
│       └── Slider.jsx                # Range slider
e2e/
├── fixtures/mock-data.js             # Shared API mocks + helpers
├── party-wizard.spec.js
├── venue-compare.spec.js
├── venue-search.spec.js
└── partyScout.spec.js
```

## Key User Flows

### Landing Page
Unified search bar (city + guests | description | Find →) launches directly into venue results. AI chat assistant (Scout) can also be used to find venues conversationally.

### Wizard Flow
Step-by-step guided planning: child info → party preferences → location → venue results → party details.

### Chat (Scout)
SSE streaming chat that extracts intent (city, age, occasion, indoor/outdoor) and returns venue cards inline. Supports all event types and age groups.

### Saved Events
Authenticated users can save venues with event date, guest count, and party types. Accessible from the nav.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend base URL | `http://localhost:8080` |
| `VITE_FIREBASE_*` | Firebase config keys | — |

## Commands

```bash
npm run dev            # Dev server (port 5173)
npm run build          # Production build
npm run lint           # ESLint
npm run test           # Vitest (watch mode)
npm run test:run       # Vitest (single run)
npm run test:coverage  # Vitest with coverage
npm run test:e2e       # Playwright (headless)
npm run test:e2e:headed    # Playwright with browser
npm run test:e2e:ui        # Playwright interactive UI
```

## Design System

CSS variables in `App.css`:

```css
--primary:    #F0287A   /* Pink — buttons, accents */
--navy:       #1e2d6b   /* Navy — headings, borders */
--bg:         #f8f6ff   /* Soft lavender background */
--text:       #1a1a2e   /* Dark text */
--radius:     12px
```

## Deployment

Two environments: **canary** (staging) and **prod**. Both use Cloud Run via Cloud Build.

```bash
# Deploy frontend to canary
COMMIT_SHA=$(git rev-parse HEAD)
gcloud builds submit --config cloudbuild.yaml --substitutions=COMMIT_SHA=$COMMIT_SHA

# Prod is always promoted from the exact canary image — never rebuilt
IMAGE=$(gcloud run services describe partyscout-frontend-canary --region us-east1 --format="value(spec.template.spec.containers[0].image)")
gcloud run deploy partyscout-frontend --image $IMAGE --region us-central1 --quiet
```

The load balancer at `partyscout.app` routes `/api/*` to the backend and `/*` to the frontend. Infrastructure is managed via Terraform in `./terraform/`.

## License

Private — All rights reserved
