import './VenueResults.css'

function VenueResults({ venues, searchParams }) {
  return (
    <div className="venue-results">
      <div className="results-header">
        <h2>🎊 Found {venues.length} Venues</h2>
        {searchParams && (
          <p className="search-info">
            Age: {searchParams.age} | ZIP: {searchParams.areaCode}
          </p>
        )}
      </div>

      <div className="venues-grid">
        {venues.map((venue, index) => (
          <div key={index} className="venue-card">
            <div className="venue-header">
              <h3>{venue.name}</h3>
              <div className="venue-rating">
                ⭐ {venue.rating ? venue.rating.toFixed(1) : 'N/A'}
              </div>
            </div>

            <div className="venue-details">
              <p className="venue-address">
                📍 {venue.address}
              </p>

              {venue.distanceInMiles && (
                <p className="venue-distance">
                  🚗 {venue.distanceInMiles.toFixed(1)} miles away
                </p>
              )}

              <p className="venue-description">{venue.description}</p>

              <div className="venue-info-grid">
                <div className="info-item">
                  <span className="info-label">💰 Price Range:</span>
                  <span className="info-value">{venue.priceRange || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">👥 Capacity:</span>
                  <span className="info-value">{venue.estimatedCapacity} people</span>
                </div>
              </div>

              {venue.kidFriendlyFeatures && (
                <div className="kid-friendly-section">
                  <h4>👶 Kid-Friendly Features</h4>
                  <div className="features-list">
                    {venue.kidFriendlyFeatures.isKidFriendly && (
                      <span className="feature-badge">✓ Kid Friendly</span>
                    )}
                    {venue.kidFriendlyFeatures.hasPlayArea && (
                      <span className="feature-badge">🎪 Play Area</span>
                    )}
                    {venue.kidFriendlyFeatures.hasKidsMenu && (
                      <span className="feature-badge">🍕 Kids Menu</span>
                    )}
                    {venue.kidFriendlyFeatures.hasHighChairs && (
                      <span className="feature-badge">🪑 High Chairs</span>
                    )}
                  </div>

                  {venue.kidFriendlyFeatures.entertainmentOptions &&
                   venue.kidFriendlyFeatures.entertainmentOptions.length > 0 && (
                    <div className="entertainment-options">
                      <strong>🎮 Entertainment:</strong>
                      <ul>
                        {venue.kidFriendlyFeatures.entertainmentOptions.map((option, idx) => (
                          <li key={idx}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="venue-contact">
                {venue.phoneNumber && (
                  <a href={`tel:${venue.phoneNumber}`} className="contact-link">
                    📞 {venue.phoneNumber}
                  </a>
                )}
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VenueResults
