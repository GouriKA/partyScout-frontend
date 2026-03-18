import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SaveModal from '../SaveModal';

// Mock useSavedEvents so tests don't need a real context tree
vi.mock('../../../context/SavedEventsContext', () => ({
  useSavedEvents: vi.fn(),
}));

import { useSavedEvents } from '../../../context/SavedEventsContext';

const mockVenue = {
  id: 'venue-1',
  name: 'Sky Zone Trampoline Park',
};

const defaultContextValue = {
  profiles: [],
  saveEvent: vi.fn(),
  createProfile: vi.fn(),
};

describe('SaveModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSavedEvents.mockReturnValue(defaultContextValue);
  });

  it('renders "Who is this for?" title and venue name', () => {
    render(<SaveModal venue={mockVenue} onClose={vi.fn()} />);

    expect(screen.getByText('Who is this for?')).toBeInTheDocument();
    expect(screen.getByText('Sky Zone Trampoline Park')).toBeInTheDocument();
  });

  it('shows "Just save it" option selected by default', () => {
    render(<SaveModal venue={mockVenue} onClose={vi.fn()} />);

    const justSaveRadio = screen.getByRole('radio', { name: /just save it/i });
    expect(justSaveRadio).toBeChecked();
  });

  it('shows existing profiles from context', () => {
    useSavedEvents.mockReturnValue({
      ...defaultContextValue,
      profiles: [
        { id: 10, name: 'Emma', age: 7 },
        { id: 11, name: null, age: 5 },
      ],
    });

    render(<SaveModal venue={mockVenue} onClose={vi.fn()} />);

    expect(screen.getByText('Emma (age 7)')).toBeInTheDocument();
    expect(screen.getByText('Age 5')).toBeInTheDocument();
  });

  it('clicking "Add child" reveals name and age fields', () => {
    render(<SaveModal venue={mockVenue} onClose={vi.fn()} />);

    const addChildRadio = screen.getByRole('radio', { name: /\+ add child/i });
    fireEvent.click(addChildRadio);

    expect(screen.getByPlaceholderText('Name (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Age *')).toBeInTheDocument();
  });

  it('Save button calls saveEvent and closes modal', async () => {
    const saveEvent = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    useSavedEvents.mockReturnValue({ ...defaultContextValue, saveEvent });

    render(<SaveModal venue={mockVenue} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(saveEvent).toHaveBeenCalledWith(mockVenue, null);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error message if age is invalid when adding child', async () => {
    render(<SaveModal venue={mockVenue} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('radio', { name: /\+ add child/i }));
    fireEvent.change(screen.getByPlaceholderText('Age *'), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid age (1–18).')).toBeInTheDocument();
    });
  });

  it('Cancel button calls onClose', () => {
    const onClose = vi.fn();
    render(<SaveModal venue={mockVenue} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
