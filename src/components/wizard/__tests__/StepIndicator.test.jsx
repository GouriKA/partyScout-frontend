import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepIndicator from '../StepIndicator';

describe('StepIndicator', () => {
  const defaultProps = {
    currentStep: 1,
    onStepClick: vi.fn(),
  };

  it('renders correct number of steps', () => {
    render(<StepIndicator {...defaultProps} />);

    const steps = screen.getAllByRole('button');
    expect(steps).toHaveLength(5);
  });

  it('highlights current step', () => {
    render(<StepIndicator {...defaultProps} currentStep={3} />);

    const steps = screen.getAllByRole('button');
    expect(steps[2]).toHaveClass('active');
  });

  it('marks completed steps', () => {
    render(<StepIndicator {...defaultProps} currentStep={3} />);

    const steps = screen.getAllByRole('button');
    expect(steps[0]).toHaveClass('completed');
    expect(steps[1]).toHaveClass('completed');
    expect(steps[2]).not.toHaveClass('completed');
  });

  it('calls onStepClick with correct step number', () => {
    const onStepClick = vi.fn();
    render(<StepIndicator {...defaultProps} onStepClick={onStepClick} currentStep={3} />);

    const steps = screen.getAllByRole('button');
    fireEvent.click(steps[0]); // Click step 1

    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('only allows clicking completed steps', () => {
    const onStepClick = vi.fn();
    render(<StepIndicator {...defaultProps} onStepClick={onStepClick} currentStep={2} />);

    const steps = screen.getAllByRole('button');

    // Click step 1 (completed) - should work
    fireEvent.click(steps[0]);
    expect(onStepClick).toHaveBeenCalledTimes(1);

    // Click step 4 (future) - should be disabled and not work
    fireEvent.click(steps[3]);
    expect(onStepClick).toHaveBeenCalledTimes(1); // Still 1
  });

  it('displays step labels', () => {
    render(<StepIndicator {...defaultProps} />);

    expect(screen.getByText('Child Info')).toBeInTheDocument();
    expect(screen.getByText('Party Type')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Venues')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('shows checkmark for completed steps', () => {
    render(<StepIndicator {...defaultProps} currentStep={3} />);

    // Steps 1 and 2 should have checkmarks
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(2);
  });

  it('shows step icons for non-completed steps', () => {
    render(<StepIndicator {...defaultProps} currentStep={1} />);

    // All steps should show icons since none are completed
    expect(screen.getByText('👶')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('📍')).toBeInTheDocument();
    expect(screen.getByText('🏠')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('disables future steps', () => {
    render(<StepIndicator {...defaultProps} currentStep={2} />);

    const steps = screen.getAllByRole('button');
    // Step 3, 4, 5 should be disabled
    expect(steps[2]).toBeDisabled();
    expect(steps[3]).toBeDisabled();
    expect(steps[4]).toBeDisabled();
  });

  it('renders step connectors between steps', () => {
    const { container } = render(<StepIndicator {...defaultProps} currentStep={3} />);

    const connectors = container.querySelectorAll('.step-connector');
    // 4 connectors between 5 steps
    expect(connectors).toHaveLength(4);
  });

  it('marks connectors as completed for past steps', () => {
    const { container } = render(<StepIndicator {...defaultProps} currentStep={3} />);

    const completedConnectors = container.querySelectorAll('.step-connector.completed');
    // First 2 connectors should be completed
    expect(completedConnectors).toHaveLength(2);
  });
});
