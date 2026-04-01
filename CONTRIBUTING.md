# Contributing to PartyScout Frontend

Thank you for your interest in contributing to PartyScout! This document provides guidelines for the frontend React application.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Backend running at `http://localhost:8080`

### Setup

```bash
git clone https://github.com/GouriKA/partyScout-frontend.git
cd partyScout-frontend
npm install
npm run dev    # http://localhost:5173
```

**Optional**: Set `VITE_FIREBASE_*` env vars for auth features. Without them, login and saved events are unavailable but venue search and chat work.

The backend needs `GOOGLE_PLACES_API_KEY` and `ANTHROPIC_API_KEY` set for full functionality.

---

## Development Workflow

### Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/short-description` | `feature/add-saved-events` |
| Bug fix | `fix/short-description` | `fix/outdoor-filter-blank` |
| Docs | `docs/short-description` | `docs/update-user-guide` |
| Refactor | `refactor/short-description` | `refactor/extract-venue-hook` |

### Workflow Steps

```bash
git checkout -b feature/my-feature
# ... make changes ...
npm run lint
npm run build
npm run test:run
git push origin feature/my-feature
```

---

## Coding Standards

### Components

```javascript
// Good: Functional component, destructured props, callback memoized
function VenueCard({ venue, onSelect, isComparing }) {
  const handleClick = useCallback(() => onSelect(venue), [venue, onSelect]);
  return (
    <div className="venue-card" onClick={handleClick}>
      <h3>{venue.name}</h3>
    </div>
  );
}
```

**Rules**:
- Functional components with hooks only
- All API calls in context files — never fetch directly from components
- CSS co-located with each component (`.css` alongside `.jsx`)
- Unit tests in `__tests__/` subdirectory alongside the component

### CSS

```css
/* Good: CSS variables from App.css */
.venue-card {
  padding: var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--navy);
}
```

Use CSS variables defined in `App.css` — never hardcode colors or radii.

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(chat): add SSE streaming AI chat panel
fix(filter): include 'both' venues in indoor/outdoor chip filter
docs(user-guide): add saved events section
test(venue-card): add unit tests for compare mode
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change, no new feature |
| `test` | Adding tests |
| `chore` | Maintenance |

---

## Testing

### Testing Convention

**After every code commit, create a separate follow-up commit with tests.** Never bundle test changes in the same commit as feature/fix code.

### Unit Tests (Vitest + React Testing Library)

```javascript
describe('VenueCard', () => {
  it('shows venue name and rating', () => {
    render(<VenueCard venue={{ name: 'Sky Zone', rating: 4.5 }} />);
    expect(screen.getByText('Sky Zone')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });
});
```

Unit tests live in `src/**/__tests__/`.

### Integration Tests

Integration tests live in `src/integration/__tests__/`.

### E2E Tests (Playwright)

```javascript
import { setupApiMocks, getFutureDate } from './fixtures/mock-data.js';

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page);
  await page.goto('/');
});
```

**E2E Rules**:
- Always call `setupApiMocks(page)` in `beforeEach` — never hit a real backend
- Wait for party-types API response after filling age input before interacting with `PartyTypeSelector`
- `PartyTypeSelector` is a dropdown — click `.party-type-trigger` first, then `.party-type-option`

### Commands

```bash
npm run test:run          # Vitest single run
npm run test:coverage     # Vitest with coverage report
npm run test:e2e          # Playwright headless
npm run test:e2e:headed   # Playwright with browser
npm run test:e2e:ui       # Playwright interactive UI
```

---

## Documentation

- New features → update `docs/USER_GUIDE.md` and `CHANGELOG.md`
- New API calls → update `CLAUDE.md` API table
- Architecture changes → coordinate with backend `docs/ARCHITECTURE.md`

---

## Questions?

- Open an issue for bugs or feature requests
- Email: scout@partyscout.live
