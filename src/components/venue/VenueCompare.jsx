import './VenueCompare.css';

export default function VenueCompare({ venues, onClose, onSelect }) {
  if (venues.length === 0) return null;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const compareFields = [
    { key: 'matchScore', label: 'Match Score', render: (v) => `${v}%` },
    { key: 'rating', label: 'Rating', render: (v) => v > 0 ? `${v.toFixed(1)} ★` : 'N/A' },
    { key: 'distanceInMiles', label: 'Distance', render: (v) => `${v} mi` },
    { key: 'estimatedTotal', label: 'Est. Total', render: (v) => formatPrice(v) },
    { key: 'estimatedPricePerPerson', label: 'Per Person', render: (v) => formatPrice(v) },
    { key: 'setting', label: 'Setting', render: (v) => v },
    { key: 'typicalPartyDuration', label: 'Duration', render: (v) => v },
    { key: 'maxCapacity', label: 'Capacity', render: (v, venue) => {
      if (venue.minCapacity && venue.minCapacity !== v) {
        return `${venue.minCapacity}\u2013${v} guests`;
      }
      return `Up to ${v} guests`;
    }}
  ];

  // Find the best value for each field
  const getBestValue = (field) => {
    const values = venues.map(v => v[field.key]);
    switch (field.key) {
      case 'matchScore':
      case 'rating':
        return Math.max(...values.filter(v => typeof v === 'number'));
      case 'distanceInMiles':
      case 'estimatedTotal':
      case 'estimatedPricePerPerson':
        return Math.min(...values.filter(v => typeof v === 'number'));
      default:
        return null;
    }
  };

  return (
    <div className="venue-compare-modal">
      <div className="compare-overlay" onClick={onClose} />
      <div className="compare-panel">
        <div className="compare-header">
          <h2>Compare Venues</h2>
          <button className="compare-close" onClick={onClose}>×</button>
        </div>

        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-label-col"></th>
                {venues.map((venue) => (
                  <th key={venue.id} className="compare-venue-col">
                    <div className="compare-venue-name">{venue.name}</div>
                    <div className="compare-venue-address">{venue.address}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field) => {
                const bestValue = getBestValue(field);
                return (
                  <tr key={field.key}>
                    <td className="compare-label">{field.label}</td>
                    {venues.map((venue) => {
                      const value = venue[field.key];
                      const isBest = bestValue !== null && value === bestValue;
                      return (
                        <td
                          key={venue.id}
                          className={`compare-value ${isBest ? 'best' : ''}`}
                        >
                          {field.render(value, venue)}
                          {isBest && <span className="best-badge">Best</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* What's Included row */}
              <tr>
                <td className="compare-label">Included</td>
                {venues.map((venue) => (
                  <td key={venue.id} className="compare-value compare-list">
                    <ul>
                      {venue.includedItems.slice(0, 4).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Match Reasons row */}
              <tr>
                <td className="compare-label">Why It Matches</td>
                {venues.map((venue) => (
                  <td key={venue.id} className="compare-value compare-reasons">
                    {venue.matchReasons.map((reason, i) => (
                      <span key={i} className="compare-reason">{reason}</span>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="compare-actions">
          {venues.map((venue) => (
            <button
              key={venue.id}
              className="compare-select-btn"
              onClick={() => onSelect(venue)}
            >
              Select {venue.name.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
