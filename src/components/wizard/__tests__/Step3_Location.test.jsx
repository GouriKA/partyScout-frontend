import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step3_Location from '../Step3_Location';
import { PartyPlannerProvider } from '../../../context/PartyPlannerContext';

// Mock fetch
global.fetch = vi.fn();

const renderWithContext = (ui) => {
  return render(
    <PartyPlannerProvider>
      {ui}
    </PartyPlannerProvider>
  );
};

describe('Step3_Location', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ venues: [], partyTypeSuggestions: [] })
    });
  });

  it('renders zip code input', () => {
    renderWithContext(<Step3_Location />);

    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
  });

  it('renders step title', () => {
    renderWithContext(<Step3_Location />);

    expect(screen.getByText(/where should we look/i)).toBeInTheDocument();
  });

  it('renders setting options section', () => {
    renderWithContext(<Step3_Location />);

    // Check for the section label
    expect(screen.getByText(/indoor or outdoor/i)).toBeInTheDocument();
  });

  it('renders all setting option buttons', () => {
    renderWithContext(<Step3_Location />);

    // Find all setting option buttons
    const settingButtons = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('setting-option')
    );

    // Should have 3 setting options: No preference, Indoor, Outdoor
    expect(settingButtons.length).toBe(3);
  });

  it('renders distance slider', () => {
    renderWithContext(<Step3_Location />);

    expect(screen.getByText(/how far are you willing to travel/i)).toBeInTheDocument();
  });

  it('allows entering zip code', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step3_Location />);

    const zipInput = screen.getByLabelText(/zip code/i);
    await user.type(zipInput, '94105');

    expect(zipInput).toHaveValue('94105');
  });

  it('only allows numeric input for zip code', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step3_Location />);

    const zipInput = screen.getByLabelText(/zip code/i);
    await user.type(zipInput, '94abc105xyz');

    // Should only have numeric characters, limited to 5
    expect(zipInput).toHaveValue('94105');
  });

  it('limits zip code to 5 digits', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step3_Location />);

    const zipInput = screen.getByLabelText(/zip code/i);
    await user.type(zipInput, '9410512345');

    expect(zipInput).toHaveValue('94105');
  });

  it('allows selecting indoor setting', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step3_Location />);

    // Find the Indoor button within setting-options
    const settingOptions = document.querySelector('.setting-options');
    const indoorButton = within(settingOptions).getByText(/^indoor$/i).closest('button');

    await user.click(indoorButton);

    expect(indoorButton).toHaveClass('selected');
  });

  it('allows selecting outdoor setting', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step3_Location />);

    // Find the Outdoor button within setting-options
    const settingOptions = document.querySelector('.setting-options');
    const outdoorButton = within(settingOptions).getByText(/^outdoor$/i).closest('button');

    await user.click(outdoorButton);

    expect(outdoorButton).toHaveClass('selected');
  });

  it('disables Find Venues button when zip code is incomplete', () => {
    renderWithContext(<Step3_Location />);

    const findButton = screen.getByRole('button', { name: /find venues/i });
    expect(findButton).toBeDisabled();
  });

  it('enables Find Venues button when zip code is valid', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step3_Location />);

    const zipInput = screen.getByLabelText(/zip code/i);
    await user.type(zipInput, '94105');

    const findButton = screen.getByRole('button', { name: /find venues/i });
    expect(findButton).not.toBeDisabled();
  });

  it('has a back button', () => {
    renderWithContext(<Step3_Location />);

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('shows hint text for zip code input', () => {
    renderWithContext(<Step3_Location />);

    expect(screen.getByText(/search for venues near this location/i)).toBeInTheDocument();
  });
});
