import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VenueFilters from '../VenueFilters';

describe('VenueFilters', () => {
  const defaultFilters = {
    setting: 'all',
    rating: 'all',
    price: 'all'
  };

  const defaultProps = {
    filters: defaultFilters,
    onFilterChange: vi.fn(),
    venueCount: 10
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders setting filter dropdown', () => {
      render(<VenueFilters {...defaultProps} />);

      expect(screen.getByLabelText('Setting')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /setting/i })).toBeInTheDocument();
    });

    it('renders rating filter dropdown', () => {
      render(<VenueFilters {...defaultProps} />);

      expect(screen.getByLabelText('Rating')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /rating/i })).toBeInTheDocument();
    });

    it('renders price filter dropdown', () => {
      render(<VenueFilters {...defaultProps} />);

      expect(screen.getByLabelText('Price')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /price/i })).toBeInTheDocument();
    });

    it('renders all setting options', () => {
      render(<VenueFilters {...defaultProps} />);

      const settingSelect = screen.getByRole('combobox', { name: /setting/i });
      expect(settingSelect).toContainHTML('All Settings');
      expect(settingSelect).toContainHTML('Indoor');
      expect(settingSelect).toContainHTML('Outdoor');
    });

    it('renders all rating options', () => {
      render(<VenueFilters {...defaultProps} />);

      const ratingSelect = screen.getByRole('combobox', { name: /rating/i });
      expect(ratingSelect).toContainHTML('Any Rating');
      expect(ratingSelect).toContainHTML('4+ Stars');
      expect(ratingSelect).toContainHTML('4.5+ Stars');
    });

    it('renders all price options', () => {
      render(<VenueFilters {...defaultProps} />);

      const priceSelect = screen.getByRole('combobox', { name: /price/i });
      expect(priceSelect).toContainHTML('Any Price');
      expect(priceSelect).toContainHTML('Budget-Friendly');
      expect(priceSelect).toContainHTML('Moderate');
      expect(priceSelect).toContainHTML('Premium');
    });
  });

  describe('Filter Values', () => {
    it('displays current setting filter value', () => {
      const filters = { ...defaultFilters, setting: 'indoor' };
      render(<VenueFilters {...defaultProps} filters={filters} />);

      const settingSelect = screen.getByRole('combobox', { name: /setting/i });
      expect(settingSelect).toHaveValue('indoor');
    });

    it('displays current rating filter value', () => {
      const filters = { ...defaultFilters, rating: '4' };
      render(<VenueFilters {...defaultProps} filters={filters} />);

      const ratingSelect = screen.getByRole('combobox', { name: /rating/i });
      expect(ratingSelect).toHaveValue('4');
    });

    it('displays current price filter value', () => {
      const filters = { ...defaultFilters, price: 'budget' };
      render(<VenueFilters {...defaultProps} filters={filters} />);

      const priceSelect = screen.getByRole('combobox', { name: /price/i });
      expect(priceSelect).toHaveValue('budget');
    });

    it('defaults to "all" when filter property is missing', () => {
      const filters = {};
      render(<VenueFilters {...defaultProps} filters={filters} />);

      const settingSelect = screen.getByRole('combobox', { name: /setting/i });
      const ratingSelect = screen.getByRole('combobox', { name: /rating/i });
      const priceSelect = screen.getByRole('combobox', { name: /price/i });

      expect(settingSelect).toHaveValue('all');
      expect(ratingSelect).toHaveValue('all');
      expect(priceSelect).toHaveValue('all');
    });
  });

  describe('Filter Changes', () => {
    it('calls onFilterChange when setting is changed', () => {
      const onFilterChange = vi.fn();
      render(<VenueFilters {...defaultProps} onFilterChange={onFilterChange} />);

      const settingSelect = screen.getByRole('combobox', { name: /setting/i });
      fireEvent.change(settingSelect, { target: { value: 'indoor' } });

      expect(onFilterChange).toHaveBeenCalledTimes(1);
      expect(onFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        setting: 'indoor'
      });
    });

    it('calls onFilterChange when rating is changed', () => {
      const onFilterChange = vi.fn();
      render(<VenueFilters {...defaultProps} onFilterChange={onFilterChange} />);

      const ratingSelect = screen.getByRole('combobox', { name: /rating/i });
      fireEvent.change(ratingSelect, { target: { value: '4.5' } });

      expect(onFilterChange).toHaveBeenCalledTimes(1);
      expect(onFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        rating: '4.5'
      });
    });

    it('calls onFilterChange when price is changed', () => {
      const onFilterChange = vi.fn();
      render(<VenueFilters {...defaultProps} onFilterChange={onFilterChange} />);

      const priceSelect = screen.getByRole('combobox', { name: /price/i });
      fireEvent.change(priceSelect, { target: { value: 'premium' } });

      expect(onFilterChange).toHaveBeenCalledTimes(1);
      expect(onFilterChange).toHaveBeenCalledWith({
        ...defaultFilters,
        price: 'premium'
      });
    });

    it('preserves other filter values when one is changed', () => {
      const onFilterChange = vi.fn();
      const filters = { setting: 'indoor', rating: '4', price: 'moderate' };
      render(<VenueFilters {...defaultProps} filters={filters} onFilterChange={onFilterChange} />);

      const priceSelect = screen.getByRole('combobox', { name: /price/i });
      fireEvent.change(priceSelect, { target: { value: 'premium' } });

      expect(onFilterChange).toHaveBeenCalledWith({
        setting: 'indoor',
        rating: '4',
        price: 'premium'
      });
    });
  });

  describe('Venue Count Display', () => {
    it('displays venue count with plural form for multiple venues', () => {
      render(<VenueFilters {...defaultProps} venueCount={10} />);

      expect(screen.getByText('10 venues found')).toBeInTheDocument();
    });

    it('displays venue count with singular form for one venue', () => {
      render(<VenueFilters {...defaultProps} venueCount={1} />);

      expect(screen.getByText('1 venue found')).toBeInTheDocument();
    });

    it('displays zero venues with plural form', () => {
      render(<VenueFilters {...defaultProps} venueCount={0} />);

      expect(screen.getByText('0 venues found')).toBeInTheDocument();
    });

    it('defaults to 0 when venueCount is not provided', () => {
      const { filters, onFilterChange } = defaultProps;
      render(<VenueFilters filters={filters} onFilterChange={onFilterChange} />);

      expect(screen.getByText('0 venues found')).toBeInTheDocument();
    });

    it('displays large venue count correctly', () => {
      render(<VenueFilters {...defaultProps} venueCount={100} />);

      expect(screen.getByText('100 venues found')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for all filter dropdowns', () => {
      render(<VenueFilters {...defaultProps} />);

      expect(screen.getByLabelText('Setting')).toBeInTheDocument();
      expect(screen.getByLabelText('Rating')).toBeInTheDocument();
      expect(screen.getByLabelText('Price')).toBeInTheDocument();
    });

    it('filter dropdowns have proper IDs', () => {
      render(<VenueFilters {...defaultProps} />);

      expect(document.getElementById('setting-filter')).toBeInTheDocument();
      expect(document.getElementById('rating-filter')).toBeInTheDocument();
      expect(document.getElementById('price-filter')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined filters gracefully', () => {
      render(<VenueFilters filters={undefined} onFilterChange={vi.fn()} venueCount={5} />);

      // Should not crash, dropdowns should default to 'all'
      const settingSelect = screen.getByRole('combobox', { name: /setting/i });
      expect(settingSelect).toBeInTheDocument();
    });

    it('handles null filter values gracefully', () => {
      const filters = { setting: null, rating: null, price: null };
      render(<VenueFilters {...defaultProps} filters={filters} />);

      const settingSelect = screen.getByRole('combobox', { name: /setting/i });
      expect(settingSelect).toHaveValue('all');
    });
  });
});
