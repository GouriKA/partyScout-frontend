import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WizardContainer from '../WizardContainer';
import { PartyPlannerProvider, usePartyPlanner } from '../../../context/PartyPlannerContext';
import { useEffect } from 'react';

// Mock fetch
global.fetch = vi.fn();

// Helper component to set context values
function TestWrapper({ children, step = 1, childName = '' }) {
  return (
    <PartyPlannerProvider>
      <ContextSetter step={step} childName={childName} />
      {children}
    </PartyPlannerProvider>
  );
}

function ContextSetter({ step, childName }) {
  const { goToStep, updateChildInfo } = usePartyPlanner();

  useEffect(() => {
    goToStep(step);
    if (childName) {
      updateChildInfo({ name: childName });
    }
  }, [step, childName]);

  return null;
}

describe('WizardContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
  });

  it('renders wizard header', () => {
    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/plan your birthday party/i)).toBeInTheDocument();
  });

  it('renders wizard subtitle', () => {
    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/find the perfect venue/i)).toBeInTheDocument();
  });

  it('renders step indicator', () => {
    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    // Step indicator should have 5 step buttons
    const stepButtons = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('step-button') || btn.closest('.step-indicator')
    );
    expect(stepButtons.length).toBeGreaterThanOrEqual(5);
  });

  it('displays personalized title when child name is provided', () => {
    render(
      <TestWrapper childName="Emma">
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/plan emma's birthday party/i)).toBeInTheDocument();
  });

  it('renders Step1_ChildInfo on step 1', () => {
    render(
      <TestWrapper step={1}>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/tell us about/i)).toBeInTheDocument();
  });

  it('renders Step2_Preferences on step 2', () => {
    render(
      <TestWrapper step={2}>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/what kind of party/i)).toBeInTheDocument();
  });

  it('renders Step3_Location on step 3', () => {
    render(
      <TestWrapper step={3}>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/where should we look/i)).toBeInTheDocument();
  });

  it('has wizard container class', () => {
    const { container } = render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    expect(container.querySelector('.wizard-container')).toBeInTheDocument();
  });

  it('has wizard content area', () => {
    const { container } = render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    expect(container.querySelector('.wizard-content')).toBeInTheDocument();
  });

  it('defaults to step 1 for invalid step numbers', () => {
    render(
      <TestWrapper step={99}>
        <WizardContainer />
      </TestWrapper>
    );

    // Should render Step1_ChildInfo as default
    expect(screen.getByText(/tell us about/i)).toBeInTheDocument();
  });
});
