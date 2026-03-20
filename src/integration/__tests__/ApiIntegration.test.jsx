import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyPlannerProvider, usePartyPlanner } from '../../context/PartyPlannerContext';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper component to access context methods
const ApiTestComponent = ({ onMount }) => {
  const context = usePartyPlanner();

  React.useEffect(() => {
    if (onMount) {
      onMount(context);
    }
  }, []);

  return (
    <div>
      <span data-testid="loading">{context.loading.toString()}</span>
      <span data-testid="error">{context.error || 'none'}</span>
      <span data-testid="venues">{context.venues.length}</span>
      <span data-testid="suggestions">{context.partyTypeSuggestions.length}</span>
      <button onClick={context.searchVenues}>Search</button>
      <button onClick={() => context.fetchPartyTypeSuggestions(7)}>Fetch Types</button>
    </div>
  );
};

const renderWithProvider = (ui) => {
  return render(
    <PartyPlannerProvider>
      {ui}
    </PartyPlannerProvider>
  );
};

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Party Type Suggestions API', () => {
    it('should fetch party type suggestions successfully', async () => {
      const user = userEvent.setup();

      const mockSuggestions = [
        { type: 'active_play', displayName: 'Active Play', popularityScore: 5 },
        { type: 'creative', displayName: 'Creative', popularityScore: 4 }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSuggestions)
      });

      renderWithProvider(<ApiTestComponent />);

      const fetchButton = screen.getByRole('button', { name: /fetch types/i });
      await user.click(fetchButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/party-wizard/party-types/7')
        );
      });
    });

    it('should handle party type suggestions error', async () => {
      const user = userEvent.setup();

      mockFetch.mockRejectedValue(new Error('Network error'));

      renderWithProvider(<ApiTestComponent />);

      const fetchButton = screen.getByRole('button', { name: /fetch types/i });
      await user.click(fetchButton);

      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(screen.getByTestId('suggestions')).toHaveTextContent('0');
      });
    });
  });

  describe('Venue Search API', () => {
    it('should call search API with correct parameters', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ venues: [] })
      });

      // Setup component that can trigger search
      const SearchTrigger = () => {
        const { searchVenues, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7, name: 'Test' });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return <button onClick={searchVenues}>Search</button>;
      };

      renderWithProvider(<SearchTrigger />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v2/party-wizard/search'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.any(String)
          })
        );
      });
    });

    it('should include correct request body in search API call', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ venues: [] })
      });

      const SearchTrigger = () => {
        const { searchVenues, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7, name: 'Test' });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 100, max: 500 } });
          updateLocation({ city: 'San Francisco', setting: 'indoor', maxDistance: 10 });
        }, []);

        return <button onClick={searchVenues}>Search</button>;
      };

      renderWithProvider(<SearchTrigger />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      await waitFor(() => {
        const call = mockFetch.mock.calls.find(c => c[0].includes('search'));
        if (call) {
          const body = JSON.parse(call[1].body);
          expect(body.age).toBe(7);
          expect(body.partyTypes).toContain('active_play');
          expect(body.guestCount).toBe(15);
          expect(body.city).toBe('San Francisco');
        }
      });
    });

    it('should update venues on successful search', async () => {
      const user = userEvent.setup();

      const mockVenues = [
        { id: 'v1', name: 'Venue 1', matchScore: 85 },
        { id: 'v2', name: 'Venue 2', matchScore: 72 }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ venues: mockVenues })
      });

      const SearchWithDisplay = () => {
        const { searchVenues, venues, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7 });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return (
          <div>
            <button onClick={searchVenues}>Search</button>
            <span data-testid="venue-count">{venues.length}</span>
          </div>
        );
      };

      renderWithProvider(<SearchWithDisplay />);

      expect(screen.getByTestId('venue-count')).toHaveTextContent('0');

      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByTestId('venue-count')).toHaveTextContent('2');
      });
    });
  });

  describe('API Error Handling', () => {
    it('should set error state on API failure', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const ErrorDisplay = () => {
        const { searchVenues, error, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7 });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return (
          <div>
            <button onClick={searchVenues}>Search</button>
            <span data-testid="error">{error || 'none'}</span>
          </div>
        );
      };

      renderWithProvider(<ErrorDisplay />);

      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('none');
      });
    });

    it('should handle network timeout gracefully', async () => {
      const user = userEvent.setup();

      // Simulate timeout
      mockFetch.mockRejectedValue(new Error('Network timeout'));

      const TimeoutDisplay = () => {
        const { searchVenues, error, loading, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7 });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return (
          <div>
            <button onClick={searchVenues}>Search</button>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="error">{error || 'none'}</span>
          </div>
        );
      };

      renderWithProvider(<TimeoutDisplay />);

      await user.click(screen.getByRole('button', { name: /search/i }));

      // Should show error and loading should be false after error
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).not.toHaveTextContent('none');
      });
    });
  });

  describe('Loading States', () => {
    it('should complete loading state after API call', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ venues: [{ id: 'v1', name: 'Test Venue' }] })
      });

      const LoadingDisplay = () => {
        const { searchVenues, loading, venues, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7 });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return (
          <div>
            <button onClick={searchVenues}>Search</button>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="venue-count">{venues.length}</span>
          </div>
        );
      };

      renderWithProvider(<LoadingDisplay />);

      // Initial state
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('venue-count')).toHaveTextContent('0');

      await user.click(screen.getByRole('button', { name: /search/i }));

      // After API call completes, loading should be false and venues should be populated
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('venue-count')).toHaveTextContent('1');
      });

      // Verify the API was called
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should clear loading state on error', async () => {
      const user = userEvent.setup();

      mockFetch.mockRejectedValue(new Error('API Error'));

      const LoadingDisplay = () => {
        const { searchVenues, loading, error, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7 });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return (
          <div>
            <button onClick={searchVenues}>Search</button>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="error">{error || 'none'}</span>
          </div>
        );
      };

      renderWithProvider(<LoadingDisplay />);

      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).not.toHaveTextContent('none');
      });
    });
  });

  describe('Response Data Handling', () => {
    it('should handle empty venues array', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ venues: [] })
      });

      const EmptyResponse = () => {
        const { searchVenues, venues, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7 });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return (
          <div>
            <button onClick={searchVenues}>Search</button>
            <span data-testid="venue-count">{venues.length}</span>
          </div>
        );
      };

      renderWithProvider(<EmptyResponse />);

      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByTestId('venue-count')).toHaveTextContent('0');
      });
    });

    it('should handle missing venues key in response', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}) // Missing venues key
      });

      const MissingKey = () => {
        const { searchVenues, venues, updateChildInfo, updatePreferences, updateLocation } = usePartyPlanner();

        React.useEffect(() => {
          updateChildInfo({ age: 7 });
          updatePreferences({ partyTypes: ['active_play'], guestCount: 15, budget: { min: 0, max: 500 } });
          updateLocation({ zipCode: '94105', setting: 'indoor', maxDistance: 10 });
        }, []);

        return (
          <div>
            <button onClick={searchVenues}>Search</button>
            <span data-testid="venue-count">{venues.length}</span>
          </div>
        );
      };

      renderWithProvider(<MissingKey />);

      await user.click(screen.getByRole('button', { name: /search/i }));

      // Should default to empty array
      await waitFor(() => {
        expect(screen.getByTestId('venue-count')).toHaveTextContent('0');
      });
    });
  });
});
