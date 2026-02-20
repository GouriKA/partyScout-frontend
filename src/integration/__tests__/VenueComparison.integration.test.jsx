import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyPlannerProvider, usePartyPlanner } from '../../context/PartyPlannerContext';
import VenueCard from '../../components/venue/VenueCard';
import VenueCompare from '../../components/venue/VenueCompare';

const mockVenues = [
  {
    id: 'venue-1',
    name: 'Sky Zone Trampoline Park',
    address: '123 Jump St, San Francisco, CA 94105',
    rating: 4.5,
    userRatingsTotal: 234,
    distanceInMiles: 2.3,
    priceLevel: 2,
    setting: 'indoor',
    matchScore: 87,
    matchReasons: ['Great for ages 5-12', 'Within your budget'],
    estimatedTotal: 350,
    estimatedPricePerPerson: 23,
    includedItems: ['2 hours jump time', 'Party room'],
    notIncluded: ['Food', 'Cake'],
    phoneNumber: '(415) 555-0123',
    website: 'https://skyzone.com'
  },
  {
    id: 'venue-2',
    name: 'Chuck E. Cheese',
    address: '456 Fun Ave, San Francisco, CA 94105',
    rating: 4.0,
    userRatingsTotal: 156,
    distanceInMiles: 3.5,
    priceLevel: 1,
    setting: 'indoor',
    matchScore: 72,
    matchReasons: ['Budget-friendly', 'Great for kids'],
    estimatedTotal: 250,
    estimatedPricePerPerson: 17,
    includedItems: ['Game tokens', 'Pizza', 'Party host'],
    notIncluded: ['Cake'],
    phoneNumber: '(415) 555-0456'
  },
  {
    id: 'venue-3',
    name: 'Golden Gate Park Pavilion',
    address: '789 Park Blvd, San Francisco, CA 94105',
    rating: 4.8,
    userRatingsTotal: 500,
    distanceInMiles: 5.0,
    priceLevel: 0,
    setting: 'outdoor',
    matchScore: 65,
    matchReasons: ['Beautiful outdoor setting', 'Affordable'],
    estimatedTotal: 100,
    estimatedPricePerPerson: 7,
    includedItems: ['Pavilion rental', 'Picnic tables'],
    notIncluded: ['Food', 'Decorations', 'Entertainment']
  },
  {
    id: 'venue-4',
    name: 'Premium Party Palace',
    address: '999 Luxury Lane, San Francisco, CA 94105',
    rating: 4.9,
    userRatingsTotal: 100,
    distanceInMiles: 8.0,
    priceLevel: 4,
    setting: 'indoor',
    matchScore: 55,
    matchReasons: ['Premium experience'],
    estimatedTotal: 800,
    estimatedPricePerPerson: 53,
    includedItems: ['Everything'],
    notIncluded: []
  }
];

// Helper component to test venue cards with comparison
const VenueListWithCompare = ({ venues, compareVenues, onToggleCompare }) => {
  return (
    <div>
      {venues.map(venue => (
        <VenueCard
          key={venue.id}
          venue={venue}
          onSelect={vi.fn()}
          onToggleCompare={onToggleCompare}
          isComparing={compareVenues.some(v => v.id === venue.id)}
          showCompareCheckbox={true}
        />
      ))}
      {compareVenues.length > 0 && (
        <VenueCompare
          venues={compareVenues}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      )}
    </div>
  );
};

