import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../LandingPage';

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock CityAutocomplete so we don't need to wire up fetch in every test
vi.mock('../../common/CityAutocomplete', () => ({
  default: ({ value, onChange, placeholder, className }) => (
    <input
      data-testid="city-input"
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock ChatPanel — it mounts even when closed and reads localStorage;
// stubbing it keeps tests focused on LandingPage logic.
vi.mock('../../chat/ChatPanel', () => ({
  default: () => <div data-testid="chat-panel" />,
}));

// Mock Firebase — firebaseConfigured = false so auth buttons are hidden
vi.mock('../../../firebase', () => ({ firebaseConfigured: false }));

// Mock AuthModal, UserMenu, SavedEventsPanel, AccountPanel
vi.mock('../../auth/AuthModal', () => ({ default: () => <div data-testid="auth-modal" /> }));
vi.mock('../../auth/UserMenu', () => ({ default: () => <div data-testid="user-menu" /> }));
vi.mock('../../savedevents/SavedEventsPanel', () => ({
  default: ({ open, onClose }) =>
    open ? <div data-testid="saved-panel"><button onClick={onClose}>Close</button></div> : null,
}));
vi.mock('../../account/AccountPanel', () => ({
  default: ({ open }) => (open ? <div data-testid="account-panel" /> : null),
}));

// Context mocks
const mockUpdateChildInfo = vi.fn();
const mockUpdateLocation = vi.fn();
const mockUpdatePreferences = vi.fn();
const mockSearchVenuesByQuery = vi.fn();
const mockGoToStep = vi.fn();
const mockSelectVenue = vi.fn();

vi.mock('../../../context/PartyPlannerContext', () => ({
  usePartyPlanner: () => ({
    updateChildInfo: mockUpdateChildInfo,
    updateLocation: mockUpdateLocation,
    updatePreferences: mockUpdatePreferences,
    searchVenuesByQuery: mockSearchVenuesByQuery,
    goToStep: mockGoToStep,
    selectVenue: mockSelectVenue,
  }),
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

const mockSavedEvents = { savedEvents: [] };
vi.mock('../../../context/SavedEventsContext', () => ({
  useSavedEvents: () => mockSavedEvents,
}));

// ── Helpers ────────────────────────────────────────────────────────────────

function renderLandingPage(onStart = vi.fn()) {
  return render(<LandingPage onStart={onStart} />);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LandingPage', () => {
  beforeEach(() => {
    mockSavedEvents.savedEvents = [];
    vi.clearAllMocks();
  });

  // ── Section rendering ──────────────────────────────────────────────────

  describe('renders all 7 sections', () => {
    it('renders the nav bar with logo', () => {
      renderLandingPage();
      expect(screen.getByText('Party')).toBeInTheDocument();
    });

    it('renders the navbar with logo', () => {
      renderLandingPage();
      // Use exact string match — the logo renders "Party" and "Scout" in separate spans;
      // a regex like /Party/ would also match parent containers causing a "multiple elements" error.
      expect(screen.getByText('Party')).toBeInTheDocument();
      expect(screen.getByText('Scout')).toBeInTheDocument();
    });

    it('renders the hero section', () => {
      renderLandingPage();
      expect(screen.getByText(/every celebration/i)).toBeInTheDocument();
      // Eyebrow text inside the hero
      expect(screen.getByText(/plan the perfect party/i)).toBeInTheDocument();
    });

    it('renders the persona chips section', () => {
      renderLandingPage();
      expect(screen.getByText(/who's celebrating/i)).toBeInTheDocument();
    });

    it('renders the idea cards section', () => {
      renderLandingPage();
      // At least one idea card title should appear
      expect(screen.getByText('Escape Room')).toBeInTheDocument();
      expect(screen.getByText('Boba Tea')).toBeInTheDocument();
    });

    it('renders the how it works section', () => {
      renderLandingPage();
      expect(screen.getByText(/how it works/i)).toBeInTheDocument();
      expect(screen.getByText(/pick an occasion/i)).toBeInTheDocument();
    });

    it('renders the footer CTA section', () => {
      renderLandingPage();
      expect(screen.getByText(/start planning something/i)).toBeInTheDocument();
    });
  });

  // ── Hero CTA buttons ───────────────────────────────────────────────────
  // Note: the hero "Find venues →" button opens the AI chat panel, not the wizard.
  // onStart is triggered by footer CTAs, persona chips, and idea card clicks.

  describe('hero and footer CTAs', () => {
    it('renders the unified search "Find" button', () => {
      renderLandingPage();
      expect(screen.getByRole('button', { name: /find →/i })).toBeInTheDocument();
    });

    it('calls onStart when footer "Find birthday ideas" CTA is clicked', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByRole('button', { name: /find birthday ideas/i }));
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('calls onStart when footer "Browse all occasions" CTA is clicked', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByRole('button', { name: /browse all occasions/i }));
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  // ── Persona chips ──────────────────────────────────────────────────────

  describe('persona chips', () => {
    it('renders all 4 persona chips', () => {
      renderLandingPage();
      expect(screen.getByText('Little Kids')).toBeInTheDocument();
      expect(screen.getByText('Tweens')).toBeInTheDocument();
      expect(screen.getByText('Teens')).toBeInTheDocument();
      expect(screen.getByText('Adults')).toBeInTheDocument();
    });

    it('shows correct age range for Little Kids (Under 7)', () => {
      renderLandingPage();
      expect(screen.getByText('Under 7')).toBeInTheDocument();
    });

    it('shows correct age range for Tweens (Ages 8–13)', () => {
      renderLandingPage();
      expect(screen.getByText('Ages 8\u201313')).toBeInTheDocument();
    });

    it('shows correct age range for Teens (Ages 14–17)', () => {
      renderLandingPage();
      expect(screen.getByText('Ages 14\u201317')).toBeInTheDocument();
    });

    it('shows correct age range for Adults (18 & over)', () => {
      renderLandingPage();
      expect(screen.getByText('18 & over')).toBeInTheDocument();
    });

    it('clicking Little Kids chip calls updateChildInfo with age 6', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByText('Little Kids').closest('button'));
      expect(mockUpdateChildInfo).toHaveBeenCalledWith({ age: 6 });
    });

    it('clicking Tweens chip calls updateChildInfo with age 10', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByText('Tweens').closest('button'));
      expect(mockUpdateChildInfo).toHaveBeenCalledWith({ age: 10 });
    });

    it('clicking Teens chip calls updateChildInfo with age 15', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByText('Teens').closest('button'));
      expect(mockUpdateChildInfo).toHaveBeenCalledWith({ age: 15 });
    });

    it('clicking Adults chip calls updateChildInfo with age 25', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByText('Adults').closest('button'));
      expect(mockUpdateChildInfo).toHaveBeenCalledWith({ age: 25 });
    });

    it('clicking a persona chip calls onStart', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByText('Teens').closest('button'));
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  // ── Idea cards ─────────────────────────────────────────────────────────

  describe('idea cards', () => {
    // There are two CityAutocomplete instances (hero search bar + cards section);
    // change the first one — both share the same cityValue state.
    function renderWithCity(onStart = vi.fn(), city = 'London') {
      const result = renderLandingPage(onStart);
      const inputs = screen.getAllByTestId('city-input');
      fireEvent.change(inputs[0], { target: { value: city } });
      return result;
    }

    it('clicking Boba Tea card calls searchVenuesByQuery with "boba tea"', () => {
      const onStart = vi.fn();
      renderWithCity(onStart);
      fireEvent.click(screen.getByText('Boba Tea').closest('.lp-card'));
      expect(mockSearchVenuesByQuery).toHaveBeenCalledWith('boba tea', 'London');
    });

    it('clicking Escape Room card calls searchVenuesByQuery with "escape room"', () => {
      const onStart = vi.fn();
      renderWithCity(onStart);
      fireEvent.click(screen.getByText('Escape Room').closest('.lp-card'));
      expect(mockSearchVenuesByQuery).toHaveBeenCalledWith('escape room', 'London');
    });

    it('clicking Ice Cream card calls searchVenuesByQuery with "ice cream parlour"', () => {
      const onStart = vi.fn();
      renderWithCity(onStart);
      fireEvent.click(screen.getByText('Ice Cream').closest('.lp-card'));
      expect(mockSearchVenuesByQuery).toHaveBeenCalledWith('ice cream parlour', 'London');
    });

    it('clicking Pottery card calls searchVenuesByQuery with "pottery workshop"', () => {
      const onStart = vi.fn();
      renderWithCity(onStart);
      fireEvent.click(screen.getByText('Pottery').closest('.lp-card'));
      expect(mockSearchVenuesByQuery).toHaveBeenCalledWith('pottery workshop', 'London');
    });

    it('clicking Archery card calls searchVenuesByQuery with "archery experience"', () => {
      const onStart = vi.fn();
      renderWithCity(onStart);
      fireEvent.click(screen.getByText('Archery').closest('.lp-card'));
      expect(mockSearchVenuesByQuery).toHaveBeenCalledWith('archery experience', 'London');
    });

    it('clicking a card calls goToStep(4)', () => {
      const onStart = vi.fn();
      renderWithCity(onStart);
      fireEvent.click(screen.getByText('Boba Tea').closest('.lp-card'));
      expect(mockGoToStep).toHaveBeenCalledWith(4);
    });

    it('clicking a card calls onStart', () => {
      const onStart = vi.fn();
      renderWithCity(onStart);
      fireEvent.click(screen.getByText('Boba Tea').closest('.lp-card'));
      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it('clicking a card without city does not call searchVenuesByQuery', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      fireEvent.click(screen.getByText('Boba Tea').closest('.lp-card'));
      expect(mockSearchVenuesByQuery).not.toHaveBeenCalled();
    });
  });

  // ── City input ─────────────────────────────────────────────────────────

  describe('city input', () => {
    it('renders city input with placeholder', () => {
      renderLandingPage();
      expect(screen.getByPlaceholderText(/any city/i)).toBeInTheDocument();
    });

    it('typing in city input updates the value', () => {
      renderLandingPage();
      // Two CityAutocomplete instances exist; change the first (hero search bar)
      const inputs = screen.getAllByTestId('city-input');
      fireEvent.change(inputs[0], { target: { value: 'London' } });
      expect(inputs[0]).toHaveValue('London');
    });

    it('when city is set and a footer CTA is clicked, updateLocation is called', () => {
      // A card click with city set triggers updateLocation + searchVenuesByQuery
      const onStart = vi.fn();
      renderLandingPage(onStart);
      const inputs = screen.getAllByTestId('city-input');
      fireEvent.change(inputs[0], { target: { value: 'Manchester' } });
      fireEvent.click(screen.getByText('Boba Tea').closest('.lp-card'));
      expect(mockUpdateLocation).toHaveBeenCalledWith({ city: 'Manchester' });
    });

    it('when city is empty and a card is clicked, updateLocation is NOT called', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      // No city set — card click opens chat instead of searching venues
      fireEvent.click(screen.getByText('Boba Tea').closest('.lp-card'));
      expect(mockUpdateLocation).not.toHaveBeenCalled();
    });

    it('when city is set and a card is clicked, updateLocation and searchVenuesByQuery are called', () => {
      const onStart = vi.fn();
      renderLandingPage(onStart);
      const inputs = screen.getAllByTestId('city-input');
      fireEvent.change(inputs[0], { target: { value: 'Bristol' } });
      fireEvent.click(screen.getByText('Boba Tea').closest('.lp-card'));
      expect(mockUpdateLocation).toHaveBeenCalledWith({ city: 'Bristol' });
      expect(mockSearchVenuesByQuery).toHaveBeenCalledWith('boba tea', 'Bristol');
    });
  });

  // ── Saved button ───────────────────────────────────────────────────────

  describe('Saved button', () => {
    it('shows "Saved" without count when no events', () => {
      mockSavedEvents.savedEvents = [];
      renderLandingPage();
      const savedBtn = screen.getByRole('button', { name: /saved/i });
      expect(savedBtn).toHaveTextContent(/^★\s*Saved$/);
    });

    it('shows count in button text when events exist', () => {
      mockSavedEvents.savedEvents = [{ id: 'e1' }, { id: 'e2' }];
      renderLandingPage();
      expect(screen.getByRole('button', { name: /saved/i })).toHaveTextContent('Saved (2)');
    });

    it('shows saved panel when Saved button is clicked', () => {
      renderLandingPage();
      fireEvent.click(screen.getByRole('button', { name: /saved/i }));
      expect(screen.getByTestId('saved-panel')).toBeInTheDocument();
    });

    it('active class is applied when saved events exist', () => {
      mockSavedEvents.savedEvents = [{ id: 'e1' }];
      renderLandingPage();
      const btn = screen.getByRole('button', { name: /saved/i });
      expect(btn).toHaveClass('lp-nav-saved--active');
    });

    it('active class is NOT applied when no saved events', () => {
      mockSavedEvents.savedEvents = [];
      renderLandingPage();
      const btn = screen.getByRole('button', { name: /saved/i });
      expect(btn).not.toHaveClass('lp-nav-saved--active');
    });
  });

  // ── Occasion pills ─────────────────────────────────────────────────────

  describe('occasion pills', () => {
    it('renders Birthday and Just because pills', () => {
      renderLandingPage();
      // There may be multiple buttons containing "birthday" — use getAllByRole and check at least one exists
      const birthdayButtons = screen.getAllByRole('button', { name: /birthday/i });
      expect(birthdayButtons.length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /just because/i })).toBeInTheDocument();
    });

    it('section title shows "Top party ideas" by default', () => {
      renderLandingPage();
      expect(screen.getByText(/top party ideas near you/i)).toBeInTheDocument();
    });

    it('section title changes to "Top ideas near you" when Just because is selected', () => {
      renderLandingPage();
      fireEvent.click(screen.getByRole('button', { name: /just because/i }));
      expect(screen.getByText(/top ideas near you/i)).toBeInTheDocument();
    });
  });

  // ── See all link ───────────────────────────────────────────────────────

  describe('"See all" link', () => {
    it('clicking See all calls onSeeAll if provided', () => {
      const onSeeAll = vi.fn();
      render(<LandingPage onStart={vi.fn()} onSeeAll={onSeeAll} />);
      fireEvent.click(screen.getByText(/see all/i));
      expect(onSeeAll).toHaveBeenCalledTimes(1);
    });

    it('clicking See all does not call searchVenuesByQuery', () => {
      renderLandingPage();
      fireEvent.click(screen.getByText(/see all/i));
      expect(mockSearchVenuesByQuery).not.toHaveBeenCalled();
    });
  });
});
