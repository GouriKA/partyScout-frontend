/**
 * Mock data fixtures for E2E tests
 */

export const mockPartyTypeSuggestions = [
  {
    type: 'active_play',
    displayName: 'Active Play',
    description: 'Trampolines, sports complexes, and physical activities',
    icon: '🏃',
    ageRange: 'Ages 3-16',
    averageCost: '$300-$500',
    popularityScore: 5
  },
  {
    type: 'creative',
    displayName: 'Creative',
    description: 'Arts, crafts, STEM activities',
    icon: '🎨',
    ageRange: 'Ages 4-14',
    averageCost: '$250-$400',
    popularityScore: 4
  },
  {
    type: 'amusement',
    displayName: 'Amusement',
    description: 'Arcades, movies, escape rooms',
    icon: '🎮',
    ageRange: 'Ages 5-18',
    averageCost: '$350-$600',
    popularityScore: 5
  },
  {
    type: 'outdoor',
    displayName: 'Outdoor',
    description: 'Parks, zoos, nature activities',
    icon: '🌲',
    ageRange: 'Ages 3-16',
    averageCost: '$100-$300',
    popularityScore: 3
  },
  {
    type: 'characters_performers',
    displayName: 'Characters & Performers',
    description: 'Magicians, princesses, entertainers',
    icon: '🎭',
    ageRange: 'Ages 2-10',
    averageCost: '$200-$400',
    popularityScore: 4
  },
  {
    type: 'social_dining',
    displayName: 'Social Dining',
    description: 'Restaurants, cafes, food-focused parties',
    icon: '🍕',
    ageRange: 'Ages 1-18',
    averageCost: '$200-$500',
    popularityScore: 3
  }
];

export const mockVenues = [
  {
    id: 'venue-1',
    name: 'Sky Zone Trampoline Park',
    address: '123 Jump St, San Francisco, CA 94105',
    rating: 4.5,
    userRatingsTotal: 234,
    phoneNumber: '(415) 555-0123',
    website: 'https://skyzone.com',
    distanceInMiles: 2.3,
    priceLevel: 2,
    setting: 'indoor',
    matchScore: 87,
    matchReasons: ['Great for ages 5-12', 'Within your budget', 'Highly rated'],
    estimatedTotal: 350,
    estimatedPricePerPerson: 23,
    includedItems: ['2 hours jump time', 'Party room', 'Party host'],
    notIncluded: ['Food', 'Cake', 'Decorations'],
    suggestedAddOns: [
      { name: 'Pizza & Drinks', cost: 150, recommended: true },
      { name: 'Goodie Bags', cost: 75, recommended: false }
    ],
    popularForAges: 'Best for ages 5-12',
    typicalPartyDuration: '2 hours'
  },
  {
    id: 'venue-2',
    name: 'Chuck E. Cheese',
    address: '456 Fun Ave, San Francisco, CA 94105',
    rating: 4.0,
    userRatingsTotal: 156,
    phoneNumber: '(415) 555-0456',
    distanceInMiles: 3.5,
    priceLevel: 1,
    setting: 'indoor',
    matchScore: 72,
    matchReasons: ['Budget-friendly', 'Great for kids', 'All-inclusive'],
    estimatedTotal: 250,
    estimatedPricePerPerson: 17,
    includedItems: ['Game tokens', 'Pizza', 'Drinks', 'Party host'],
    notIncluded: ['Cake', 'Goodie bags'],
    suggestedAddOns: [
      { name: 'Extra tokens', cost: 50, recommended: true }
    ],
    popularForAges: 'Best for ages 3-10',
    typicalPartyDuration: '2.5 hours'
  },
  {
    id: 'venue-3',
    name: 'Golden Gate Park Pavilion',
    address: '789 Park Blvd, San Francisco, CA 94105',
    rating: 4.8,
    userRatingsTotal: 500,
    phoneNumber: '(415) 555-0789',
    website: 'https://sfrecpark.org',
    distanceInMiles: 5.0,
    priceLevel: 0,
    setting: 'outdoor',
    matchScore: 65,
    matchReasons: ['Beautiful outdoor setting', 'Very affordable', 'Highly rated'],
    estimatedTotal: 100,
    estimatedPricePerPerson: 7,
    includedItems: ['Pavilion rental', 'Picnic tables', 'Restroom access'],
    notIncluded: ['Food', 'Decorations', 'Entertainment', 'Setup/Cleanup'],
    suggestedAddOns: [
      { name: 'Catering', cost: 300, recommended: true },
      { name: 'Bounce house rental', cost: 200, recommended: true }
    ],
    popularForAges: 'Best for ages 3-12',
    typicalPartyDuration: '3 hours'
  },
  {
    id: 'venue-4',
    name: 'Premium Party Palace',
    address: '999 Luxury Lane, San Francisco, CA 94105',
    rating: 4.9,
    userRatingsTotal: 100,
    phoneNumber: '(415) 555-9999',
    website: 'https://premiumparty.com',
    distanceInMiles: 8.0,
    priceLevel: 4,
    setting: 'indoor',
    matchScore: 55,
    matchReasons: ['Premium experience', 'Over budget'],
    estimatedTotal: 800,
    estimatedPricePerPerson: 53,
    includedItems: ['Private venue', 'Catering', 'Entertainment', 'Decorations', 'Photography'],
    notIncluded: [],
    suggestedAddOns: [],
    popularForAges: 'Best for ages 5-15',
    typicalPartyDuration: '4 hours'
  }
];

