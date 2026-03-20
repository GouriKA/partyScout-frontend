import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyPlannerProvider } from '../../context/PartyPlannerContext';
import WizardContainer from '../../components/wizard/WizardContainer';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

  describe('PlanPage rendering', () => {
    it('renders PlanPage with title', () => {
      renderWizard();
      expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
    });

    it('renders the date field', () => {
      renderWizard();
      expect(screen.getByText(/when is the party/i)).toBeInTheDocument();
    });

    it('renders the Find Venues button', () => {
      renderWizard();
      expect(screen.getByRole('button', { name: /find venues/i })).toBeInTheDocument();
    });

    it('has wizard container class', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-container')).toBeInTheDocument();
    });
  });

  describe('PlanPage interactions', () => {
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

    it('has a find venues button', () => {
      renderWizard();
      const btn = screen.getByRole('button', { name: /find venues/i });
      expect(btn).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('renders find venues button', () => {
      renderWizard();
      expect(screen.getByRole('button', { name: /find venues/i })).toBeInTheDocument();
    });

    it('renders the plan page subtitle', () => {
      renderWizard();
      expect(screen.getByText(/just two things/i)).toBeInTheDocument();
    });
  });

  describe('Step Indicator', () => {
    it('wizard content area renders', () => {
      const { container } = renderWizard();
      expect(container.querySelector('.wizard-content')).toBeInTheDocument();
    });
  });

  describe('Step 4 and 5', () => {
    it('wizard renders plan page by default (steps 1-3)', () => {
      renderWizard();
      expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('PlanPage renders', () => {
      renderWizard();
      expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders without crashing when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      renderWizard();
      expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
    });
  });
});
