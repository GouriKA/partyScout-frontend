import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VenueCard from '../VenueCard';

const mockVenue = {
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
  matchReasons: ['Great for ages 5-12', 'Within your budget'],
  estimatedTotal: 350,
  estimatedPricePerPerson: 23,
  includedItems: ['2 hours jump time', 'Party room'],
  notIncluded: ['Food', 'Cake'],
  suggestedAddOns: [],
  popularForAges: 'Best for ages 5-12',
  typicalPartyDuration: '2 hours'
};

describe('VenueCard', () => {
  const defaultProps = {
    venue: mockVenue,
    onSelect: vi.fn(),
    onToggleCompare: vi.fn(),
    isComparing: false
  };

  it('renders venue name', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
  });

  it('renders match score', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('renders match score label', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('Excellent Match')).toBeInTheDocument();
  });

  it('renders venue rating', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('renders rating count', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('(234)')).toBeInTheDocument();
  });

  it('renders distance', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText(/2.3/)).toBeInTheDocument();
  });

  it('renders estimated cost', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('$350')).toBeInTheDocument();
  });

  it('renders per-person cost', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('$23')).toBeInTheDocument();
    expect(screen.getByText('Per Person')).toBeInTheDocument();
  });

  it('renders venue address', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('123 Jump St, San Francisco, CA 94105')).toBeInTheDocument();
  });

  it('calls onSelect when View Details button is clicked', () => {
    const onSelect = vi.fn();
    render(<VenueCard {...defaultProps} onSelect={onSelect} />);

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsButton);

    expect(onSelect).toHaveBeenCalledWith(mockVenue);
  });

  it('calls onSelect when venue content is clicked', () => {
    const onSelect = vi.fn();
    render(<VenueCard {...defaultProps} onSelect={onSelect} />);

    const venueName = screen.getByText('Sky Zone Trampoline Park');
    fireEvent.click(venueName);

    expect(onSelect).toHaveBeenCalledWith(mockVenue);
  });

  it('calls onToggleCompare when compare checkbox is toggled', () => {
    const onToggleCompare = vi.fn();
    render(<VenueCard {...defaultProps} onToggleCompare={onToggleCompare} />);

    const compareCheckbox = screen.getByRole('checkbox');
    fireEvent.click(compareCheckbox);

    expect(onToggleCompare).toHaveBeenCalledWith(mockVenue.id);
  });

  it('shows compare checkbox as checked when isComparing is true', () => {
    render(<VenueCard {...defaultProps} isComparing={true} />);

    const compareCheckbox = screen.getByRole('checkbox');
    expect(compareCheckbox).toBeChecked();
  });

  it('shows compare checkbox as unchecked when isComparing is false', () => {
    render(<VenueCard {...defaultProps} isComparing={false} />);

    const compareCheckbox = screen.getByRole('checkbox');
    expect(compareCheckbox).not.toBeChecked();
  });

  it('displays venue setting badge', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('indoor')).toBeInTheDocument();
  });

  it('renders match reasons', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('Great for ages 5-12')).toBeInTheDocument();
    expect(screen.getByText('Within your budget')).toBeInTheDocument();
  });

  it('renders included items', () => {
    render(<VenueCard {...defaultProps} />);

    expect(screen.getByText('2 hours jump time')).toBeInTheDocument();
    expect(screen.getByText('Party room')).toBeInTheDocument();
  });

  it('handles venue with no rating', () => {
    const venueNoRating = { ...mockVenue, rating: 0 };
    render(<VenueCard {...defaultProps} venue={venueNoRating} />);

    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
    expect(screen.queryByText('★')).not.toBeInTheDocument();
  });

  it('renders call link with phone number', () => {
    render(<VenueCard {...defaultProps} />);

    const callLink = screen.getByRole('link', { name: /call/i });
    expect(callLink).toHaveAttribute('href', 'tel:(415) 555-0123');
  });

  it('handles venue with no phone number', () => {
    const venueNoPhone = { ...mockVenue, phoneNumber: null };
    render(<VenueCard {...defaultProps} venue={venueNoPhone} />);

    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /call/i })).not.toBeInTheDocument();
  });

  it('hides compare checkbox when showCompareCheckbox is false', () => {
    render(<VenueCard {...defaultProps} showCompareCheckbox={false} />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('applies selected class when isSelected is true', () => {
    const { container } = render(<VenueCard {...defaultProps} isSelected={true} />);

    expect(container.querySelector('.venue-card')).toHaveClass('selected');
  });

  it('renders good match label for score 60-79', () => {
    const venueGoodMatch = { ...mockVenue, matchScore: 65 };
    render(<VenueCard {...defaultProps} venue={venueGoodMatch} />);

    expect(screen.getByText('Great Match')).toBeInTheDocument();
  });

  it('renders fair match label for score 40-59', () => {
    const venueFairMatch = { ...mockVenue, matchScore: 45 };
    render(<VenueCard {...defaultProps} venue={venueFairMatch} />);

    expect(screen.getByText('Good Match')).toBeInTheDocument();
  });

  it('renders low match label for score below 40', () => {
    const venueLowMatch = { ...mockVenue, matchScore: 30 };
    render(<VenueCard {...defaultProps} venue={venueLowMatch} />);

    expect(screen.getByText('Possible Match')).toBeInTheDocument();
  });
});

describe('heart icon (save feature)', () => {
  const defaultProps = {
    venue: mockVenue,
    onSelect: vi.fn(),
    onToggleCompare: vi.fn(),
    isComparing: false,
  };

  it('renders ♡ when isSaved is false', () => {
    render(<VenueCard {...defaultProps} isSaved={false} />);

    expect(screen.getByRole('button', { name: /save venue/i })).toBeInTheDocument();
    expect(screen.getByText('♡')).toBeInTheDocument();
  });

  it('renders ♥ when isSaved is true', () => {
    render(<VenueCard {...defaultProps} isSaved={true} />);

    expect(screen.getByRole('button', { name: /unsave venue/i })).toBeInTheDocument();
    expect(screen.getByText('♥')).toBeInTheDocument();
  });

  it('clicking heart calls onSave with the venue', () => {
    const onSave = vi.fn();
    render(<VenueCard {...defaultProps} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /save venue/i }));

    expect(onSave).toHaveBeenCalledWith(mockVenue);
  });

  it('heart click does NOT propagate to onSelect (stopPropagation)', () => {
    const onSave = vi.fn();
    const onSelect = vi.fn();
    render(<VenueCard {...defaultProps} onSave={onSave} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /save venue/i }));

    expect(onSave).toHaveBeenCalledWith(mockVenue);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('weather badge', () => {
  const outdoorVenue = {
    ...mockVenue,
    setting: 'outdoor'
  };

  const mockWeather = {
    temperatureHighF: 75,
    temperatureLowF: 58,
    condition: 'Light Rain',
    conditionType: 'LIGHT_RAIN',
    precipitationProbability: 10,
    forecastType: 'FORECAST'
  };

  const defaultOutdoorProps = {
    venue: outdoorVenue,
    onSelect: vi.fn(),
    onToggleCompare: vi.fn(),
    isComparing: false
  };

  it('does not show weather badge for indoor venue even when weather data is provided', () => {
    render(
      <VenueCard
        {...defaultOutdoorProps}
        venue={mockVenue}
        weather={mockWeather}
      />
    );

    expect(screen.queryByText('Loading forecast…')).not.toBeInTheDocument();
    expect(screen.queryByText('Light Rain')).not.toBeInTheDocument();
    expect(screen.queryByText(/75°F/)).not.toBeInTheDocument();
  });

  it('shows loading text for outdoor venue when weatherLoading is true', () => {
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weatherLoading={true}
      />
    );

    expect(screen.getByText('Loading forecast…')).toBeInTheDocument();
  });

  it('shows temperature when weather data is provided for outdoor venue', () => {
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weather={mockWeather}
      />
    );

    expect(screen.getByText('75°F')).toBeInTheDocument();
  });

  it('shows condition text when weather data is provided for outdoor venue', () => {
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weather={mockWeather}
      />
    );

    expect(screen.getByText('Light Rain')).toBeInTheDocument();
  });

  it('shows green risk dot for low precip probability (< 20%)', () => {
    const lowPrecipWeather = { ...mockWeather, precipitationProbability: 10 };
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weather={lowPrecipWeather}
      />
    );

    expect(screen.getByText('🟢')).toBeInTheDocument();
  });

  it('shows yellow risk dot for moderate precip probability (20-49%)', () => {
    const moderatePrecipWeather = { ...mockWeather, precipitationProbability: 35 };
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weather={moderatePrecipWeather}
      />
    );

    expect(screen.getByText('🟡')).toBeInTheDocument();
  });

  it('shows red risk dot for high precip probability (>= 50%)', () => {
    const highPrecipWeather = { ...mockWeather, precipitationProbability: 60 };
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weather={highPrecipWeather}
      />
    );

    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('shows "Typical this time of year" label for CLIMATE_AVERAGE forecastType', () => {
    const historicalWeather = { ...mockWeather, forecastType: 'CLIMATE_AVERAGE' };
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weather={historicalWeather}
      />
    );

    expect(screen.getByText('Typical this time of year')).toBeInTheDocument();
  });

  it('does not show "Typical this time of year" for FORECAST forecastType', () => {
    render(
      <VenueCard
        {...defaultOutdoorProps}
        weather={mockWeather}
      />
    );

    expect(screen.queryByText('Typical this time of year')).not.toBeInTheDocument();
  });

  it('does not show weather badge when venue is outdoor but no weather or weatherLoading', () => {
    render(
      <VenueCard
        {...defaultOutdoorProps}
      />
    );

    expect(screen.queryByText('Loading forecast…')).not.toBeInTheDocument();
    expect(screen.queryByText('🟢')).not.toBeInTheDocument();
    expect(screen.queryByText('🟡')).not.toBeInTheDocument();
    expect(screen.queryByText('🔴')).not.toBeInTheDocument();
  });
});
