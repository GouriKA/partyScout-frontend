import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CityAutocomplete from '../CityAutocomplete';

// ── Helpers ────────────────────────────────────────────────────────────────

function renderCityAutocomplete(props = {}) {
  const defaults = {
    value: '',
    onChange: vi.fn(),
    placeholder: 'Your city...',
    className: 'city-input',
  };
  return render(<CityAutocomplete {...defaults} {...props} />);
}

/**
 * Helper: type into the city input then advance fake timers past the 300 ms
 * debounce and flush all pending microtasks (Promise chains).
 */
async function typeAndFlush(input, value) {
  fireEvent.change(input, { target: { value } });
  await act(async () => {
    vi.runAllTimers();
    // Flush microtask queue so fetch().then() chains resolve
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('CityAutocomplete', () => {
  let fetchMock;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ── Initial render ─────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders input with placeholder', () => {
      renderCityAutocomplete({ placeholder: 'Your city...' });
      expect(screen.getByPlaceholderText('Your city...')).toBeInTheDocument();
    });

    it('renders input with custom placeholder', () => {
      renderCityAutocomplete({ placeholder: 'Enter city' });
      expect(screen.getByPlaceholderText('Enter city')).toBeInTheDocument();
    });

    it('defaults placeholder to "Your city..." when not provided', () => {
      render(<CityAutocomplete value="" onChange={vi.fn()} />);
      expect(screen.getByPlaceholderText('Your city...')).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      renderCityAutocomplete({ value: 'London' });
      expect(screen.getByDisplayValue('London')).toBeInTheDocument();
    });

    it('input has role="combobox"', () => {
      renderCityAutocomplete();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('input has aria-autocomplete="list"', () => {
      renderCityAutocomplete();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('input has aria-expanded="false" initially', () => {
      renderCityAutocomplete();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('dropdown is not rendered initially', () => {
      renderCityAutocomplete();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('applies className to input', () => {
      renderCityAutocomplete({ className: 'my-city-input' });
      expect(screen.getByRole('combobox')).toHaveClass('my-city-input');
    });
  });

  // ── Fetch behaviour ────────────────────────────────────────────────────

  describe('fetch suggestions', () => {
    it('does NOT fetch for empty input', async () => {
      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, '');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does NOT fetch for whitespace-only input', async () => {
      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, '   ');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('fetches suggestions after typing and debounce delay', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London', 'Los Angeles']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/v2/places/autocomplete?input=Lo')
      );
    });

    it('URL-encodes the input in the fetch request', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve([]),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'New York');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('input=New%20York')
      );
    });

    it('debounces — only one fetch is made for rapid keypresses', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');

      // Fire multiple changes quickly (before timer fires)
      fireEvent.change(input, { target: { value: 'Lo' } });
      fireEvent.change(input, { target: { value: 'Lon' } });
      fireEvent.change(input, { target: { value: 'Lond' } });

      await act(async () => {
        vi.runAllTimers();
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(fetchMock).toHaveBeenCalledOnce();
    });
  });

  // ── Dropdown rendering ─────────────────────────────────────────────────

  describe('dropdown', () => {
    it('shows dropdown with suggestions after fetch', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London', 'Los Angeles', 'Louisville']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles')).toBeInTheDocument();
      expect(screen.getByText('Louisville')).toBeInTheDocument();
    });

    it('sets aria-expanded="true" when dropdown is open', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('does not show dropdown when fetch returns empty array', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve([]),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Zz');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not show dropdown on fetch error', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('each suggestion has role="option"', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London', 'Liverpool']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Li');

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
    });
  });

  // ── Selecting a suggestion ─────────────────────────────────────────────

  describe('selecting a suggestion', () => {
    it('clicking a suggestion calls onChange with the city', async () => {
      const onChange = vi.fn();
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London', 'Liverpool']),
      });

      renderCityAutocomplete({ onChange });
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Li');

      fireEvent.mouseDown(screen.getByText('London'));
      expect(onChange).toHaveBeenCalledWith('London');
    });

    it('selecting a suggestion sets the input value', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      fireEvent.mouseDown(screen.getByText('London'));
      expect(input).toHaveValue('London');
    });

    it('selecting a suggestion closes the dropdown', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      fireEvent.mouseDown(screen.getByText('London'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ── Keyboard navigation ────────────────────────────────────────────────

  describe('keyboard navigation', () => {
    async function openDropdownWith(input, suggestions = ['London', 'Liverpool', 'Leeds']) {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(suggestions),
      });
      await typeAndFlush(input, 'Li');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    }

    it('ArrowDown highlights the first option', async () => {
      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await openDropdownWith(input);

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('ArrowDown twice highlights the second option', async () => {
      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await openDropdownWith(input);

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('ArrowDown does not go past the last option', async () => {
      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await openDropdownWith(input, ['London', 'Liverpool']);

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // clamps at last

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('ArrowUp from first option stays at first', async () => {
      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await openDropdownWith(input, ['London', 'Liverpool']);

      fireEvent.keyDown(input, { key: 'ArrowDown' }); // go to first
      fireEvent.keyDown(input, { key: 'ArrowUp' });   // try to go above

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('Enter selects the highlighted option and calls onChange', async () => {
      const onChange = vi.fn();
      renderCityAutocomplete({ onChange });
      const input = screen.getByRole('combobox');
      await openDropdownWith(input, ['London', 'Liverpool']);

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('London');
    });

    it('Enter on second highlighted option selects it', async () => {
      const onChange = vi.fn();
      renderCityAutocomplete({ onChange });
      const input = screen.getByRole('combobox');
      await openDropdownWith(input, ['London', 'Liverpool']);

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith('Liverpool');
    });

    it('Enter without any highlighted option does nothing', async () => {
      const onChange = vi.fn();
      renderCityAutocomplete({ onChange });
      const input = screen.getByRole('combobox');
      await openDropdownWith(input, ['London']);

      // No ArrowDown before Enter
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('Escape closes the dropdown', async () => {
      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await openDropdownWith(input, ['London']);

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('keyboard events do nothing when dropdown is closed', async () => {
      const onChange = vi.fn();
      renderCityAutocomplete({ onChange });
      const input = screen.getByRole('combobox');

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ── Blur behaviour ─────────────────────────────────────────────────────

  describe('blur behaviour', () => {
    it('blur closes the dropdown after 150 ms', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.blur(input);

      // Dropdown still open before the timeout fires
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await act(async () => { vi.advanceTimersByTime(150); });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('blur does NOT call onChange — only suggestion selection does', async () => {
      // Regression test: blur used to call onChange with the partial input,
      // overriding a subsequent suggestion click.
      const onChange = vi.fn();
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London', 'Los Angeles']),
      });

      renderCityAutocomplete({ onChange });
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      // Simulate browser ordering: blur fires before mousedown handlers
      fireEvent.blur(input);
      fireEvent.mouseDown(screen.getByText('London'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('London');

      // Advance past the blur timeout — onChange must NOT be called again
      await act(async () => { vi.advanceTimersByTime(200); });

      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── Outside click ──────────────────────────────────────────────────────

  describe('closes dropdown on outside click', () => {
    it('clicking outside the wrapper closes the dropdown', async () => {
      fetchMock.mockResolvedValue({
        json: () => Promise.resolve(['London']),
      });

      renderCityAutocomplete();
      const input = screen.getByRole('combobox');
      await typeAndFlush(input, 'Lo');

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Simulate mousedown on the document body (outside the wrapper)
      fireEvent.mouseDown(document.body);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ── External value sync ────────────────────────────────────────────────

  describe('external value sync', () => {
    it('updates input when the value prop changes externally', () => {
      const { rerender } = renderCityAutocomplete({ value: '' });
      const input = screen.getByRole('combobox');
      expect(input).toHaveValue('');

      rerender(
        <CityAutocomplete
          value="London"
          onChange={vi.fn()}
          placeholder="Your city..."
          className="city-input"
        />
      );

      expect(input).toHaveValue('London');
    });

    it('clears input when value prop is reset to empty string', () => {
      const { rerender } = renderCityAutocomplete({ value: 'London' });
      expect(screen.getByRole('combobox')).toHaveValue('London');

      rerender(
        <CityAutocomplete
          value=""
          onChange={vi.fn()}
          placeholder="Your city..."
          className="city-input"
        />
      );

      expect(screen.getByRole('combobox')).toHaveValue('');
    });
  });
});
