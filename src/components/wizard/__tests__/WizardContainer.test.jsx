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

// Mock SavedEventsContext — WizardContainer → AppNav → useSavedEvents() needs a provider.
// Mocking the module is simpler than wrapping every render in SavedEventsProvider.
vi.mock('../../../context/SavedEventsContext', () => ({
  useSavedEvents: vi.fn(() => ({
    savedEvents: [],
    isSaved: vi.fn(() => false),
    saveEvent: vi.fn(),
    unsaveEvent: vi.fn(),
  })),
}));

// Mock auth child components to keep rendering simple
vi.mock('../../auth/AuthModal', () => ({
  default: ({ onClose }) => <div data-testid="auth-modal"><button onClick={onClose}>Close</button></div>
}));

vi.mock('../../auth/UserMenu', () => ({
  default: () => <div data-testid="user-menu">UserMenu</div>
}));

// Mock panels that open from AppNav — they bring in additional context dependencies
vi.mock('../../savedevents/SavedEventsPanel', () => ({
  default: () => null,
}));
vi.mock('../../account/AccountPanel', () => ({
  default: () => null,
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

  it('renders wizard container', () => {
    const { container } = render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    expect(container.querySelector('.wizard-container')).toBeInTheDocument();
  });

  it('renders PlanPage for steps 1-3', () => {
    render(
      <TestWrapper step={1}>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
  });

  it('renders PlanPage on step 2 as well', () => {
    render(
      <TestWrapper step={2}>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
  });

  it('renders PlanPage on step 3 as well', () => {
    render(
      <TestWrapper step={3}>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
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

  it('renders PlanPage as default for unrecognized steps', () => {
    render(
      <TestWrapper step={99}>
        <WizardContainer />
      </TestWrapper>
    );

    expect(screen.getByText(/plan the party/i)).toBeInTheDocument();
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

  it('wizard renders content area', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    const { container } = render(
      <TestWrapper>
        <WizardContainer />
      </TestWrapper>
    );

    expect(container.querySelector('.wizard-content')).toBeInTheDocument();
  });
});
