import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PartyTypeSelector from '../PartyTypeSelector';

const mockOptions = [
  {
    type: 'active_play',
    displayName: 'Active Play',
    ageRange: 'Ages 3-16',
    popularityScore: 5
  },
  {
    type: 'creative',
    displayName: 'Creative',
    ageRange: 'Ages 4-14',
    popularityScore: 4
  },
  {
    type: 'amusement',
    displayName: 'Amusement',
    ageRange: 'Ages 5-18',
    popularityScore: 3
  }
];

/** Opens the dropdown by clicking the trigger button (always the first button rendered) */
function openDropdown() {
  fireEvent.click(screen.getAllByRole('button')[0]);
}

describe('PartyTypeSelector', () => {
  const defaultProps = {
    options: mockOptions,
    selected: [],
    onChange: vi.fn()
  };

  it('renders trigger button with placeholder when nothing selected', () => {
    render(<PartyTypeSelector {...defaultProps} />);

    expect(screen.getByText('Select party types...')).toBeInTheDocument();
  });

  it('shows options only after opening the dropdown', () => {
    render(<PartyTypeSelector {...defaultProps} />);

    expect(screen.queryByText('Active Play')).not.toBeInTheDocument();

    openDropdown();

    expect(screen.getByText('Active Play')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Amusement')).toBeInTheDocument();
  });

  it('renders age ranges for each option when open', () => {
    render(<PartyTypeSelector {...defaultProps} />);
    openDropdown();

    expect(screen.getByText('Ages 3-16')).toBeInTheDocument();
    expect(screen.getByText('Ages 4-14')).toBeInTheDocument();
    expect(screen.getByText('Ages 5-18')).toBeInTheDocument();
  });

  it('renders one option per item when open', () => {
    render(<PartyTypeSelector {...defaultProps} />);
    openDropdown();

    // options have role="option" inside the listbox
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('marks selected party types when open', () => {
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} />);
    openDropdown();

    const activePlayOption = screen.getByText('Active Play').closest('button');
    expect(activePlayOption).toHaveClass('selected');
  });

  it('shows checkmark for selected items when open', () => {
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} />);
    openDropdown();

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows selected label in trigger when items are selected', () => {
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} />);

    expect(screen.getByText(/Active Play/)).toBeInTheDocument();
    expect(screen.queryByText('Select party types...')).not.toBeInTheDocument();
  });

  it('shows "+N more" in trigger when more than 2 are selected', () => {
    render(
      <PartyTypeSelector
        {...defaultProps}
        selected={['active_play', 'creative', 'amusement']}
      />
    );

    expect(screen.getByText(/\+2 more/)).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const onChange = vi.fn();
    render(<PartyTypeSelector {...defaultProps} onChange={onChange} />);
    openDropdown();

    fireEvent.click(screen.getByText('Creative').closest('button'));

    expect(onChange).toHaveBeenCalledWith(['creative']);
  });

  it('calls onChange when option is deselected', () => {
    const onChange = vi.fn();
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} onChange={onChange} />);
    openDropdown();

    fireEvent.click(screen.getByText('Active Play').closest('button'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds to selection when multiple allowed', () => {
    const onChange = vi.fn();
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} onChange={onChange} />);
    openDropdown();

    fireEvent.click(screen.getByText('Creative').closest('button'));

    expect(onChange).toHaveBeenCalledWith(['active_play', 'creative']);
  });

  it('enforces maxSelections limit', () => {
    const onChange = vi.fn();
    render(
      <PartyTypeSelector
        {...defaultProps}
        selected={['active_play', 'creative']}
        onChange={onChange}
        maxSelections={2}
      />
    );
    openDropdown();

    fireEvent.click(screen.getByText('Amusement').closest('button'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables option buttons when maxSelections reached', () => {
    render(
      <PartyTypeSelector
        {...defaultProps}
        selected={['active_play', 'creative']}
        maxSelections={2}
      />
    );
    openDropdown();

    const amusementButton = screen.getByText('Amusement').closest('button');
    expect(amusementButton).toBeDisabled();
  });

  it('allows deselecting when maxSelections reached', () => {
    const onChange = vi.fn();
    render(
      <PartyTypeSelector
        {...defaultProps}
        selected={['active_play', 'creative']}
        onChange={onChange}
        maxSelections={2}
      />
    );
    openDropdown();

    fireEvent.click(screen.getByText('Active Play').closest('button'));

    expect(onChange).toHaveBeenCalledWith(['creative']);
  });

  it('shows selection count hint', () => {
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} maxSelections={3} />);

    expect(screen.getByText(/1\/3 selected/)).toBeInTheDocument();
  });

  it('hides hint when maxSelections is 1', () => {
    render(<PartyTypeSelector {...defaultProps} maxSelections={1} />);

    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('disables trigger button when disabled prop is set', () => {
    render(<PartyTypeSelector {...defaultProps} disabled />);

    expect(screen.getAllByRole('button')[0]).toBeDisabled();
  });

  it('does not open dropdown when disabled', () => {
    render(<PartyTypeSelector {...defaultProps} disabled />);

    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(screen.queryByText('Active Play')).not.toBeInTheDocument();
  });

  it('shows Popular badge for high popularity options when open', () => {
    render(<PartyTypeSelector {...defaultProps} />);
    openDropdown();

    // Active Play has score 5 and Creative has score 4
    const popularBadges = screen.getAllByText('Popular');
    expect(popularBadges).toHaveLength(2);
  });

  it('does not show Popular badge for low popularity options', () => {
    const lowPopularityOptions = [
      { type: 'test', displayName: 'Test', ageRange: 'Ages 1-5', popularityScore: 2 }
    ];
    render(<PartyTypeSelector {...defaultProps} options={lowPopularityOptions} />);
    openDropdown();

    expect(screen.queryByText('Popular')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PartyTypeSelector {...defaultProps} className="custom-selector" />
    );

    expect(container.querySelector('.custom-selector')).toBeInTheDocument();
  });

  it('renders empty dropdown when no options provided', () => {
    render(<PartyTypeSelector selected={[]} onChange={vi.fn()} />);
    fireEvent.click(screen.getAllByRole('button')[0]);

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('renders default icon for unknown party types', () => {
    const unknownOptions = [
      { type: 'unknown_type', displayName: 'Unknown', ageRange: 'All ages', popularityScore: 1 }
    ];
    render(<PartyTypeSelector options={unknownOptions} selected={[]} onChange={vi.fn()} />);
    openDropdown();

    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('toggles dropdown open and closed on trigger click', () => {
    render(<PartyTypeSelector {...defaultProps} />);
    const trigger = screen.getAllByRole('button')[0];

    // Open
    fireEvent.click(trigger);
    expect(screen.getByText('Active Play')).toBeInTheDocument();

    // Close by clicking trigger again
    fireEvent.click(trigger);
    expect(screen.queryByText('Active Play')).not.toBeInTheDocument();
  });

  it('trigger shows aria-expanded true when open', () => {
    render(<PartyTypeSelector {...defaultProps} />);
    const trigger = screen.getAllByRole('button')[0];

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
