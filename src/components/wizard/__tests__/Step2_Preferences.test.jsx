import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step2_Preferences from '../Step2_Preferences';
import { PartyPlannerProvider } from '../../../context/PartyPlannerContext';

// Mock fetch
global.fetch = vi.fn();

const mockPartyTypes = [
  {
    type: 'active_play',
    displayName: 'Active Play',
    description: 'Jump, run, and burn energy',
    icon: 'rocket',
    ageRange: 'Ages 3-16',
    averageCost: '$200-450',
    popularityScore: 5
  },
  {
    type: 'creative',
    displayName: 'Creative',
    description: 'Arts, crafts, cooking',
    icon: 'palette',
    ageRange: 'Ages 4-14',
    averageCost: '$250-500',
    popularityScore: 4
  }
];

const renderWithContext = (ui) => {
  return render(
    <PartyPlannerProvider>
      {ui}
    </PartyPlannerProvider>
  );
};

describe('Step2_Preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPartyTypes)
    });
  });

  it('renders party type selector', async () => {
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
    });
  });

  it('renders guest count input', async () => {
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument();
    });
  });

  it('renders budget slider', async () => {
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      expect(screen.getByText(/budget/i)).toBeInTheDocument();
    });
  });

  it('displays party type section', async () => {
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      // Use the section label specifically
      const sectionLabel = document.querySelector('.section-label');
      expect(sectionLabel).toBeInTheDocument();
      expect(sectionLabel).toHaveTextContent('Party Type');
    });
  });

  it('allows adjusting guest count', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument();
    });

    const guestInput = screen.getByLabelText(/number of guests/i);
    await user.clear(guestInput);
    await user.type(guestInput, '20');

    expect(guestInput).toHaveValue(20);
  });

  it('has find venues and back buttons', async () => {
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /find venues/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('renders the step description', async () => {
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      // Check that step renders without crashing
      expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('API Error'));

    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      // Should still render without crashing
      expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
    });
  });

  it('shows party type selection hint', async () => {
    renderWithContext(<Step2_Preferences />);

    await waitFor(() => {
      // The PartyTypeSelector shows a hint about max selections
      expect(screen.getByText(/select up to/i)).toBeInTheDocument();
    });
  });
});
