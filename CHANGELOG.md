# Changelog

All notable changes to PartyScout Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Direct venue booking integration
- Party checklist generator
- Mobile app

---

## [3.0.0] - 2026-03-31

### Added
- **Landing Page** — unified search bar (city + guests | description | Find) launches venue results directly; idea cards for quick inspiration
- **AI Chat (Scout)** — SSE streaming chat assistant embedded in the landing page
  - Conversational intent gathering (city, age, occasion, indoor/outdoor, themes)
  - Inline venue cards rendered after `[VENUES]` payload
  - Maintains conversation history; known venues passed back for follow-up questions
- **Firebase Authentication** — Google + email/password sign-in via `AuthContext`; auth modal in nav
- **Saved Events** — authenticated users can save venues with event date, guest count, party types
  - `SavedEventsPage` lists all saved events
  - `SaveModal` captures event details before saving
  - `SavedEventsContext` manages state and API calls
- **Feedback Modal** — `FeedbackModal` pre-fills name/email from auth; submits to backend
- **Venue filter fix** — Indoor/Outdoor chips now include venues with `setting === 'both'` (previously showed blank for many cities)
- `VenueFilters` component — rating/price/setting filter selects in Step 4
- **Weather forecast** shown on venue cards (date-based)

### Changed
- `PartyPlannerContext` — search now uses city name (not ZIP code); setting filter correctly includes `'both'` venues
- `AuthContext` added alongside `PartyPlannerContext` and new `SavedEventsContext`
- Step 3 location input changed from ZIP code to city name

---

## [2.1.0] - 2026-01-29

### Changed
- Simplified party types from 12 specific categories to 6 broad categories
  - Active Play, Creative, Amusement, Outdoor, Characters & Performers, Social & Dining

### Added
- Comprehensive documentation suite

---

## [2.0.0] - 2026-01-28

### Added
- 5-Step Party Planning Wizard
- Smart Venue Matching display with match score
- Venue Details (Step 5) with what's included and add-ons
- Compare Mode — select up to 3 venues side-by-side
- React Context + useReducer state management
- CSS design system with custom properties

---

## [1.0.0] - 2026-01-27

### Added
- Initial release — basic venue search, Google Places results display

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 3.0.0 | 2026-03-31 | AI chat, landing page, saved events, Firebase auth, feedback, venue filter fix |
| 2.1.0 | 2026-01-29 | Simplified to 6 party types, docs |
| 2.0.0 | 2026-01-28 | 5-step wizard, smart matching, compare mode |
| 1.0.0 | 2026-01-27 | Initial release |

---

[Unreleased]: https://github.com/GouriKA/partyScout-frontend/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/GouriKA/partyScout-frontend/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/GouriKA/partyScout-frontend/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/GouriKA/partyScout-frontend/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/GouriKA/partyScout-frontend/releases/tag/v1.0.0
