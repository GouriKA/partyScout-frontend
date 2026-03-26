import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SavedEventsProvider, useSavedEvents } from '../SavedEventsContext';

// Mock useAuth — guest mode means user is null
vi.mock('../AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../AuthContext';

const wrapper = ({ children }) => (
  <SavedEventsProvider>{children}</SavedEventsProvider>
);

const GUEST_KEY = 'partyscout_guest';

describe('SavedEventsContext — guest mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Simulate guest (not logged in)
    useAuth.mockReturnValue({ user: null, getIdToken: vi.fn() });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveEvent', () => {
    it('writes event to localStorage', async () => {
      const { result } = renderHook(() => useSavedEvents(), { wrapper });

      const venue = { id: 'place-1', name: 'Sky Zone' };

      await act(async () => {
        await result.current.saveEvent(venue);
      });

      const stored = JSON.parse(localStorage.getItem(GUEST_KEY));
      expect(stored.savedEvents).toHaveLength(1);
      expect(stored.savedEvents[0].googlePlaceId).toBe('place-1');
      expect(stored.savedEvents[0].venueName).toBe('Sky Zone');
    });

    it('does not add duplicate event for the same venue and profile', async () => {
      const { result } = renderHook(() => useSavedEvents(), { wrapper });

      const venue = { id: 'place-1', name: 'Sky Zone' };

      await act(async () => {
        await result.current.saveEvent(venue);
        await result.current.saveEvent(venue); // duplicate
      });

      const stored = JSON.parse(localStorage.getItem(GUEST_KEY));
      expect(stored.savedEvents).toHaveLength(1);
    });
  });

  describe('isSaved', () => {
    it('returns true for a venue that has been saved', async () => {
      const { result } = renderHook(() => useSavedEvents(), { wrapper });

      const venue = { id: 'place-2', name: 'Bounce World' };

      await act(async () => {
        await result.current.saveEvent(venue);
      });

      expect(result.current.isSaved('place-2')).toBe(true);
    });

    it('returns false for a venue that has not been saved', () => {
      const { result } = renderHook(() => useSavedEvents(), { wrapper });

      expect(result.current.isSaved('place-unknown')).toBe(false);
    });
  });

  describe('unsaveEvent', () => {
    it('removes event from localStorage', async () => {
      const { result } = renderHook(() => useSavedEvents(), { wrapper });

      const venue = { id: 'place-3', name: 'Fun Land' };

      await act(async () => {
        await result.current.saveEvent(venue);
      });

      const stored = JSON.parse(localStorage.getItem(GUEST_KEY));
      const localId = stored.savedEvents[0].localId;

      await act(async () => {
        await result.current.unsaveEvent(localId);
      });

      const afterRemove = JSON.parse(localStorage.getItem(GUEST_KEY));
      expect(afterRemove.savedEvents).toHaveLength(0);
      expect(result.current.isSaved('place-3')).toBe(false);
    });
  });

  describe('createProfile', () => {
    it('saves profile to localStorage and returns it', async () => {
      const { result } = renderHook(() => useSavedEvents(), { wrapper });

      let profile;
      await act(async () => {
        profile = await result.current.createProfile('Emma', 7);
      });

      expect(profile.name).toBe('Emma');
      expect(profile.age).toBe(7);
      expect(profile.localId).toBeDefined();

      const stored = JSON.parse(localStorage.getItem(GUEST_KEY));
      expect(stored.profiles).toHaveLength(1);
      expect(stored.profiles[0].name).toBe('Emma');
      expect(stored.profiles[0].age).toBe(7);
    });
  });

  // ── localStorage resilience ───────────────────────────────────────────────

  describe('saveEvent — localStorage unavailable', () => {
    it('still updates in-memory state even when localStorage.setItem throws', async () => {
      // Simulate a browser/environment where localStorage writes are blocked
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const { result } = renderHook(() => useSavedEvents(), { wrapper });
      const venue = { googlePlaceId: 'gp-resilience', name: 'Resilient Venue' };

      await act(async () => {
        await result.current.saveEvent(venue);
      });

      // In-memory state must reflect the save even though localStorage failed
      expect(result.current.isSaved('gp-resilience')).toBe(true);
      expect(result.current.savedEvents).toHaveLength(1);
    });
  });

  describe('unsaveEvent — localStorage unavailable', () => {
    it('still removes from in-memory state even when localStorage.setItem throws', async () => {
      const { result } = renderHook(() => useSavedEvents(), { wrapper });
      const venue = { googlePlaceId: 'gp-unsave', name: 'Venue To Remove' };

      // Save normally first (localStorage available)
      await act(async () => {
        await result.current.saveEvent(venue);
      });
      expect(result.current.isSaved('gp-unsave')).toBe(true);

      // Now make localStorage writes fail
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const localId = result.current.savedEvents[0].localId;
      await act(async () => {
        await result.current.unsaveEvent(localId);
      });

      // In-memory state should reflect the removal
      expect(result.current.isSaved('gp-unsave')).toBe(false);
      expect(result.current.savedEvents).toHaveLength(0);
    });
  });
});
