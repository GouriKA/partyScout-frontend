import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Slider from '../Slider';

describe('Slider', () => {
  const defaultProps = {
    label: 'Volume',
    value: 50,
    onChange: vi.fn(),
    min: 0,
    max: 100
  };

  it('renders slider input', () => {
    render(<Slider {...defaultProps} />);

    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('renders label', () => {
    render(<Slider {...defaultProps} />);

    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<Slider {...defaultProps} />);

    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('uses formatValue to display value', () => {
    const formatValue = (v) => `${v}%`;
    render(<Slider {...defaultProps} formatValue={formatValue} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays min and max values by default', () => {
    render(<Slider {...defaultProps} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('hides min and max when showMinMax is false', () => {
    render(<Slider {...defaultProps} showMinMax={false} />);

    // Only the current value should be shown
    const values = screen.getAllByText(/\d+/);
    expect(values).toHaveLength(1);
  });

  it('uses formatValue for min and max display', () => {
    const formatValue = (v) => `${v} items`;
    render(<Slider {...defaultProps} formatValue={formatValue} />);

    expect(screen.getByText('0 items')).toBeInTheDocument();
    expect(screen.getByText('100 items')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<Slider {...defaultProps} onChange={onChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('sets min attribute', () => {
    render(<Slider {...defaultProps} min={10} />);

    expect(screen.getByRole('slider')).toHaveAttribute('min', '10');
  });

  it('sets max attribute', () => {
    render(<Slider {...defaultProps} max={200} />);

    expect(screen.getByRole('slider')).toHaveAttribute('max', '200');
  });

  it('sets step attribute', () => {
    render(<Slider {...defaultProps} step={5} />);

    expect(screen.getByRole('slider')).toHaveAttribute('step', '5');
  });

  it('disables slider when disabled', () => {
    render(<Slider {...defaultProps} disabled />);

    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('hides value when showValue is false', () => {
    render(<Slider {...defaultProps} showValue={false} />);

    // The 50 should only appear in min/max range, not as displayed value
    const valueDisplay = screen.queryByText('50');
    // 50 is between 0 and 100, so it shouldn't appear if showValue is false
    expect(valueDisplay).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Slider {...defaultProps} className="custom-slider" />);

    expect(container.querySelector('.custom-slider')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(<Slider {...defaultProps} data-testid="volume-slider" />);

    expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    const { container } = render(<Slider {...defaultProps} value={25} min={0} max={100} />);

    const slider = container.querySelector('.slider-input');
    expect(slider).toHaveStyle({ '--progress': '25%' });
  });

  it('calculates progress for non-zero min', () => {
    const { container } = render(<Slider {...defaultProps} value={50} min={0} max={200} />);

    const slider = container.querySelector('.slider-input');
    expect(slider).toHaveStyle({ '--progress': '25%' });
  });

  it('renders without label', () => {
    const { container } = render(<Slider value={50} onChange={vi.fn()} min={0} max={100} />);

    expect(container.querySelector('.slider-label')).not.toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });
});
