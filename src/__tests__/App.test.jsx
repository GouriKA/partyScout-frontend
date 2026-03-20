import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock firebase so AuthProvider does not need real credentials
vi.mock('../firebase', () => ({
  firebaseConfigured: false,
  auth: null
}));

// Mock AuthContext to avoid real Firebase auth setup
vi.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: vi.fn(() => ({ user: null, loading: false }))
}));

// Mock WizardContainer to keep tests focused on App-level output
vi.mock('../components/wizard/WizardContainer', () => ({
  default: () => <div data-testid="wizard-container">WizardContainer</div>
}));

// Mock ErrorBoundary to render children directly
vi.mock('../components/common/ErrorBoundary', () => ({
  default: ({ children }) => <>{children}</>
}));

// Mock fetch to prevent real network calls from PartyPlannerContext
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve([])
});

describe('App — early access banner', () => {
  it('renders the early access banner', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.early-access-banner')).toBeInTheDocument();
  });

  it('banner contains the development message', () => {
    render(<App />);

    expect(screen.getByText(/we're still in development/i)).toBeInTheDocument();
  });

  it('banner has a share thoughts button', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /share thoughts/i })).toBeInTheDocument();
  });
});
