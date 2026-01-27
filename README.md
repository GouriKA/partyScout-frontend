# PartyScout Frontend 🎉

React web application for finding birthday party venues. Modern UI with real-time venue search and beautiful results display.

## Features

- 🎂 Intuitive search form (age, ZIP code, date/time)
- 📍 Real-time venue search
- ⭐ Beautiful venue cards with ratings and details
- 🎪 Kid-friendly feature badges
- 📱 Responsive design for mobile and desktop
- ✨ Smooth animations and transitions
- 🎨 Modern gradient UI design

## Tech Stack

- **React** 19
- **Vite** 7.2.4
- **Modern CSS** with animations
- **Fetch API** for backend communication

## Prerequisites

- Node.js 16 or higher
- PartyScout Backend running on http://localhost:8080

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend URL

The app is configured to call the backend at `http://localhost:8080`. If your backend is running on a different URL, update the fetch URL in `src/App.jsx`:

```javascript
const response = await fetch('http://localhost:8080/api/birthdays/search', {
  // ...
})
```

### 3. Start Development Server

```bash
npm run dev
```

The app will start on http://localhost:5173

## Project Structure

```
src/
├── App.jsx                      # Main app component
├── App.css                      # App styles
├── components/
│   ├── SearchForm.jsx           # Search form component
│   ├── SearchForm.css           # Form styles
│   ├── VenueResults.jsx         # Results display component
│   └── VenueResults.css         # Results styles
├── main.jsx                     # Entry point
└── index.css                    # Global styles
```

## Usage

1. Open http://localhost:5173 in your browser
2. Fill in the search form:
   - **Age**: Enter the birthday person's age (1-150)
   - **ZIP Code**: Enter a 5-digit US ZIP code (e.g., 94102)
   - **Date & Time**: Select the party date and time
3. Click "🎉 Find Venues"
4. Browse results with:
   - Venue name and rating
   - Address and distance
   - Price range and capacity
   - Kid-friendly features
   - Contact information

## Screenshots

### Search Form
Clean, modern form with validation and real-time feedback.

### Venue Results
Beautiful cards displaying:
- Venue rating with star icon
- Distance from your location
- Price range and estimated capacity
- Kid-friendly features (play area, kids menu, high chairs)
- Entertainment options
- Phone number and website links

## Features in Detail

### Age-Based Search
The app automatically searches for age-appropriate venues:
- **Kids (≤12)**: Playgrounds, amusement parks, bowling alleys
- **Teens (13-18)**: Arcades, movie theaters, sports complexes
- **Adults (18+)**: Restaurants, bars, banquet halls

### Responsive Design
- Mobile-friendly grid layout
- Touch-optimized buttons
- Readable fonts on all screen sizes
- Smooth scrolling and transitions

### Error Handling
- Form validation
- Network error messages
- Empty state handling
- Loading indicators

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

Preview production build:
```bash
npm run preview
```

## Backend

The backend Kotlin Spring Boot API is in a separate repository: [partyScout-backend](https://github.com/GouriKA/partyScout-backend)

## Environment Variables

No environment variables required. The backend URL is hardcoded in `App.jsx`.

To use environment variables:

1. Create `.env` file:
```env
VITE_API_URL=http://localhost:8080
```

2. Update `App.jsx`:
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/birthdays/search`, {
  // ...
})
```

## License

MIT License
