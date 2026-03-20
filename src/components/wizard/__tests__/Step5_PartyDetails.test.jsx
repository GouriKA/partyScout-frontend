import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step5_PartyDetails from '../Step5_PartyDetails';
import { PartyPlannerProvider, usePartyPlanner } from '../../../context/PartyPlannerContext';
import { useEffect } from 'react';

const mockVenue = {
  id: 'venue-1',
  name: 'Sky Zone Trampoline Park',
  address: '123 Jump St, San Francisco, CA 94105',
  rating: 4.5,
  userRatingsTotal: 234,
  phoneNumber: '(415) 555-0123',
  website: 'https://skyzone.com',
  distanceInMiles: 2.3,
  setting: 'indoor',
  matchScore: 87,
  matchReasons: ['Great for ages 5-12', 'Within your budget'],
  estimatedTotal: 350,
  estimatedPricePerPerson: 23,
  includedItems: ['2 hours jump time', 'Party room', 'Dedicated host'],
  notIncluded: ['Food', 'Cake', 'Decorations'],
  suggestedAddOns: [
    {
      name: 'Extra Jump Time',
      description: 'Additional 30 minutes',
      estimatedCost: 50,
      isRecommended: true
    }
  ],
  typicalPartyDuration: '2 hours'
};

// Helper component to set up selected venue in context
function TestWrapper({ children, selectedVenue = mockVenue, childName = 'Emma', guestCount = 15 }) {
  return (
    <PartyPlannerProvider>
      <ContextSetter selectedVenue={selectedVenue} childName={childName} guestCount={guestCount} />
      {children}
    </PartyPlannerProvider>
  );
}

function ContextSetter({ selectedVenue, childName, guestCount }) {
  const { selectVenue, updateChildInfo, updatePreferences } = usePartyPlanner();

  useEffect(() => {
    updateChildInfo({ name: childName, partyDate: '2026-03-15T14:00' });
    updatePreferences({ guestCount });
    if (selectedVenue) {
      selectVenue(selectedVenue);
    }
  }, [selectedVenue, childName, guestCount]);

  return null;
}

