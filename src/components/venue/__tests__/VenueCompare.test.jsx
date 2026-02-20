import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VenueCompare from '../VenueCompare';

const mockVenues = [
  {
    id: 'venue-1',
    name: 'Sky Zone Trampoline Park',
    address: '123 Jump St, San Francisco, CA 94105',
    rating: 4.5,
    distanceInMiles: 2.3,
    setting: 'indoor',
    matchScore: 87,
    matchReasons: ['Great for ages 5-12', 'Within your budget'],
    estimatedTotal: 350,
    estimatedPricePerPerson: 23,
    includedItems: ['2 hours jump time', 'Party room', 'Host', 'Invitations'],
    maxCapacity: 25,
    typicalPartyDuration: '2 hours'
  },
  {
    id: 'venue-2',
    name: 'Fun Factory Arcade',
    address: '456 Game Ave, San Francisco, CA 94105',
    rating: 4.2,
    distanceInMiles: 3.5,
    setting: 'indoor',
    matchScore: 75,
    matchReasons: ['Good for groups'],
    estimatedTotal: 280,
    estimatedPricePerPerson: 19,
    includedItems: ['Game cards', 'Party area', 'Pizza'],
    maxCapacity: 30,
    typicalPartyDuration: '2.5 hours'
  }
];

describe('VenueCompare', () => {
  const defaultProps = {
    venues: mockVenues,
    onClose: vi.fn(),
    onSelect: vi.fn()
  };

  it('renders nothing when venues array is empty', () => {
    const { container } = render(<VenueCompare {...defaultProps} venues={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders compare modal header', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('Compare Venues')).toBeInTheDocument();
  });

  it('renders venue names in header', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
    expect(screen.getByText('Fun Factory Arcade')).toBeInTheDocument();
  });

  it('renders venue addresses', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('123 Jump St, San Francisco, CA 94105')).toBeInTheDocument();
    expect(screen.getByText('456 Game Ave, San Francisco, CA 94105')).toBeInTheDocument();
  });

  it('renders match scores with percentage', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders ratings', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('4.5 ★')).toBeInTheDocument();
    expect(screen.getByText('4.2 ★')).toBeInTheDocument();
  });

  it('renders distances', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('2.3 mi')).toBeInTheDocument();
    expect(screen.getByText('3.5 mi')).toBeInTheDocument();
  });

  it('renders estimated totals', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('$350')).toBeInTheDocument();
    expect(screen.getByText('$280')).toBeInTheDocument();
  });

  it('renders per person costs', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('$23')).toBeInTheDocument();
    expect(screen.getByText('$19')).toBeInTheDocument();
  });

  it('renders settings', () => {
    render(<VenueCompare {...defaultProps} />);

    // Both are indoor
    const indoorElements = screen.getAllByText('indoor');
    expect(indoorElements).toHaveLength(2);
  });

  it('renders durations', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('2 hours')).toBeInTheDocument();
    expect(screen.getByText('2.5 hours')).toBeInTheDocument();
  });

  it('renders max capacities', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('25 guests')).toBeInTheDocument();
    expect(screen.getByText('30 guests')).toBeInTheDocument();
  });

  it('renders included items', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('2 hours jump time')).toBeInTheDocument();
    expect(screen.getByText('Game cards')).toBeInTheDocument();
  });

  it('renders match reasons', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('Great for ages 5-12')).toBeInTheDocument();
    expect(screen.getByText('Good for groups')).toBeInTheDocument();
  });

  it('highlights best values with "Best" badge', () => {
    render(<VenueCompare {...defaultProps} />);

    // Should highlight best match score (87), closest distance (2.3), lowest price ($280), lowest per person ($19)
    const bestBadges = screen.getAllByText('Best');
    expect(bestBadges.length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<VenueCompare {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<VenueCompare {...defaultProps} onClose={onClose} />);

    const overlay = document.querySelector('.compare-overlay');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it('renders select button for each venue', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByRole('button', { name: /select sky zone/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select fun factory/i })).toBeInTheDocument();
  });

  it('calls onSelect with correct venue when select button is clicked', () => {
    const onSelect = vi.fn();
    render(<VenueCompare {...defaultProps} onSelect={onSelect} />);

    const selectButton = screen.getByRole('button', { name: /select sky zone/i });
    fireEvent.click(selectButton);

    expect(onSelect).toHaveBeenCalledWith(mockVenues[0]);
  });

  it('renders comparison labels', () => {
    render(<VenueCompare {...defaultProps} />);

    expect(screen.getByText('Match Score')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Est. Total')).toBeInTheDocument();
    expect(screen.getByText('Per Person')).toBeInTheDocument();
    expect(screen.getByText('Setting')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Max Capacity')).toBeInTheDocument();
    expect(screen.getByText('Included')).toBeInTheDocument();
    expect(screen.getByText('Why It Matches')).toBeInTheDocument();
  });

  it('handles venue with zero rating', () => {
    const venuesWithZeroRating = [
      { ...mockVenues[0], rating: 0 },
      mockVenues[1]
    ];

    render(<VenueCompare {...defaultProps} venues={venuesWithZeroRating} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('compares three venues', () => {
    const threeVenues = [
      ...mockVenues,
      {
        id: 'venue-3',
        name: 'Adventure Park',
        address: '789 Fun Rd',
        rating: 4.8,
        distanceInMiles: 5.0,
        setting: 'outdoor',
        matchScore: 90,
        matchReasons: ['Best overall match'],
        estimatedTotal: 400,
        estimatedPricePerPerson: 27,
        includedItems: ['Full day access'],
        maxCapacity: 50,
        typicalPartyDuration: '3 hours'
      }
    ];

    render(<VenueCompare {...defaultProps} venues={threeVenues} />);

    expect(screen.getByText('Adventure Park')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});
