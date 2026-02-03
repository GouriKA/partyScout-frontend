# PartyScout - Product Specification

## Overview

PartyScout is a parent-centric birthday party planning application that helps families find and book the perfect party venue based on their child's age, interests, and preferences.

## Problem Statement

Planning a child's birthday party is stressful for parents:
- Too many venue options with no clear way to filter
- Difficulty matching venues to age-appropriate activities
- Unclear pricing and what's included
- No easy way to compare options

## Solution

A guided 5-step wizard that mirrors how parents actually think about party planning:

```
"I need to plan Emma's 7th birthday"
        ↓
"What kind of party should I throw?"
        ↓
"What's my budget? How many kids?"
        ↓
"Indoor or outdoor? How far?"
        ↓
"Which venues can handle this?"
        ↓
"What's included? What do I bring?"
```

## Target Users

- **Primary**: Parents planning birthday parties for children ages 1-18
- **Secondary**: Grandparents, family members organizing parties

## Core Features

### 1. Child Information (Step 1)
- Child's name (optional, for personalization)
- Child's age (drives party type suggestions)
- Party date selection

### 2. Party Preferences (Step 2)
- **Party Type Selection**: 6 broad categories
  - Active Play (trampoline, gymnastics, skating, swimming)
  - Creative (arts, crafts, cooking, science)
  - Amusement (arcade, movies, escape rooms, bowling)
  - Outdoor (parks, zoos, farms, adventure)
  - Characters & Performers (magicians, princesses, entertainers)
  - Social & Dining (restaurants, cafes, party rooms)
- Guest count input
- Budget range slider

### 3. Location & Logistics (Step 3)
- ZIP code entry
- Indoor/Outdoor/Any preference
- Maximum distance willing to travel (miles)

### 4. Venue Results (Step 4)
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

### 5. Party Details (Step 5)
- Selected venue information
- What's included
- What you need to bring
- Suggested add-ons
- Contact/booking information
- Estimated total cost

## Technical Architecture

### Frontend
- **Framework**: React 19 with Vite
- **State Management**: React Context API
- **Styling**: Custom CSS with CSS variables
- **Hosting**: Google Cloud Run

### Backend
- **Framework**: Spring Boot 3.3.5 with Kotlin
- **API Style**: RESTful JSON
- **External APIs**: Google Places API (New)
- **Hosting**: Google Cloud Run
- **Secrets**: Google Secret Manager

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Google Places  │
│   (React)   │◀────│  (Kotlin)   │◀────│      API        │
└─────────────┘     └─────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Secret    │
                    │   Manager   │
                    └─────────────┘
```

## Party Type Taxonomy

| Type | Display Name | Ages | Venues |
|------|--------------|------|--------|
| `active_play` | Active Play | 3-16 | Trampoline parks, gyms, skating rinks, pools |
| `creative` | Creative | 4-14 | Art studios, cooking classes, science centers |
| `amusement` | Amusement | 5-18 | Arcades, theaters, escape rooms, bowling |
| `outdoor` | Outdoor | 3-16 | Parks, zoos, farms, adventure parks |
| `characters_performers` | Characters & Performers | 2-10 | Entertainment venues, event spaces |
| `social_dining` | Social & Dining | 1-18 | Restaurants, cafes, party rooms |

## Match Score Algorithm

| Factor | Max Points | Calculation |
|--------|------------|-------------|
| Age Appropriateness | 25 | Is venue suitable for child's age? |
| Budget Match | 25 | Estimated cost within user's budget? |
| Capacity Match | 20 | Can venue handle guest count? |
| Distance | 15 | Within preferred travel distance? |
| Rating Quality | 10 | Google rating + review count |
| Venue Type Match | 5 | Direct match to party type? |

## Non-Functional Requirements

### Performance
- Page load: < 2 seconds
- API response: < 3 seconds
- Venue search: < 5 seconds

### Scalability
- Cloud Run auto-scaling (0-10 instances)
- Stateless backend design

### Security
- No PII stored
- API keys in Secret Manager
- HTTPS only

### Availability
- 99.5% uptime target
- Graceful degradation on API failures

## Future Enhancements

### Phase 2
- [ ] User accounts and saved searches
- [ ] Venue reviews from parents
- [ ] Direct booking integration
- [ ] Party checklist generator

### Phase 3
- [ ] Vendor marketplace (cakes, decorations)
- [ ] Party invitation creator
- [ ] Budget tracker
- [ ] Mobile app (React Native)

## Success Metrics

| Metric | Target |
|--------|--------|
| Wizard completion rate | > 60% |
| Venue click-through rate | > 40% |
| Return visitors | > 25% |
| Average session duration | > 3 minutes |

## Glossary

| Term | Definition |
|------|------------|
| Match Score | 0-100 rating of how well a venue fits user criteria |
| Party Type | Broad category of party activity |
| Wizard | Multi-step guided form for party planning |
| Venue | Location that hosts birthday parties |
