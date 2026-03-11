# PartyScout Frontend — CLAUDE.md

## Project Overview

React 19 single-page application for planning children's birthday parties. Users walk through a 5-step wizard to enter child info, select party preferences, choose a location, browse venue results, and view party details.

## Tech Stack

- **Framework**: React 19 with Vite 7
- **State management**: React Context + useReducer (`PartyPlannerContext`)
- **Unit tests**: Vitest + React Testing Library
- **E2E tests**: Playwright (Chromium)
- **Linting**: ESLint 9

## Project Structure

```
src/
  App.jsx                          # Root — wraps app in PartyPlannerProvider
  context/
    PartyPlannerContext.jsx        # Global state + all API calls
  components/
    wizard/
      WizardContainer.jsx          # Step router + header
      StepIndicator.jsx            # Progress bar (steps 1-5)
      Step1_ChildInfo.jsx          # Name, age, party date
      Step2_Preferences.jsx        # Party type, guest count, budget
      Step3_Location.jsx           # ZIP code, indoor/outdoor, distance
      Step4_VenueResults.jsx       # Venue list + filters
      Step5_PartyDetails.jsx       # Selected venue details & summary
    venue/
      VenueCard.jsx                # Individual venue card
      VenueCompare.jsx             # Side-by-side comparison modal (max 3)
      VenueFilters.jsx             # Rating, price, distance filters
    common/
      Button.jsx                   # Shared button with loading state
      Input.jsx                    # Labeled input with hint text
      PartyTypeSelector.jsx        # Custom multi-select dropdown (max 3 selections); trigger shows selected summary, panel shows icon + name + age range per option; closes on outside click
      Slider.jsx                   # Range slider with formatted label
e2e/
  fixtures/
    mock-data.js                   # Shared API mocks + helpers for all E2E tests
  party-wizard.spec.js             # Wizard flow, validation, navigation, persistence
  venue-compare.spec.js            # Compare modal behavior
  venue-search.spec.js             # Filters, sorting, empty states
  partyScout.spec.js               # Step-by-step wizard UI tests
```

## API

Backend base URL: `VITE_API_URL` env var (defaults to `http://localhost:8080`).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v2/party-wizard/party-types` | All party types (no age filter) |
| GET | `/api/v2/party-wizard/party-types/:age` | Age-filtered party type suggestions |
| POST | `/api/v2/party-wizard/estimate-budget` | Budget estimate for selected types |
| GET | `/api/v2/party-wizard/party-details` | Details for selected party types |
| POST | `/api/v2/party-wizard/search` | Venue search (returns venues + suggestions) |

## Commands

```bash
npm run dev           # Start Vite dev server on http://localhost:5173
npm run build         # Production build
npm run lint          # ESLint
npm run test          # Vitest (watch mode)
npm run test:run      # Vitest (single run)
npm run test:coverage # Vitest with coverage
npm run test:e2e      # Playwright E2E (headless)
npm run test:e2e:headed   # Playwright with browser visible
npm run test:e2e:ui       # Playwright interactive UI mode
```

## State Shape (PartyPlannerContext)

```js
{
  currentStep: 1,          // 1–5
  childInfo: { name, age, partyDate },
  preferences: { partyTypes[], guestCount, budget: { min, max } },
  location: { zipCode, setting, maxDistance, accessibility[] },
  venues: [],
  selectedVenue: null,
  compareVenues: [],        // up to 3
  partyTypeSuggestions: [],
  allPartyTypes: [],
  budgetEstimate: null,
  budgetEstimateLoading: false,
  partyDetails: null,
  loading: false,
  error: null
}
```

## Key Conventions

- All API calls live in `PartyPlannerContext.jsx` — never fetch directly from components.
- Components consume state via `usePartyPlanner()` hook only.
- CSS is co-located with each component (`.css` file alongside `.jsx`).
- Unit tests live in `__tests__/` subdirectory alongside the component folder.
- E2E tests always call `setupApiMocks(page)` in `beforeEach` — never hit a real backend.
- When navigating to Step 2 in E2E tests, wait for the party-types API response before interacting with `PartyTypeSelector` (the fetch is triggered by filling the age input).
- `PartyTypeSelector` is a dropdown — E2E tests must click `.party-type-trigger` to open it before clicking `.party-type-option` items.

## Infrastructure (Terraform)

Terraform config lives at `../terraform/` (project root, spans both frontend and backend).

### Architecture

```
Internet
  ├── :80  → HTTP proxy → 301 redirect to HTTPS
  └── :443 → HTTPS reverse proxy (TLS termination)
                  ├── /api, /api/* → partyscout-backend (Cloud Run)
                  └── /*           → partyscout-frontend (Cloud Run) + Cloud CDN
```

### Key resources

| Resource | Purpose |
|---|---|
| Static global IP | Fixed entry point — DNS A record points here |
| Google-managed SSL cert | Auto-provisioned TLS for `partyscout.app` |
| Serverless NEGs | Connect load balancer to each Cloud Run service |
| URL map | Path-based routing (`/api/*` → backend, `/*` → frontend) |
| HTTPS reverse proxy | TLS termination + URL-map routing |
| HTTP proxy | 301 HTTP → HTTPS redirect |

### Deploy

```bash
cd ../terraform
bash setup-state-bucket.sh        # once — creates GCS bucket for Terraform state
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

After applying, point `partyscout.app` DNS A record to the output IP. SSL cert provisions automatically (10–30 min).

### After LB is live — update API URL

Update `cloudbuild.yaml` so the frontend calls the LB instead of Cloud Run directly:

```yaml
substitutions:
  _VITE_API_URL: 'https://partyscout.app'
```

## E2E Testing Pattern

```js
import { setupApiMocks, getFutureDate } from './fixtures/mock-data.js';

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page);
  await page.goto('/');
});

// Wait for party-types response when filling age (triggers fetch)
const partyTypesPromise = page.waitForResponse('**/api/v2/party-wizard/party-types/*');
await page.getByLabel(/how old/i).fill('7');
await partyTypesPromise;
```
