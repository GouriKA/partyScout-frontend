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

  it('banner contains the text "Early Access"', () => {
    render(<App />);

    expect(screen.getByText(/Early Access/)).toBeInTheDocument();
  });

  it('feedback link has the correct mailto href', () => {
    render(<App />);

    const link = screen.getByRole('link', { name: /Share feedback/i });
    expect(link).toHaveAttribute('href', 'mailto:feedback@partyscout.live');
  });
});
