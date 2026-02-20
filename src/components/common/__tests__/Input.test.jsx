import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input label="Name" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label', () => {
    render(<Input label="Name" />);

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('associates label with input', () => {
    render(<Input label="Name" />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('renders placeholder', () => {
    render(<Input label="Name" placeholder="Enter name" />);

    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<Input label="Name" value="John" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveValue('John');
  });

  it('calls onChange when value changes', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input label="Name" value="" onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), 'a');

    expect(onChange).toHaveBeenCalled();
  });

  it('shows required indicator when required', () => {
    render(<Input label="Name" required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders hint text', () => {
    render(<Input label="Name" hint="Enter your full name" />);

    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input label="Name" error="Name is required" />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<Input label="Name" hint="Enter your full name" error="Name is required" />);

    expect(screen.queryByText('Enter your full name')).not.toBeInTheDocument();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('applies error class when error is present', () => {
    const { container } = render(<Input label="Name" error="Required" />);

    expect(container.querySelector('.input-group-error')).toBeInTheDocument();
  });

  it('disables input when disabled', () => {
    render(<Input label="Name" disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('sets input type', () => {
    render(<Input label="Email" type="email" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
  });

  it('sets min and max for number input', () => {
    render(<Input label="Age" type="number" min={1} max={100} />);

    const input = screen.getByLabelText('Age');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '100');
  });

  it('uses custom id', () => {
    render(<Input label="Name" id="custom-id" />);

    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'custom-id');
  });

  it('generates id from label when not provided', () => {
    render(<Input label="Full Name" />);

    expect(screen.getByLabelText('Full Name')).toHaveAttribute('id', 'full-name');
  });

  it('applies custom className', () => {
    const { container } = render(<Input label="Name" className="custom-input" />);

    expect(container.querySelector('.custom-input')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(<Input label="Name" data-testid="name-input" />);

    expect(screen.getByTestId('name-input')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Input placeholder="Enter value" />);

    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('sets name attribute', () => {
    render(<Input label="Name" name="fullName" />);

    expect(screen.getByLabelText('Name')).toHaveAttribute('name', 'fullName');
  });

  it('sets step attribute', () => {
    render(<Input label="Price" type="number" step={0.01} />);

    expect(screen.getByLabelText('Price')).toHaveAttribute('step', '0.01');
  });
});
