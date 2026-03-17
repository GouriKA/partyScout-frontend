import './VenueCard.css';

const CONDITION_ICONS = {
  CLEAR: '☀️', MOSTLY_CLEAR: '🌤️', PARTLY_CLOUDY: '⛅',
  MOSTLY_CLOUDY: '☁️', CLOUDY: '☁️', OVERCAST: '☁️',
  WINDY: '💨', FOG: '🌫️', HAZE: '🌫️',
  LIGHT_RAIN: '🌦️', RAIN: '🌧️', HEAVY_RAIN: '🌧️',
  DRIZZLE: '🌦️', SHOWERS: '🌦️',
  THUNDERSTORM: '⛈️',
  LIGHT_SNOW: '❄️', SNOW: '❄️', HEAVY_SNOW: '❄️', SLEET: '🌨️',
};

function getWeatherRisk(precipProb) {
  if (precipProb >= 50) return { dot: '🔴', label: 'High chance of rain' };
  if (precipProb >= 20) return { dot: '🟡', label: 'Possible rain' };
  return { dot: '🟢', label: 'Great weather' };
}

export default function VenueCard({
  venue,
  weather = null,
  weatherLoading = false,
  isSelected = false,
  isComparing = false,
  onSelect,
  onToggleCompare,
  showCompareCheckbox = true
}) {
  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'low';
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Great Match';
    if (score >= 40) return 'Good Match';
    return 'Possible Match';
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`venue-card ${isSelected ? 'selected' : ''}`}>
      {venue.photos && venue.photos.length > 0 && (
        <div className="venue-photo">
          <img src={venue.photos[0]} alt={venue.name} />
        </div>
      )}

      {showCompareCheckbox && (
        <label className="venue-compare-checkbox">
          <input
            type="checkbox"
            checked={isComparing}
            onChange={() => onToggleCompare?.(venue.id)}
          />
          <span className="checkbox-label">Compare</span>
        </label>
      )}

      <div className="venue-header">
        <div className={`match-score ${getMatchScoreColor(venue.matchScore)}`}>
          <span className="match-score-value">{venue.matchScore}</span>
          <span className="match-score-label">{getMatchScoreLabel(venue.matchScore)}</span>
        </div>
      </div>

      <div className="venue-content" onClick={() => onSelect?.(venue)}>
        <h3 className="venue-name">{venue.name}</h3>

        {venue.setting === 'outdoor' && (weatherLoading || weather) && (() => {
          const risk = weather ? getWeatherRisk(weather.precipitationProbability) : null;
          return (
            <div className={`weather-badge weather-badge--${risk?.dot === '🔴' ? 'bad' : risk?.dot === '🟡' ? 'caution' : 'good'} ${weather?.forecastType === 'CLIMATE_AVERAGE' ? 'weather-badge--historical' : ''}`}>
              {weatherLoading ? (
                <span className="weather-badge-loading">Loading forecast…</span>
              ) : (
                <>
                  <div className="weather-badge-left">
                    <span className="weather-badge-icon">{CONDITION_ICONS[weather.conditionType] ?? '🌡️'}</span>
                    <div className="weather-badge-temps">
                      <span className="weather-badge-high">{weather.temperatureHighF}°F</span>
                      <span className="weather-badge-condition">{weather.condition}</span>
                    </div>
                  </div>
                  <div className="weather-badge-right">
                    <span className="weather-badge-risk-dot">{risk.dot}</span>
                    <span className="weather-badge-risk-label">{risk.label}</span>
                    {weather.forecastType === 'CLIMATE_AVERAGE' && (
                      <span className="weather-badge-historical-label">Typical this time of year</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        <div className="venue-meta">
          {venue.rating > 0 && (
            <span className="venue-rating">
              <span className="rating-star">★</span>
              {venue.rating.toFixed(1)}
              {venue.userRatingsTotal > 0 && (
                <span className="rating-count">({venue.userRatingsTotal})</span>
              )}
            </span>
          )}
          <span className="venue-distance">{venue.distanceInMiles} mi</span>
          <span className="venue-setting">{venue.setting}</span>
          {venue.popularForAges && (
            <span className="venue-age-range">{venue.popularForAges}</span>
          )}
        </div>

        <p className="venue-address">{venue.address}</p>

        <div className="venue-match-reasons">
          {venue.matchReasons.slice(0, 3).map((reason, index) => (
            <span key={index} className="match-reason">{reason}</span>
          ))}
        </div>

        <div className="venue-pricing">
          <div className="price-estimate">
            <span className="price-label">Estimated Total</span>
            <span className="price-value">{formatPrice(venue.estimatedTotal)}</span>
          </div>
          <div className="price-per-person">
            <span className="price-label">Per Person</span>
            <span className="price-value">{formatPrice(venue.estimatedPricePerPerson)}</span>
          </div>
        </div>

        <div className="venue-includes">
          <h4 className="includes-title">What's Included:</h4>
          <ul className="includes-list">
            {venue.includedItems.slice(0, 4).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="venue-actions">
        <button
          className="btn-view-details"
          onClick={() => onSelect?.(venue)}
        >
          View Details
        </button>
        {venue.phoneNumber && (
          <a
            href={`tel:${venue.phoneNumber}`}
            className="btn-call"
          >
            Call
          </a>
        )}
      </div>
    </div>
  );
}
