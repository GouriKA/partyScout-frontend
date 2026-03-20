import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Step1_ChildInfo from '../Step1_ChildInfo';
import { PartyPlannerProvider } from '../../../context/PartyPlannerContext';

// Wrapper component with context
const renderWithContext = (ui) => {
  return render(
    <PartyPlannerProvider>
      {ui}
    </PartyPlannerProvider>
  );
};

describe('Step1_ChildInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step title', () => {
    renderWithContext(<Step1_ChildInfo />);

    expect(screen.getByText(/tell us about/i)).toBeInTheDocument();
  });

  it('renders age input', () => {
    renderWithContext(<Step1_ChildInfo />);

    // Actual label is "How old will they be turning?"
    expect(screen.getByLabelText(/how old/i)).toBeInTheDocument();
  });

  it('renders party date input', () => {
    renderWithContext(<Step1_ChildInfo />);

    expect(screen.getByLabelText(/party date/i)).toBeInTheDocument();
  });

  it('allows selecting age', async () => {
    const user = userEvent.setup();
    renderWithContext(<Step1_ChildInfo />);

    const ageInput = screen.getByLabelText(/how old/i);
    await user.clear(ageInput);
    await user.type(ageInput, '7');

    expect(ageInput).toHaveValue(7);
  });

  it('has a continue button', () => {
    renderWithContext(<Step1_ChildInfo />);

    // Actual button says "Continue to Party Type"
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('validates age is within range', async () => {
    renderWithContext(<Step1_ChildInfo />);

    const ageInput = screen.getByLabelText(/how old/i);

    // Age input should have min and max attributes
    expect(ageInput).toHaveAttribute('min', '1');
    expect(ageInput).toHaveAttribute('max', '18');
  });

  it('renders start time input', () => {
    renderWithContext(<Step1_ChildInfo />);

    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
  });
});
