import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WizardContainer from '../WizardContainer';
import { PartyPlannerProvider, usePartyPlanner } from '../../../context/PartyPlannerContext';
import { useEffect } from 'react';

// Mock fetch
global.fetch = vi.fn();

// Mutable firebase configured flag so tests can control it
let mockFirebaseConfigured = false;

// Mock AuthContext so WizardContainer can destructure useAuth() in all tests
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock firebase using a getter so individual tests can flip the flag
vi.mock('../../../firebase', () => ({
  get firebaseConfigured() { return mockFirebaseConfigured; },
  auth: null
}));

// Mock auth child components to keep rendering simple
vi.mock('../../auth/AuthModal', () => ({
  default: ({ onClose }) => <div data-testid="auth-modal"><button onClick={onClose}>Close</button></div>
}));

vi.mock('../../auth/UserMenu', () => ({
  default: () => <div data-testid="user-menu">UserMenu</div>
}));

import { useAuth } from '../../../context/AuthContext';

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
    mockFirebaseConfigured = false;
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
    // Default auth state: no user, not loading
    useAuth.mockReturnValue({ user: null, loading: false });
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

describe('auth modal auto-close', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFirebaseConfigured = true;
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
  });

  it('auth modal is not shown by default', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  it('auth modal closes when user becomes authenticated', async () => {
    // Start with no user — Sign In button is visible (firebaseConfigured=true)
    useAuth.mockReturnValue({ user: null, loading: false });

    const { rerender } = render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    // Click Sign In to open the modal
    const signInBtn = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInBtn);

    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();

    // Simulate user becoming authenticated
    useAuth.mockReturnValue({ user: { uid: 'user-123', email: 'test@example.com' }, loading: false });

    rerender(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
    });
  });
});
