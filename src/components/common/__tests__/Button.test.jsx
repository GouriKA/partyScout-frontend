import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders children content', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders as button by default', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies primary variant class by default', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });

  it('applies outline variant class', () => {
    render(<Button variant="outline">Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-outline');
  });

  it('applies ghost variant class', () => {
    render(<Button variant="ghost">Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-ghost');
  });

  it('applies medium size class by default', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-medium');
  });

  it('applies small size class', () => {
    render(<Button size="small">Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-small');
  });

  it('applies large size class', () => {
    render(<Button size="large">Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-large');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading prop is true', () => {
    render(<Button loading>Click me</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading spinner when loading', () => {
    const { container } = render(<Button loading>Click me</Button>);

    expect(container.querySelector('.btn-spinner')).toBeInTheDocument();
  });

  it('applies loading class when loading', () => {
    render(<Button loading>Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-loading');
  });

  it('applies full-width class when fullWidth is true', () => {
    render(<Button fullWidth>Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('btn-full-width');
  });

  it('sets button type attribute', () => {
    render(<Button type="submit">Submit</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('defaults to type button', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(<Button data-testid="custom-button">Click me</Button>);

    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });
});
