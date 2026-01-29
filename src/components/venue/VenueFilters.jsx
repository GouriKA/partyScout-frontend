import './VenueFilters.css';

export default function VenueFilters({
  filters,
  onFilterChange,
  venueCount = 0
}) {
  const settingOptions = [
    { value: 'all', label: 'All Settings' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'outdoor', label: 'Outdoor' }
  ];

  const ratingOptions = [
    { value: 'all', label: 'Any Rating' },
    { value: '4', label: '4+ Stars' },
    { value: '4.5', label: '4.5+ Stars' }
  ];

  const priceOptions = [
    { value: 'all', label: 'Any Price' },
    { value: 'budget', label: 'Budget-Friendly' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'premium', label: 'Premium' }
  ];

  return (
    <div className="venue-filters">
      <div className="filters-row">
        <div className="filter-group">
          <label htmlFor="setting-filter">Setting</label>
          <select
            id="setting-filter"
            value={filters.setting || 'all'}
            onChange={(e) => onFilterChange({ ...filters, setting: e.target.value })}
          >
            {settingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="rating-filter">Rating</label>
          <select
            id="rating-filter"
            value={filters.rating || 'all'}
            onChange={(e) => onFilterChange({ ...filters, rating: e.target.value })}
          >
            {ratingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="price-filter">Price</label>
          <select
            id="price-filter"
            value={filters.price || 'all'}
            onChange={(e) => onFilterChange({ ...filters, price: e.target.value })}
          >
            {priceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="filters-summary">
        {venueCount} venue{venueCount !== 1 ? 's' : ''} found
      </div>
    </div>
  );
}
