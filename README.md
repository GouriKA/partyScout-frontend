# PartyScout Frontend

React-based wizard interface for the PartyScout birthday party planning application.

## Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.x
- **Styling**: CSS with custom properties
- **State**: React Context API
- **Server**: nginx (production)

## Quick Start

### Prerequisites

- Node.js 20+
- Backend running at `http://localhost:8080`

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   ```
   http://localhost:5173
   ```

## Project Structure

```
src/
├── App.jsx                      # Main component
├── App.css                      # Design system
├── context/
│   └── PartyPlannerContext.jsx  # State management
├── components/
│   ├── wizard/                  # Wizard steps
│   │   ├── WizardContainer.jsx
│   │   ├── StepIndicator.jsx
│   │   ├── Step1_ChildInfo.jsx
│   │   ├── Step2_Preferences.jsx
│   │   ├── Step3_Location.jsx
│   │   ├── Step4_VenueResults.jsx
│   │   └── Step5_PartyDetails.jsx
│   ├── venue/                   # Venue components
│   │   ├── VenueCard.jsx
│   │   └── VenueCompare.jsx
│   └── common/                  # Reusable UI
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Slider.jsx
└── main.jsx                     # Entry point
```

## Wizard Flow

```
Step 1: Child Info
   ↓
Step 2: Party Preferences
   ↓
Step 3: Location
   ↓
Step 4: Venue Results
   ↓
Step 5: Party Details
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |

Set at build time:
```bash
VITE_API_URL=https://api.example.com npm run build
```

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment

### Cloud Run

Uses `cloudbuild.yaml` for CI/CD:

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_VITE_API_URL="https://your-backend.run.app"
```

### Docker

```bash
docker build \
  --build-arg VITE_API_URL=https://your-backend.run.app \
  -t partyscout-frontend .

docker run -p 8080:8080 partyscout-frontend
```

## Design System

CSS custom properties in `App.css`:

```css
:root {
  --primary: #6366f1;      /* Indigo */
  --secondary: #ec4899;    /* Pink */
  --success: #10b981;      /* Green */
  --warning: #f59e0b;      /* Amber */
}
```

## License

Private - All rights reserved
