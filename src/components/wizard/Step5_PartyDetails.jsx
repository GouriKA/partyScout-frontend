import { useEffect } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import Button from '../common/Button';
import './WizardStep.css';
import './Step5_PartyDetails.css';

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
  if (precipProb >= 50) return { dot: '🔴', label: 'High chance of rain', cls: 'bad' };
  if (precipProb >= 20) return { dot: '🟡', label: 'Possible rain', cls: 'caution' };
  return { dot: '🟢', label: 'Great weather', cls: 'good' };
}

export default function Step5_PartyDetails() {
  const {
    selectedVenue,
    childInfo,
    preferences,
    location,
    weather,
    weatherLoading,
    fetchWeatherForecast,
    prevStep,
    reset
  } = usePartyPlanner();

  useEffect(() => {
    if (selectedVenue?.setting === 'outdoor' && !weather && !weatherLoading
        && childInfo?.partyDate && location?.zipCode?.length === 5) {
      fetchWeatherForecast(location.zipCode, childInfo.partyDate);
    }
  }, [selectedVenue, weather, weatherLoading, childInfo?.partyDate, location?.zipCode, fetchWeatherForecast]);

  if (!selectedVenue) {
    return (
      <div className="wizard-step">
        <div className="error-state">
          <span className="error-icon">!</span>
          <h3>No venue selected</h3>
          <p>Please go back and select a venue</p>
          <Button onClick={prevStep}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleStartOver = () => {
    reset();
  };

  return (
    <div className="wizard-step step-party-details">
      <div className="step-top-nav">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back to Results
        </button>
      </div>

      <div className="step-header">
        <h2 className="step-title">
          {childInfo.name ? `${childInfo.name}'s` : 'Your'} Party at {selectedVenue.name}
        </h2>
        <p className="step-description">
          Here's everything you need to know about your party
        </p>
      </div>

      <div className="party-summary">
        {/* Venue Hero */}
        <div className="venue-hero">
          <div className="venue-hero-content">
            <h3 className="venue-hero-name">{selectedVenue.name}</h3>
            <a
              className="venue-hero-address"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVenue.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >{selectedVenue.address}</a>

            {selectedVenue.placeTypes && selectedVenue.placeTypes.length > 0 && (
              <div className="venue-place-types">
                {selectedVenue.placeTypes.slice(0, 3).map((type, i) => (
                  <span key={i} className="place-type-tag">
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            <div className="venue-hero-meta">
              {selectedVenue.rating > 0 && (
                <span className="venue-hero-rating">
                  ★ {selectedVenue.rating.toFixed(1)}
                </span>
              )}
              <span className="venue-hero-distance">{selectedVenue.distanceInMiles} mi away</span>
              <span className="venue-hero-setting">{selectedVenue.setting}</span>
              {selectedVenue.popularForAges && (
                <span className="venue-hero-ages">{selectedVenue.popularForAges}</span>
              )}
            </div>
          </div>

          <div className="venue-hero-score">
            <div className="match-score-circle">
              <span className="score-value">{selectedVenue.matchScore}</span>
              <span className="score-label">Match</span>
            </div>
          </div>
        </div>

        {/* Venue Photos */}
        {selectedVenue.photos && selectedVenue.photos.length > 0 && (
          <div className="venue-photos">
            {selectedVenue.photos.slice(0, 4).map((photo, index) => (
              <div key={index} className="venue-photo-thumb">
                <img src={photo} alt={`${selectedVenue.name} photo ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        {/* Weather Card — outdoor venues only */}
        {selectedVenue.setting === 'outdoor' && (weatherLoading || weather) && (
          <div className={`details-weather-card ${weather ? `details-weather--${getWeatherRisk(weather.precipitationProbability).cls}` : ''}`}>
            {weatherLoading ? (
              <p className="details-weather-loading">Loading weather forecast…</p>
            ) : (
              <>
                <div className="details-weather-left">
                  <span className="details-weather-icon">{CONDITION_ICONS[weather.conditionType] ?? '🌡️'}</span>
                  <div>
                    <div className="details-weather-temp">{weather.temperatureHighF}°F</div>
                    <div className="details-weather-condition">{weather.condition}</div>
                    <div className="details-weather-low">Low {weather.temperatureLowF}°F</div>
                  </div>
                </div>
                <div className="details-weather-right">
                  <div className="details-weather-risk">
                    <span className="details-weather-risk-dot">{getWeatherRisk(weather.precipitationProbability).dot}</span>
                    <span className="details-weather-risk-label">{getWeatherRisk(weather.precipitationProbability).label}</span>
                  </div>
                  <div className="details-weather-precip">Rain chance: {weather.precipitationProbability}%</div>
                  {weather.forecastType === 'CLIMATE_AVERAGE' && (
                    <div className="details-weather-note">Typical for this time of year</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Party Info */}
        <div className="party-info-grid">
          <div className="info-card">
            <div className="info-icon">📅</div>
            <div className="info-content">
              <span className="info-label">Party Date</span>
              <span className="info-value">{formatDate(childInfo.partyDate)}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">👥</div>
            <div className="info-content">
              <span className="info-label">Guest Count</span>
              <span className="info-value">{preferences.guestCount} guests</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">⏱️</div>
            <div className="info-content">
              <span className="info-label">Duration</span>
              <span className="info-value">{selectedVenue.typicalPartyDuration}</span>
            </div>
          </div>

          {selectedVenue.maxCapacity && (
            <div className="info-card">
              <div className="info-icon">🏟️</div>
              <div className="info-content">
                <span className="info-label">Capacity</span>
                <span className="info-value">
                  {selectedVenue.minCapacity && selectedVenue.minCapacity !== selectedVenue.maxCapacity
                    ? `${selectedVenue.minCapacity}\u2013${selectedVenue.maxCapacity} guests`
                    : `Up to ${selectedVenue.maxCapacity} guests`}
                </span>
              </div>
            </div>
          )}

          <div className="info-card highlight">
            <div className="info-icon">💰</div>
            <div className="info-content">
              <span className="info-label">
                Estimated Total
                {selectedVenue.priceLevel != null && (
                  <span className="info-price-level"> · {'$'.repeat(Math.max(1, selectedVenue.priceLevel))}</span>
                )}
              </span>
              <span className="info-value">{formatPrice(selectedVenue.estimatedTotal)}</span>
              <span className="info-sub">{formatPrice(selectedVenue.estimatedPricePerPerson)}/person</span>
            </div>
          </div>
        </div>

        {/* What's Included */}
        {selectedVenue.includedItems?.length > 0 && (
          <div className="details-section">
            <h4 className="section-title">
              <span className="section-icon">✓</span>
              What's Included
            </h4>
            <ul className="included-list">
              {selectedVenue.includedItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Add-ons */}
        {selectedVenue.suggestedAddOns && selectedVenue.suggestedAddOns.length > 0 && (
          <div className="details-section">
            <h4 className="section-title">
              <span className="section-icon">+</span>
              Suggested Add-ons
            </h4>
            <div className="addons-grid">
              {selectedVenue.suggestedAddOns.map((addon, index) => (
                <div key={index} className={`addon-card ${addon.isRecommended ? 'recommended' : ''}`}>
                  {addon.isRecommended && <span className="addon-badge">Recommended</span>}
                  <h5 className="addon-name">{addon.name}</h5>
                  <p className="addon-description">{addon.description}</p>
                  <span className="addon-price">{formatPrice(addon.estimatedCost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="contact-section">
          <h4 className="section-title">
            <span className="section-icon">📞</span>
            Contact & Book
          </h4>
          <div className="contact-actions">
            {selectedVenue.phoneNumber && (
              <a href={`tel:${selectedVenue.phoneNumber}`} className="contact-btn contact-phone">
                <span className="contact-icon">📞</span>
                Call {selectedVenue.phoneNumber}
              </a>
            )}
            {selectedVenue.website && (
              <a
                href={selectedVenue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-btn contact-website"
              >
                <span className="contact-icon">🌐</span>
                Visit Website
              </a>
            )}
          </div>
          <p className="contact-hint">
            Mention this is for a birthday party with {preferences.guestCount} guests
          </p>
        </div>
      </div>

      <div className="step-actions">
        <div /> {/* Spacer */}
        <Button variant="secondary" onClick={handleStartOver}>
          Plan Another Party
        </Button>
      </div>
    </div>
  );
}