describe('Step5_PartyDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders venue name in title', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText(/Emma's Party at Sky Zone Trampoline Park/i)).toBeInTheDocument();
  });

  it('renders venue address', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText('123 Jump St, San Francisco, CA 94105')).toBeInTheDocument();
  });

  it('renders match score', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('renders venue rating', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    // Rating is displayed as "★ 4.5"
    const ratingElement = document.querySelector('.venue-hero-rating');
    expect(ratingElement).toBeInTheDocument();
    expect(ratingElement.textContent).toContain('4.5');
  });

  it('renders distance', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText(/2.3 mi away/i)).toBeInTheDocument();
  });

  it('renders estimated total cost', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText('$350')).toBeInTheDocument();
  });

  it('renders per person cost', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText('$23/person')).toBeInTheDocument();
  });

  it('renders guest count', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    // Guest count appears in the info card with class info-value
    const guestCountElement = document.querySelector('.info-card .info-value');
    expect(guestCountElement).toBeInTheDocument();
    // Also check there's text mentioning 15 guests somewhere
    expect(screen.getAllByText(/15 guests/i).length).toBeGreaterThan(0);
  });

  it('renders party duration', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText('2 hours')).toBeInTheDocument();
  });

  it('renders included items', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText("What's Included")).toBeInTheDocument();
    expect(screen.getByText('2 hours jump time')).toBeInTheDocument();
    expect(screen.getByText('Party room')).toBeInTheDocument();
    expect(screen.getByText('Dedicated host')).toBeInTheDocument();
  });

  it('does not render "What You\'ll Need to Bring" section', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.queryByText("What You'll Need to Bring")).not.toBeInTheDocument();
  });

  it('renders suggested add-ons', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText('Suggested Add-ons')).toBeInTheDocument();
    expect(screen.getByText('Extra Jump Time')).toBeInTheDocument();
    expect(screen.getByText('Additional 30 minutes')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('renders phone contact link', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    const phoneLink = screen.getByRole('link', { name: /call/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:(415) 555-0123');
  });

  it('renders website link', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    const websiteLink = screen.getByRole('link', { name: /visit website/i });
    expect(websiteLink).toHaveAttribute('href', 'https://skyzone.com');
    expect(websiteLink).toHaveAttribute('target', '_blank');
  });

  it('shows contact hint with guest count', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText(/mention this is for a birthday party with 15 guests/i)).toBeInTheDocument();
  });

  it('has a back to results button', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /back to results/i })).toBeInTheDocument();
  });

  it('has a plan another party button', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /plan another party/i })).toBeInTheDocument();
  });

  it('shows generic title when child name is not provided', () => {
    render(
      <TestWrapper childName="">
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText(/Your Party at Sky Zone Trampoline Park/i)).toBeInTheDocument();
  });

  it('shows error state when no venue is selected', () => {
    render(
      <TestWrapper selectedVenue={null}>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.getByText(/no venue selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(
      <TestWrapper>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    // Should show formatted date
    expect(screen.getByText(/Sunday, March 15, 2026/i)).toBeInTheDocument();
  });

  it('handles venue with no phone number', () => {
    const venueNoPhone = { ...mockVenue, phoneNumber: null };
    render(
      <TestWrapper selectedVenue={venueNoPhone}>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.queryByRole('link', { name: /call/i })).not.toBeInTheDocument();
  });

  it('handles venue with no website', () => {
    const venueNoWebsite = { ...mockVenue, website: null };
    render(
      <TestWrapper selectedVenue={venueNoWebsite}>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.queryByRole('link', { name: /visit website/i })).not.toBeInTheDocument();
  });

  it('handles venue with no add-ons', () => {
    const venueNoAddons = { ...mockVenue, suggestedAddOns: [] };
    render(
      <TestWrapper selectedVenue={venueNoAddons}>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.queryByText('Suggested Add-ons')).not.toBeInTheDocument();
  });
});

describe('weather card', () => {
  const outdoorVenue = {
    ...mockVenue,
    setting: 'outdoor'
  };

  const mockWeatherData = {
    temperatureHighF: 78,
    temperatureLowF: 60,
    condition: 'Partly Cloudy',
    conditionType: 'PARTLY_CLOUDY',
    precipitationProbability: 10,
    forecastType: 'FORECAST'
  };

  // Wrapper that sets weather state via mocked fetchWeatherForecast
  function WeatherTestWrapper({ children, selectedVenue, weatherData, weatherLoading: simulateLoading }) {
    return (
      <PartyPlannerProvider>
        <WeatherContextSetter
          selectedVenue={selectedVenue}
          weatherData={weatherData}
          simulateLoading={simulateLoading}
        />
        {children}
      </PartyPlannerProvider>
    );
  }

  function WeatherContextSetter({ selectedVenue, weatherData, simulateLoading }) {
    const { selectVenue, updateChildInfo, updatePreferences, updateLocation, fetchWeatherForecast } = usePartyPlanner();

    useEffect(() => {
      updateChildInfo({ name: 'Emma', partyDate: '2026-04-01T14:00' });
      updatePreferences({ guestCount: 15 });
      updateLocation({ zipCode: '94105' });
      if (selectedVenue) {
        selectVenue(selectedVenue);
      }
      if (weatherData || simulateLoading) {
        if (weatherData && !simulateLoading) {
          global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(weatherData)
          });
        }
        if (simulateLoading) {
          global.fetch.mockReturnValueOnce(new Promise(() => {}));
        }
        fetchWeatherForecast('94105', '2026-04-01T14:00');
      }
    }, [selectedVenue, weatherData, simulateLoading]);

    return null;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({})
    });
  });

  it('does not show weather card for indoor venue', () => {
    render(
      <TestWrapper selectedVenue={mockVenue}>
        <Step5_PartyDetails />
      </TestWrapper>
    );

    expect(screen.queryByText(/loading weather forecast/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rain chance/i)).not.toBeInTheDocument();
  });

  it('shows weather loading state for outdoor venue when weatherLoading is true', async () => {
    const { waitFor } = await import('@testing-library/react');

    render(
      <WeatherTestWrapper selectedVenue={outdoorVenue} weatherLoading={true}>
        <Step5_PartyDetails />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/loading weather forecast/i)).toBeInTheDocument();
    });
  });

  it('shows weather temperature for outdoor venue when weather data exists', async () => {
    const { waitFor } = await import('@testing-library/react');

    render(
      <WeatherTestWrapper selectedVenue={outdoorVenue} weatherData={mockWeatherData}>
        <Step5_PartyDetails />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('78°F')).toBeInTheDocument();
    });
  });

  it('shows rain probability for outdoor venue', async () => {
    const { waitFor } = await import('@testing-library/react');

    render(
      <WeatherTestWrapper selectedVenue={outdoorVenue} weatherData={mockWeatherData}>
        <Step5_PartyDetails />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/rain chance: 10%/i)).toBeInTheDocument();
    });
  });

  it('shows "Typical for this time of year" for CLIMATE_AVERAGE forecastType', async () => {
    const { waitFor } = await import('@testing-library/react');
    const historicalWeather = { ...mockWeatherData, forecastType: 'CLIMATE_AVERAGE' };

    render(
      <WeatherTestWrapper selectedVenue={outdoorVenue} weatherData={historicalWeather}>
        <Step5_PartyDetails />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Typical for this time of year')).toBeInTheDocument();
    });
  });

  it('shows risk label "Great weather" for low precip', async () => {
    const { waitFor } = await import('@testing-library/react');
    const lowRiskWeather = { ...mockWeatherData, precipitationProbability: 10 };

    render(
      <WeatherTestWrapper selectedVenue={outdoorVenue} weatherData={lowRiskWeather}>
        <Step5_PartyDetails />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Great weather')).toBeInTheDocument();
    });
  });

  it('shows risk label "High chance of rain" for high precip', async () => {
    const { waitFor } = await import('@testing-library/react');
    const highRiskWeather = { ...mockWeatherData, precipitationProbability: 60 };

    render(
      <WeatherTestWrapper selectedVenue={outdoorVenue} weatherData={highRiskWeather}>
        <Step5_PartyDetails />
      </WeatherTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('High chance of rain')).toBeInTheDocument();
    });
  });
});
