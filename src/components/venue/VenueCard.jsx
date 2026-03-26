import { useState } from 'react';
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
  partyDate = null,
  isSelected = false,
  isComparing = false,
  isSaved = false,
  onSelect,
  onToggleCompare,
  onSave,
  showCompareCheckbox = true
}) {
  const [photoError, setPhotoError] = useState(false);

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
      <div className={`venue-photo${(!venue.photos?.length || photoError) ? ' venue-photo--placeholder' : ''}`}>
        {venue.photos?.length > 0 && !photoError ? (
          <img src={venue.photos[0]} alt={venue.name} onError={() => setPhotoError(true)} />
        ) : (
          <div className="venue-photo-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <span>No photo available</span>
          </div>
        )}
      </div>

      <button
        className={`venue-heart-btn${isSaved ? ' venue-heart-btn--saved' : ''}`}
        onClick={(e) => { e.stopPropagation(); onSave?.(venue) }}
        aria-label={isSaved ? 'Unsave venue' : 'Save venue'}
        title={isSaved ? 'Saved' : 'Save'}
      >
        {isSaved ? '★' : '☆'}
      </button>

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

      {venue.matchScore != null && (
        <div className="venue-header">
          <div className={`match-score ${getMatchScoreColor(venue.matchScore)}`}>
            <span className="match-score-value">{venue.matchScore}</span>
            <span className="match-score-label">{getMatchScoreLabel(venue.matchScore)}</span>
          </div>
        </div>
      )}

      <div className="venue-content" onClick={() => onSelect?.(venue)}>
        <h3 className="venue-name">{venue.name}</h3>

        {venue.setting === 'outdoor' && (weatherLoading || weather) && (() => {
          const risk = weather ? getWeatherRisk(weather.precipitationProbability) : null;
          const formattedDate = partyDate ? (() => {
            try {
              const [y, m, d] = partyDate.split('-').map(Number);
              return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            } catch { return partyDate; }
          })() : null;
          // Use 'loading' modifier while forecast hasn't arrived so badge doesn't flash green
          return (
            <div className={`weather-badge weather-badge--${weatherLoading ? 'loading' : risk?.dot === '🔴' ? 'bad' : risk?.dot === '🟡' ? 'caution' : 'good'} ${weather?.forecastType === 'CLIMATE_AVERAGE' ? 'weather-badge--historical' : ''}`}>
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
                    {formattedDate && (
                      <span className="weather-badge-date">{formattedDate}</span>
                    )}
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
          {venue.distanceInMiles != null && (
            <span className="venue-distance">{venue.distanceInMiles} mi</span>
          )}
          <span className="venue-setting">{venue.setting}</span>
          {venue.popularForAges && (
            <span className="venue-age-range">{venue.popularForAges}</span>
          )}
        </div>

        <a
          className="venue-address"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {venue.address}
        </a>

        <div className="venue-match-reasons">
          {venue.matchReasons?.slice(0, 3).map((reason, index) => (
            <span key={index} className="match-reason">{reason}</span>
          ))}
        </div>

        <div className="venue-pricing">
          <div className="venue-pricing-footer">
            {venue.priceLevel != null && (
              <span className="price-level">{'$'.repeat(Math.max(1, venue.priceLevel))}</span>
            )}
            {venue.website ? (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="price-check-link"
                onClick={(e) => e.stopPropagation()}
              >
                Check pricing ↗
              </a>
            ) : (
              <span className="price-check-unavailable">Pricing unavailable</span>
            )}
          </div>
        </div>

        {venue.includedItems?.length > 0 && (
          <div className="venue-includes">
            <h4 className="includes-title">What's Included:</h4>
            <ul className="includes-list">
              {venue.includedItems.slice(0, 4).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
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