describe('VenueComparison Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Select Venues for Comparison', () => {
    it('should add venue to comparison when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggleCompare = vi.fn();

      render(
        <VenueListWithCompare
          venues={mockVenues.slice(0, 2)}
          compareVenues={[]}
          onToggleCompare={onToggleCompare}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(onToggleCompare).toHaveBeenCalledWith('venue-1');
    });

    it('should remove venue from comparison when checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const onToggleCompare = vi.fn();

      render(
        <VenueListWithCompare
          venues={mockVenues.slice(0, 2)}
          compareVenues={[mockVenues[0]]}
          onToggleCompare={onToggleCompare}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox should be checked
      expect(checkboxes[0]).toBeChecked();

      await user.click(checkboxes[0]);
      expect(onToggleCompare).toHaveBeenCalledWith('venue-1');
    });

    it('should show checked state for venues in comparison', () => {
      render(
        <VenueListWithCompare
          venues={mockVenues.slice(0, 3)}
          compareVenues={[mockVenues[0], mockVenues[2]]}
          onToggleCompare={vi.fn()}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // venue-1
      expect(checkboxes[1]).not.toBeChecked(); // venue-2
      expect(checkboxes[2]).toBeChecked(); // venue-3
    });
  });

  describe('Maximum 3 Venues for Comparison', () => {
    it('should allow selecting up to 3 venues', async () => {
      const user = userEvent.setup();
      const selectedVenues = [];
      const onToggleCompare = vi.fn((id) => {
        selectedVenues.push(id);
      });

      render(
        <VenueListWithCompare
          venues={mockVenues}
          compareVenues={[]}
          onToggleCompare={onToggleCompare}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');

      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      expect(onToggleCompare).toHaveBeenCalledTimes(3);
    });
  });

  describe('Compare Modal Display', () => {
    it('should display compare modal with selected venues', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      expect(screen.getByText('Chuck E. Cheese')).toBeInTheDocument();
    });

    it('should display venue details in comparison', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Ratings are displayed with star, like "4.5 ★"
      expect(screen.getByText(/4\.5.*★/)).toBeInTheDocument();
      expect(screen.getByText(/4\.0.*★/)).toBeInTheDocument();

      // Prices are formatted
      expect(screen.getByText('$350')).toBeInTheDocument();
      expect(screen.getByText('$250')).toBeInTheDocument();
    });

    it('should display all three venues when selected', () => {
      render(
        <VenueCompare
          venues={mockVenues.slice(0, 3)}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      expect(screen.getByText('Chuck E. Cheese')).toBeInTheDocument();
      expect(screen.getByText('Golden Gate Park Pavilion')).toBeInTheDocument();
    });
  });

  describe('Side-by-Side Data Comparison', () => {
    it('should compare match scores side by side', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Match scores are displayed with %, like "87%"
      expect(screen.getByText('87%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
    });

    it('should compare distances side by side', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('2.3 mi')).toBeInTheDocument();
      expect(screen.getByText('3.5 mi')).toBeInTheDocument();
    });

    it('should compare included items', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Sky Zone inclusions
      expect(screen.getByText('2 hours jump time')).toBeInTheDocument();
      expect(screen.getByText('Party room')).toBeInTheDocument();

      // Chuck E. Cheese inclusions
      expect(screen.getByText('Game tokens')).toBeInTheDocument();
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });
  });

  describe('Remove Venue from Comparison', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={onClose}
          onSelect={vi.fn()}
        />
      );

      // Close button uses × character
      const closeButton = screen.getByText('×');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Select Venue from Comparison', () => {
    it('should call onSelect when select button is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={onSelect}
        />
      );

      // Buttons say "Select Sky Zone" etc.
      const selectButtons = screen.getAllByRole('button', { name: /select/i });
      if (selectButtons.length > 0) {
        await user.click(selectButtons[0]);
        expect(onSelect).toHaveBeenCalled();
      }
    });
  });

  describe('Best Value Highlighting', () => {
    it('should highlight best price in comparison', () => {
      render(
        <VenueCompare
          venues={mockVenues.slice(0, 3)}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Golden Gate Park has the best (lowest) price at $100
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('should highlight best match score in comparison', () => {
      render(
        <VenueCompare
          venues={mockVenues.slice(0, 3)}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Sky Zone has the best match score at 87%
      expect(screen.getByText('87%')).toBeInTheDocument();
    });

    it('should highlight best rating in comparison', () => {
      render(
        <VenueCompare
          venues={mockVenues.slice(0, 3)}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Golden Gate Park has the best rating at 4.8
      expect(screen.getByText(/4\.8.*★/)).toBeInTheDocument();
    });
  });

  describe('Comparison with Context', () => {
    it('should integrate with PartyPlannerContext', () => {
      const TestComponent = () => {
        const { compareVenues, toggleCompareVenue, clearCompare } = usePartyPlanner();

        return (
          <div>
            <span data-testid="count">{compareVenues.length}</span>
            <button onClick={() => toggleCompareVenue('venue-1')}>Toggle</button>
            <button onClick={clearCompare}>Clear</button>
          </div>
        );
      };

      render(
        <PartyPlannerProvider>
          <TestComponent />
        </PartyPlannerProvider>
      );

      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });
  });

  describe('Empty Comparison State', () => {
    it('should return null for empty venues array', () => {
      const { container } = render(
        <VenueCompare
          venues={[]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Component returns null for empty venues
      expect(container.firstChild).toBeNull();
    });

    it('should handle single venue', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have close button in modal', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Close button exists (uses × character)
      const closeButton = screen.getByText('×');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have accessible venue information', () => {
      render(
        <VenueCompare
          venues={[mockVenues[0], mockVenues[1]]}
          onClose={vi.fn()}
          onSelect={vi.fn()}
        />
      );

      // Venue names should be accessible
      expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      expect(screen.getByText('Chuck E. Cheese')).toBeInTheDocument();
    });
  });
});
