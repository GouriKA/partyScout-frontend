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
