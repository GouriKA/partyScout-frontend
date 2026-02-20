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

describe('PartyTypeSelector', () => {
  const defaultProps = {
    options: mockOptions,
    selected: [],
    onChange: vi.fn()
  };

  it('renders all party type options', () => {
    render(<PartyTypeSelector {...defaultProps} />);

    expect(screen.getByText('Active Play')).toBeInTheDocument();
    expect(screen.getByText('Creative')).toBeInTheDocument();
    expect(screen.getByText('Amusement')).toBeInTheDocument();
  });

  it('renders age ranges for each option', () => {
    render(<PartyTypeSelector {...defaultProps} />);

    expect(screen.getByText('Ages 3-16')).toBeInTheDocument();
    expect(screen.getByText('Ages 4-14')).toBeInTheDocument();
    expect(screen.getByText('Ages 5-18')).toBeInTheDocument();
  });

  it('renders party type buttons', () => {
    render(<PartyTypeSelector {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('marks selected party types', () => {
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} />);

    const activePlayButton = screen.getByText('Active Play').closest('button');
    expect(activePlayButton).toHaveClass('selected');
  });

  it('shows checkmark for selected items', () => {
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const onChange = vi.fn();
    render(<PartyTypeSelector {...defaultProps} onChange={onChange} />);

    const creativeButton = screen.getByText('Creative').closest('button');
    fireEvent.click(creativeButton);

    expect(onChange).toHaveBeenCalledWith(['creative']);
  });

  it('calls onChange when option is deselected', () => {
    const onChange = vi.fn();
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} onChange={onChange} />);

    const activePlayButton = screen.getByText('Active Play').closest('button');
    fireEvent.click(activePlayButton);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('adds to selection when multiple allowed', () => {
    const onChange = vi.fn();
    render(<PartyTypeSelector {...defaultProps} selected={['active_play']} onChange={onChange} />);

    const creativeButton = screen.getByText('Creative').closest('button');
    fireEvent.click(creativeButton);

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

    const amusementButton = screen.getByText('Amusement').closest('button');
    fireEvent.click(amusementButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables buttons when maxSelections reached', () => {
    render(
      <PartyTypeSelector
        {...defaultProps}
        selected={['active_play', 'creative']}
        maxSelections={2}
      />
    );

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

    const activePlayButton = screen.getByText('Active Play').closest('button');
    fireEvent.click(activePlayButton);

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

  it('disables all buttons when disabled', () => {
    render(<PartyTypeSelector {...defaultProps} disabled />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<PartyTypeSelector {...defaultProps} onChange={onChange} disabled />);

    const activePlayButton = screen.getByText('Active Play').closest('button');
    fireEvent.click(activePlayButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows Popular badge for high popularity options', () => {
    render(<PartyTypeSelector {...defaultProps} />);

    // Active Play has popularityScore 5 and Creative has 4
    const popularBadges = screen.getAllByText('Popular');
    expect(popularBadges).toHaveLength(2);
  });

  it('does not show Popular badge for low popularity options', () => {
    const lowPopularityOptions = [
      { type: 'test', displayName: 'Test', ageRange: 'Ages 1-5', popularityScore: 2 }
    ];
    render(<PartyTypeSelector {...defaultProps} options={lowPopularityOptions} />);

    expect(screen.queryByText('Popular')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PartyTypeSelector {...defaultProps} className="custom-selector" />
    );

    expect(container.querySelector('.custom-selector')).toBeInTheDocument();
  });

  it('renders empty when no options provided', () => {
    const { container } = render(<PartyTypeSelector selected={[]} onChange={vi.fn()} />);

    expect(container.querySelector('.party-type-grid').children).toHaveLength(0);
  });

  it('renders default icon for unknown party types', () => {
    const unknownOptions = [
      { type: 'unknown_type', displayName: 'Unknown', ageRange: 'All ages', popularityScore: 1 }
    ];
    render(<PartyTypeSelector options={unknownOptions} selected={[]} onChange={vi.fn()} />);

    // Should render the default party emoji
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });
});