export const mockBudgetEstimate = {
  estimatedTotal: 350,
  estimatedPerPerson: 23,
  budgetCategory: 'Moderate'
};

export const mockSearchResponse = {
  venues: mockVenues,
  partyTypeSuggestions: mockPartyTypeSuggestions.slice(0, 3)
};

/**
 * Setup API mocks for Playwright tests
 * @param {import('@playwright/test').Page} page
 */
export async function setupApiMocks(page) {
  // Mock party type suggestions endpoint
  await page.route('**/api/v2/party-wizard/party-types/*', async (route) => {
    const url = route.request().url();
    const age = parseInt(url.split('/').pop());

    // Filter suggestions by age
    const suggestions = mockPartyTypeSuggestions.filter(s => {
      const ageRange = s.ageRange;
      const match = ageRange.match(/Ages (\d+)-(\d+)/);
      if (match) {
        const minAge = parseInt(match[1]);
        const maxAge = parseInt(match[2]);
        return age >= minAge && age <= maxAge;
      }
      return true;
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(suggestions)
    });
  });

  // Mock budget estimate endpoint
  await page.route('**/api/v2/party-wizard/estimate-budget', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockBudgetEstimate)
    });
  });

  // Mock venue search endpoint
  await page.route('**/api/v2/party-wizard/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSearchResponse)
    });
  });
}

/**
 * Setup API mocks that return empty results
 * @param {import('@playwright/test').Page} page
 */
export async function setupEmptyApiMocks(page) {
  await page.route('**/api/v2/party-wizard/party-types/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.route('**/api/v2/party-wizard/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ venues: [] })
    });
  });
}

/**
 * Setup API mocks that return errors
 * @param {import('@playwright/test').Page} page
 */
export async function setupErrorApiMocks(page) {
  await page.route('**/api/v2/party-wizard/search', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    });
  });
}

/**
 * Helper to get a future datetime-local value (30 days from now)
 */
export function getFutureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  date.setHours(14, 0, 0, 0);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

/**
 * Navigate through Steps 1-3 to reach venue results (Step 4)
 * @param {import('@playwright/test').Page} page
 */
export async function navigateToVenueResults(page) {
  // Step 1: Fill child info
  await page.getByLabel(/child's name/i).fill('Emma');

  // Start waiting for party-types response before filling age (which triggers the fetch)
  const partyTypesPromise = page.waitForResponse('**/api/v2/party-wizard/party-types/*');
  await page.getByLabel(/how old/i).fill('7');
  await partyTypesPromise;

  await page.getByLabel(/when is the party/i).fill(getFutureDate());

  await page.getByRole('button', { name: /continue to party type/i }).click();

  // Step 2: Select a party type and proceed
  await page.locator('.party-type-card').first().click();
  await page.getByRole('button', { name: /continue to location/i }).click();

  // Step 3: Fill ZIP code and search
  await page.getByLabel(/zip code/i).fill('94105');

  const searchPromise = page.waitForResponse('**/api/v2/party-wizard/search');
  await page.getByRole('button', { name: /find venues/i }).click();
  await searchPromise;
}
