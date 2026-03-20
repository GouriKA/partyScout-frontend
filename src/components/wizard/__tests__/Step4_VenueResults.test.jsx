import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step4_VenueResults from '../Step4_VenueResults';
import { PartyPlannerProvider, usePartyPlanner } from '../../../context/PartyPlannerContext';
import { AuthProvider } from '../../../context/AuthContext';
import { SavedEventsProvider } from '../../../context/SavedEventsContext';
import { useEffect } from 'react';

const mockVenues = [
  {
    id: 'venue-1',
    name: 'Sky Zone Trampoline Park',
    address: '123 Jump St, San Francisco, CA 94105',
    rating: 4.5,
    userRatingsTotal: 234,
    distanceInMiles: 2.3,
    setting: 'indoor',
    matchScore: 87,
    matchReasons: ['Great for ages 5-12', 'Within your budget'],
    estimatedTotal: 350,
    estimatedPricePerPerson: 23,
    includedItems: ['2 hours jump time', 'Party room'],
    notIncluded: ['Food', 'Cake'],
    suggestedAddOns: [],
    typicalPartyDuration: '2 hours'
  },
  {
    id: 'venue-2',
    name: 'Fun Factory Arcade',
    address: '456 Game Ave, San Francisco, CA 94105',
    rating: 4.2,
    userRatingsTotal: 150,
    distanceInMiles: 3.5,
    setting: 'indoor',
    matchScore: 75,
    matchReasons: ['Good for groups'],
    estimatedTotal: 280,
    estimatedPricePerPerson: 19,
    includedItems: ['Game cards', 'Party area'],
    notIncluded: ['Food'],
    suggestedAddOns: [],
    typicalPartyDuration: '2 hours'
  },
  {
    id: 'venue-3',
    name: 'Outdoor Adventure Park',
    address: '789 Nature Blvd, San Francisco, CA 94105',
    rating: 4.8,
    userRatingsTotal: 320,
    distanceInMiles: 5.0,
    setting: 'outdoor',
    matchScore: 82,
    matchReasons: ['Beautiful outdoor setting'],
    estimatedTotal: 420,
    estimatedPricePerPerson: 28,
    includedItems: ['Pavilion rental', 'Activities'],
    notIncluded: ['Food', 'Decorations'],
    suggestedAddOns: [],
    typicalPartyDuration: '3 hours'
  }
];

// Helper component to set up venues in context
function TestWrapper({ children, venues = mockVenues, loading = false, error = null }) {
  return (
    <AuthProvider>
      <SavedEventsProvider>
        <PartyPlannerProvider>
          <VenuesSetter venues={venues} loading={loading} error={error} />
          {children}
        </PartyPlannerProvider>
      </SavedEventsProvider>
    </AuthProvider>
  );
}

function VenuesSetter({ venues, loading, error }) {
  const { setVenues, setLoading, setError, updatePreferences } = usePartyPlanner();

  useEffect(() => {
    updatePreferences({ guestCount: 15 });
    setLoading(loading);
    if (error) {
      setError(error);
    } else if (!loading) {
      setVenues({ venues, persona: null, llmFilterApplied: null });
    }
  }, [venues, loading, error]);

  return null;
}

