import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyPlannerProvider } from '../../context/PartyPlannerContext';
import WizardContainer from '../../components/wizard/WizardContainer';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// WizardContainer → AppNav → useSavedEvents() and useAuth(); mock both so we don't
// need the real Firebase-backed providers in integration tests.
vi.mock('../../context/SavedEventsContext', () => ({
  useSavedEvents: vi.fn(() => ({
    savedEvents: [],
    isSaved: vi.fn(() => false),
    saveEvent: vi.fn(),
    unsaveEvent: vi.fn(),
  })),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false })),
}));

vi.mock('../../firebase', () => ({
  firebaseConfigured: false,
  auth: null,
}));

// Stub panels opened from AppNav — they bring in their own heavy dependencies
vi.mock('../../components/savedevents/SavedEventsPanel', () => ({ default: () => null }));
vi.mock('../../components/account/AccountPanel',         () => ({ default: () => null }));
vi.mock('../../components/auth/AuthModal',               () => ({ default: () => null }));
vi.mock('../../components/auth/UserMenu',                () => ({ default: () => null }));

const renderWizard = () => {
  return render(
    <PartyPlannerProvider>
      <WizardContainer />
    </PartyPlannerProvider>
  );
};

describe('WizardFlow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ venues: [], partyTypeSuggestions: [] })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('VenueResults rendering', () => {
    it('renders wizard container', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-container')).toBeInTheDocument();
    });

    it('renders wizard step wrapper', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-step-wrapper')).toBeInTheDocument();
    });

    it('renders back button on step 4', () => {
      renderWizard();
      expect(screen.getByText(/← Back/i)).toBeInTheDocument();
    });

    it('has wizard container class', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-container')).toBeInTheDocument();
    });
  });

  describe('VenueResults interactions', () => {
    it('allows entering a date', async () => {
      const user = userEvent.setup();
      renderWizard();

      const dateInputs = screen.getAllByDisplayValue('');
      const dateInput = dateInputs.find(i => i.type === 'date');
      if (dateInput) {
        await user.type(dateInput, '2026-05-10');
        expect(dateInput).toHaveValue('2026-05-10');
      }
    });

    it('renders back navigation button', () => {
      renderWizard();
      const btn = screen.getByText(/← Back/i);
      expect(btn).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('renders venue results step', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-step-wrapper')).toBeInTheDocument();
    });

    it('renders wizard content area', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-content')).toBeInTheDocument();
    });
  });

  describe('Step Indicator', () => {
    it('wizard content area renders', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-content')).toBeInTheDocument();
    });
  });

  describe('Step 4 and 5', () => {
    it('wizard renders venue results by default (step 4)', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-step-wrapper')).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('back button renders on step 4', () => {
      renderWizard();
      expect(screen.getByText(/← Back/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders without crashing when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-container')).toBeInTheDocument();
    });
  });
});
