import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyPlannerProvider, usePartyPlanner } from '../../context/PartyPlannerContext';
import { AuthProvider } from '../../context/AuthContext';
import { SavedEventsProvider } from '../../context/SavedEventsContext';
import Step4_VenueResults from '../../components/wizard/Step4_VenueResults';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
    notIncluded: ['Food', 'Cake']
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
    matchReasons: ['Budget-friendly'],
    estimatedTotal: 250,
    estimatedPricePerPerson: 17,
    includedItems: ['Game tokens', 'Pizza'],
    notIncluded: ['Cake']
  },
  {
    id: 'venue-3',
    name: 'Golden Gate Park',
    address: '789 Park Blvd, San Francisco, CA 94105',
    rating: 4.8,
    userRatingsTotal: 500,
    distanceInMiles: 5.0,
    priceLevel: 0,
    setting: 'outdoor',
    matchScore: 65,
    matchReasons: ['Great outdoors'],
    estimatedTotal: 100,
    estimatedPricePerPerson: 7,
    includedItems: ['Open space'],
    notIncluded: ['Everything']
  }
];

// Helper component to set up venues in context
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

describe('VenueSearch Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Search Triggers API Call', () => {
    it('should display venues when they are loaded', async () => {
      render(
        <TestWrapper>
          <Step4_VenueResults />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      });
    });
  });

  describe('Results Display', () => {
    it('should display venue cards when search returns results', async () => {
      render(
        <TestWrapper>
          <Step4_VenueResults />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
        expect(screen.getByText('Chuck E. Cheese')).toBeInTheDocument();
        expect(screen.getByText('Golden Gate Park')).toBeInTheDocument();
      });
    });

    it('should display venue count in header', async () => {
      render(
        <TestWrapper>
          <Step4_VenueResults />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/3 venues found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter venues by setting', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Step4_VenueResults />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      });

      // Click on the Outdoor filter chip
      const outdoorFilter = screen.getByText('Outdoor');
      await user.click(outdoorFilter);

      // After filtering, only outdoor venues should be visible
      await waitFor(() => {
        expect(screen.queryByText('Sky Zone Trampoline Park')).not.toBeInTheDocument();
        expect(screen.getByText('Golden Gate Park')).toBeInTheDocument();
      });
    });

    it('should filter venues by rating', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Step4_VenueResults />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      });

      // Click on the 4+ Stars filter chip
      const highRatedFilter = screen.getByText('4+ Stars');
      await user.click(highRatedFilter);

      // All venues have 4+ rating, so all should still be visible
      await waitFor(() => {
        expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
        expect(screen.getByText('Golden Gate Park')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should sort venues by sort option', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Step4_VenueResults />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'price');

      // Sort option should change
      expect(sortSelect).toHaveValue('price');
    });
  });

  describe('Loading States', () => {
    it('should display loading state', async () => {
      render(
        <TestWrapper loading={true}>
          <Step4_VenueResults />
        </TestWrapper>
      );

      expect(screen.getByText(/finding perfect venues/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state', async () => {
      render(
        <TestWrapper error="Network error">
          <Step4_VenueResults />
        </TestWrapper>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Empty Results', () => {
    it('should display empty state when no venues', async () => {
      const user = userEvent.setup();

      // Only indoor venues
      const indoorVenues = mockVenues.filter(v => v.setting === 'indoor');

      render(
        <TestWrapper venues={indoorVenues}>
          <Step4_VenueResults />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
      });

      // Filter to outdoor only
      const outdoorFilter = screen.getByText('Outdoor');
      await user.click(outdoorFilter);

      await waitFor(() => {
        expect(screen.getByText(/no venues match your filters/i)).toBeInTheDocument();
      });
    });
  });
});