describe('Step4_VenueResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders venue count in title', () => {
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    expect(screen.getByText(/3 venues found/i)).toBeInTheDocument();
  });

  it('renders all venues', () => {
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
    expect(screen.getByText('Fun Factory Arcade')).toBeInTheDocument();
    expect(screen.getByText('Outdoor Adventure Park')).toBeInTheDocument();
  });

  it('renders sort options', () => {
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
  });

  it('renders filter chips', () => {
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Indoor')).toBeInTheDocument();
    expect(screen.getByText('Outdoor')).toBeInTheDocument();
    expect(screen.getByText('4+ Stars')).toBeInTheDocument();
  });

  it('filters venues by indoor setting', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    const indoorFilter = screen.getByText('Indoor');
    await user.click(indoorFilter);

    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
    expect(screen.getByText('Fun Factory Arcade')).toBeInTheDocument();
    expect(screen.queryByText('Outdoor Adventure Park')).not.toBeInTheDocument();
  });

  it('filters venues by outdoor setting', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    const outdoorFilter = screen.getByText('Outdoor');
    await user.click(outdoorFilter);

    expect(screen.queryByText('Sky Zone Trampoline Park')).not.toBeInTheDocument();
    expect(screen.getByText('Outdoor Adventure Park')).toBeInTheDocument();
  });

  it('filters venues by high rating', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    const highRatedFilter = screen.getByText('4+ Stars');
    await user.click(highRatedFilter);

    // All three have 4+ rating
    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
    expect(screen.getByText('Fun Factory Arcade')).toBeInTheDocument();
    expect(screen.getByText('Outdoor Adventure Park')).toBeInTheDocument();
  });

  it('changes sort order when sort is changed', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.selectOptions(sortSelect, 'rating');

    // Verify sort option changed
    expect(sortSelect).toHaveValue('rating');
  });

  it('shows loading state', () => {
    render(
      <TestWrapper loading={true}>
        <Step4_VenueResults />
      </TestWrapper>
    );

    expect(screen.getByText(/finding perfect venues/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <TestWrapper error="Network error occurred">
        <Step4_VenueResults />
      </TestWrapper>
    );

    // h3 shows "Something went wrong", p shows the error message
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('shows empty state when no venues match filter', async () => {
    const user = userEvent.setup();
    const venuesNoOutdoor = mockVenues.filter(v => v.setting === 'indoor');

    render(
      <TestWrapper venues={venuesNoOutdoor}>
        <Step4_VenueResults />
      </TestWrapper>
    );

    const outdoorFilter = screen.getByText('Outdoor');
    await user.click(outdoorFilter);

    expect(screen.getByText(/no venues match your filters/i)).toBeInTheDocument();
  });

  it('has a back button', () => {
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('shows compare checkboxes on venue cards', () => {
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    // Find compare checkboxes
    const compareCheckboxes = screen.getAllByLabelText(/compare/i);
    expect(compareCheckboxes.length).toBe(3);
  });

  it('shows hint text about selecting venues', () => {
    render(
      <TestWrapper>
        <Step4_VenueResults />
      </TestWrapper>
    );

    expect(screen.getByText(/select a venue to see full details/i)).toBeInTheDocument();
  });
});

describe('weather fetching', () => {
  const indoorOnlyVenues = mockVenues.filter(v => v.setting === 'indoor');

  const outdoorVenue = mockVenues.find(v => v.setting === 'outdoor');

  // A date within the next 30 days from test date (2026-03-17)
  const nearFutureDate = '2026-04-01T14:00';
  const validZip = '94105';

  function WeatherTestWrapper({ children, venues, partyDate, zipCode }) {
    return (
      <AuthProvider>
        <SavedEventsProvider>
          <PartyPlannerProvider>
            <WeatherContextSetter venues={venues} partyDate={partyDate} zipCode={zipCode} />
            {children}
          </PartyPlannerProvider>
        </SavedEventsProvider>
      </AuthProvider>
    );
  }

  function WeatherContextSetter({ venues, partyDate, zipCode }) {
    const { setVenues, updatePreferences, updateChildInfo, updateLocation } = usePartyPlanner();

    useEffect(() => {
      updatePreferences({ guestCount: 15 });
      updateChildInfo({ partyDate: partyDate || null });
      updateLocation({ zipCode: zipCode || '' });
      setVenues({ venues, persona: null, llmFilterApplied: null });
    }, [venues, partyDate, zipCode]);

    return null;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });
  });

  it('does not call fetchWeatherForecast when all venues are indoor', async () => {
    const { waitFor } = await import('@testing-library/react');

    render(
      <WeatherTestWrapper
        venues={indoorOnlyVenues}
        partyDate={nearFutureDate}
        zipCode={validZip}
      >
        <Step4_VenueResults />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/venues found/i)).toBeInTheDocument();
    });

    const weatherCalls = global.fetch.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.includes('/api/v2/weather/forecast')
    );
    expect(weatherCalls).toHaveLength(0);
  });

  it('calls fetchWeatherForecast when outdoor venue exists with date and 5-digit zip', async () => {
    const { waitFor } = await import('@testing-library/react');

    render(
      <WeatherTestWrapper
        venues={mockVenues}
        partyDate={nearFutureDate}
        zipCode={validZip}
      >
        <Step4_VenueResults />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      const weatherCalls = global.fetch.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.includes('/api/v2/weather/forecast')
      );
      expect(weatherCalls).toHaveLength(1);
    });
  });

  it('does not call fetchWeatherForecast when zip is less than 5 digits', async () => {
    const { waitFor } = await import('@testing-library/react');

    render(
      <WeatherTestWrapper
        venues={mockVenues}
        partyDate={nearFutureDate}
        zipCode="941"
      >
        <Step4_VenueResults />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/venues found/i)).toBeInTheDocument();
    });

    const weatherCalls = global.fetch.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.includes('/api/v2/weather/forecast')
    );
    expect(weatherCalls).toHaveLength(0);
  });

  it('does not call fetchWeatherForecast when partyDate is missing', async () => {
    const { waitFor } = await import('@testing-library/react');

    render(
      <WeatherTestWrapper
        venues={mockVenues}
        partyDate={null}
        zipCode={validZip}
      >
        <Step4_VenueResults />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/venues found/i)).toBeInTheDocument();
    });

    const weatherCalls = global.fetch.mock.calls.filter(
      ([url]) => typeof url === 'string' && url.includes('/api/v2/weather/forecast')
    );
    expect(weatherCalls).toHaveLength(0);
  });
});
