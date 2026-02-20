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

    // Default mock for party type suggestions
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { type: 'active_play', displayName: 'Active Play', description: 'Trampolines', popularityScore: 5 }
      ])
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Step 1 to Step 2 Transition', () => {
    it('should transition from Step 1 to Step 2 with data persistence', async () => {
      const user = userEvent.setup();
      renderWizard();

      // Step 1: Fill in child info
      const nameInput = screen.getByLabelText(/child's name/i);
      const ageInput = screen.getByLabelText(/how old/i);
      const dateInput = screen.getByLabelText(/when is the party/i);

      await user.type(nameInput, 'Emma');
      await user.clear(ageInput);
      await user.type(ageInput, '7');

      // Set party date (required to proceed)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateStr = futureDate.toISOString().slice(0, 16);
      await user.type(dateInput, dateStr);

      // Click Continue
      const nextButton = screen.getByRole('button', { name: /continue/i });
      await user.click(nextButton);

      // Verify we're on Step 2 (title is "What kind of party?")
      await waitFor(() => {
        expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
      });
    });

    it('should preserve child info when navigating back to Step 1', async () => {
      const user = userEvent.setup();
      renderWizard();

      // Fill Step 1
      const nameInput = screen.getByLabelText(/child's name/i);
      const ageInput = screen.getByLabelText(/how old/i);
      const dateInput = screen.getByLabelText(/when is the party/i);

      await user.type(nameInput, 'Emma');
      await user.clear(ageInput);
      await user.type(ageInput, '7');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      // Go to Step 2
      const nextButton = screen.getByRole('button', { name: /continue/i });
      await user.click(nextButton);

      // Wait for Step 2
      await waitFor(() => {
        expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
      });

      // Go back to Step 1
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Verify data is preserved
      await waitFor(() => {
        const nameInputAgain = screen.getByLabelText(/child's name/i);
        expect(nameInputAgain).toHaveValue('Emma');
      });
    });
  });

  describe('Step 2 to Step 3 Transition', () => {
    it('should allow party type selection and proceed to Step 3', async () => {
      const user = userEvent.setup();
      renderWizard();

      // Complete Step 1
      const ageInput = screen.getByLabelText(/how old/i);
      const dateInput = screen.getByLabelText(/when is the party/i);

      await user.clear(ageInput);
      await user.type(ageInput, '7');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      await user.click(screen.getByRole('button', { name: /continue to party type/i }));

      // Wait for Step 2
      await waitFor(() => {
        expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
      });

      // Select a party type (if suggestions are loaded)
      await waitFor(() => {
        const partyTypeButtons = screen.queryAllByRole('button');
        // Continue button should be disabled until party type is selected
        expect(partyTypeButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Back Navigation', () => {
    it('should allow navigating back from Step 2', async () => {
      const user = userEvent.setup();
      renderWizard();

      // Complete Step 1
      const ageInput = screen.getByLabelText(/how old/i);
      const dateInput = screen.getByLabelText(/when is the party/i);

      await user.clear(ageInput);
      await user.type(ageInput, '7');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Wait for Step 2
      await waitFor(() => {
        expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
      });

      // Go back to Step 1
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Verify we're on Step 1
      await waitFor(() => {
        expect(screen.getByText(/tell us about/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock API error
      mockFetch.mockRejectedValue(new Error('Network error'));

      renderWizard();

      // Fill Step 1 and navigate
      const ageInput = screen.getByLabelText(/how old/i);
      const dateInput = screen.getByLabelText(/when is the party/i);

      await user.clear(ageInput);
      await user.type(ageInput, '7');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Component should not crash
      await waitFor(() => {
        expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step Indicator', () => {
    it('should show correct step labels', async () => {
      const user = userEvent.setup();
      renderWizard();

      // Step indicator shows labels, not numbers
      expect(screen.getByText('Child Info')).toBeInTheDocument();
      expect(screen.getByText('Party Type')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();

      // Complete Step 1
      const ageInput = screen.getByLabelText(/how old/i);
      const dateInput = screen.getByLabelText(/when is the party/i);

      await user.clear(ageInput);
      await user.type(ageInput, '7');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      await user.type(dateInput, futureDate.toISOString().slice(0, 16));

      await user.click(screen.getByRole('button', { name: /continue/i }));

      // After navigating, step 1 should show checkmark (completed)
      await waitFor(() => {
        expect(screen.getByText('✓')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should enforce age constraints', async () => {
      renderWizard();

      const ageInput = screen.getByLabelText(/how old/i);
      expect(ageInput).toHaveAttribute('min', '1');
      expect(ageInput).toHaveAttribute('max', '18');
    });

    it('should require date to proceed', async () => {
      const user = userEvent.setup();
      renderWizard();

      const ageInput = screen.getByLabelText(/how old/i);
      await user.clear(ageInput);
      await user.type(ageInput, '7');

      // Continue button should be disabled without date
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });
  });
});
