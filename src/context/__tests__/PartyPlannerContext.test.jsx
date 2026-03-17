import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { PartyPlannerProvider, usePartyPlanner } from '../PartyPlannerContext';

// Mock fetch
global.fetch = vi.fn();

const wrapper = ({ children }) => (
  <PartyPlannerProvider>{children}</PartyPlannerProvider>
);

describe('PartyPlannerContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.childInfo.name).toBe('');
      expect(result.current.childInfo.age).toBeNull();
      expect(result.current.preferences.guestCount).toBe(15);
      expect(result.current.venues).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should go to next step', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should go to previous step', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.nextStep();
        result.current.nextStep();
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('should not go below step 1', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.prevStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('should not go above step 5', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.nextStep();
        }
      });

      expect(result.current.currentStep).toBe(5);
    });

    it('should go to specific step', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.goToStep(3);
      });

      expect(result.current.currentStep).toBe(3);
    });
  });

  describe('Child Info', () => {
    it('should update child name', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updateChildInfo({ name: 'Emma' });
      });

      expect(result.current.childInfo.name).toBe('Emma');
    });

    it('should update child age', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updateChildInfo({ age: 7 });
      });

      expect(result.current.childInfo.age).toBe(7);
    });

    it('should update party date', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });
      const date = '2026-03-15T14:00';

      act(() => {
        result.current.updateChildInfo({ partyDate: date });
      });

      expect(result.current.childInfo.partyDate).toBe(date);
    });

    it('should merge child info updates', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updateChildInfo({ name: 'Emma' });
        result.current.updateChildInfo({ age: 7 });
      });

      expect(result.current.childInfo.name).toBe('Emma');
      expect(result.current.childInfo.age).toBe(7);
    });
  });

  describe('Preferences', () => {
    it('should update party types', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updatePreferences({ partyTypes: ['active_play', 'amusement'] });
      });

      expect(result.current.preferences.partyTypes).toEqual(['active_play', 'amusement']);
    });

    it('should update guest count', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updatePreferences({ guestCount: 20 });
      });

      expect(result.current.preferences.guestCount).toBe(20);
    });

    it('should update budget', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updatePreferences({ budget: { min: 200, max: 600 } });
      });

      expect(result.current.preferences.budget.min).toBe(200);
      expect(result.current.preferences.budget.max).toBe(600);
    });
  });

  describe('Location', () => {
    it('should update zip code', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updateLocation({ zipCode: '94105' });
      });

      expect(result.current.location.zipCode).toBe('94105');
    });

    it('should update setting preference', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updateLocation({ setting: 'outdoor' });
      });

      expect(result.current.location.setting).toBe('outdoor');
    });

    it('should update max distance', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updateLocation({ maxDistance: 15 });
      });

      expect(result.current.location.maxDistance).toBe(15);
    });
  });

  describe('Venues', () => {
    it('should set venues', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });
      const venues = [{ id: '1', name: 'Venue 1' }];

      act(() => {
        result.current.setVenues(venues);
      });

      expect(result.current.venues).toEqual(venues);
    });

    it('should select venue', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });
      const venue = { id: '1', name: 'Selected Venue' };

      act(() => {
        result.current.selectVenue(venue);
      });

      expect(result.current.selectedVenue).toEqual(venue);
    });
  });

  describe('Compare', () => {
    it('should toggle compare venue', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });
      const venues = [
        { id: '1', name: 'Venue 1' },
        { id: '2', name: 'Venue 2' }
      ];

      act(() => {
        result.current.setVenues(venues);
        result.current.toggleCompareVenue('1');
      });

      expect(result.current.compareVenues).toHaveLength(1);
      expect(result.current.compareVenues[0].id).toBe('1');
    });

    it('should remove venue from compare when toggled again', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });
      const venues = [{ id: '1', name: 'Venue 1' }];

      act(() => {
        result.current.setVenues(venues);
        result.current.toggleCompareVenue('1');
        result.current.toggleCompareVenue('1');
      });

      expect(result.current.compareVenues).toHaveLength(0);
    });

    it('should limit compare to 3 venues', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });
      const venues = [
        { id: '1', name: 'Venue 1' },
        { id: '2', name: 'Venue 2' },
        { id: '3', name: 'Venue 3' },
        { id: '4', name: 'Venue 4' }
      ];

      act(() => {
        result.current.setVenues(venues);
        result.current.toggleCompareVenue('1');
        result.current.toggleCompareVenue('2');
        result.current.toggleCompareVenue('3');
        result.current.toggleCompareVenue('4'); // Should not add
      });

      expect(result.current.compareVenues).toHaveLength(3);
    });

    it('should clear compare', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });
      const venues = [{ id: '1', name: 'Venue 1' }];

      act(() => {
        result.current.setVenues(venues);
        result.current.toggleCompareVenue('1');
        result.current.clearCompare();
      });

      expect(result.current.compareVenues).toHaveLength(0);
    });
  });

  describe('Loading and Error', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.setError('Something went wrong');
      });

      expect(result.current.error).toBe('Something went wrong');
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.updateChildInfo({ name: 'Emma', age: 7 });
        result.current.nextStep();
        result.current.nextStep();
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.childInfo.name).toBe('');
      expect(result.current.childInfo.age).toBeNull();
    });
  });

  describe('API Integration', () => {
    it('should fetch party type suggestions', async () => {
      const mockSuggestions = [
        { type: 'active_play', displayName: 'Active Play' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuggestions)
      });

      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      await act(async () => {
        await result.current.fetchPartyTypeSuggestions(7);
      });

      expect(result.current.partyTypeSuggestions).toEqual(mockSuggestions);
    });

    it('should handle fetch error gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      await act(async () => {
        await result.current.fetchPartyTypeSuggestions(7);
      });

      // Should not throw, suggestions should remain empty
      expect(result.current.partyTypeSuggestions).toEqual([]);
    });
  });

  describe('Weather', () => {
    it('should have initial state with weather null and weatherLoading false', () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      expect(result.current.weather).toBeNull();
      expect(result.current.weatherLoading).toBe(false);
    });

    it('fetchWeatherForecast sets weatherLoading true while fetching', async () => {
      let resolveResponse;
      global.fetch.mockReturnValueOnce(
        new Promise((resolve) => { resolveResponse = resolve; })
      );

      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      act(() => {
        result.current.fetchWeatherForecast('94105', '2026-04-15T14:00');
      });

      await waitFor(() => {
        expect(result.current.weatherLoading).toBe(true);
      });

      // Resolve the fetch to clean up
      resolveResponse({ ok: true, json: () => Promise.resolve({}) });
    });

    it('fetchWeatherForecast sets weather data from successful API response', async () => {
      const mockWeatherData = {
        temperatureHighF: 72,
        temperatureLowF: 55,
        condition: 'Partly Cloudy',
        conditionType: 'PARTLY_CLOUDY',
        precipitationProbability: 15,
        forecastType: 'FORECAST'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherData)
      });

      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      await act(async () => {
        await result.current.fetchWeatherForecast('94105', '2026-04-15T14:00');
      });

      expect(result.current.weather).toEqual(mockWeatherData);
      expect(result.current.weatherLoading).toBe(false);
    });

    it('fetchWeatherForecast sets weather to null when API returns non-ok', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      await act(async () => {
        await result.current.fetchWeatherForecast('94105', '2026-04-15T14:00');
      });

      expect(result.current.weather).toBeNull();
      expect(result.current.weatherLoading).toBe(false);
    });

    it('fetchWeatherForecast does nothing when zipCode is not 5 digits', async () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      await act(async () => {
        await result.current.fetchWeatherForecast('941', '2026-04-15T14:00');
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.weatherLoading).toBe(false);
      expect(result.current.weather).toBeNull();
    });

    it('fetchWeatherForecast does nothing when date is missing', async () => {
      const { result } = renderHook(() => usePartyPlanner(), { wrapper });

      await act(async () => {
        await result.current.fetchWeatherForecast('94105', null);
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.weatherLoading).toBe(false);
      expect(result.current.weather).toBeNull();
    });
  });
});
