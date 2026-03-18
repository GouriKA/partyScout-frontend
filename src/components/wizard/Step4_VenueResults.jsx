import { useState, useEffect } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import VenueCard from '../venue/VenueCard';
import VenueCompare from '../venue/VenueCompare';
import SaveModal from '../savedevents/SaveModal';
import Button from '../common/Button';
import './WizardStep.css';
import './Step4_VenueResults.css';

const sortOptions = [
  { value: 'matchScore', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Closest' },
  { value: 'price', label: 'Lowest Price' }
];

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'highRated', label: '4+ Stars' }
];

export default function Step4_VenueResults() {
  const {
    venues,
    loading,
    error,
    compareVenues,
    toggleCompareVenue,
    clearCompare,
    selectVenue,
    nextStep,
    prevStep,
    preferences,
    searchVenues,
    childInfo,
    location,
    weather,
    weatherLoading,
    fetchWeatherForecast,
  } = usePartyPlanner();

  const { isSaved, unsaveEvent, savedEvents } = useSavedEvents();

  const [sortBy, setSortBy] = useState('matchScore');
  const [filterBy, setFilterBy] = useState('all');
  const [showCompare, setShowCompare] = useState(false);
  const [saveTarget, setSaveTarget] = useState(null); // { venue, eventDate, partyTypes, guestCount }

  useEffect(() => {
    const hasOutdoor = venues.some(v => v.setting === 'outdoor');
    if (!hasOutdoor || !childInfo?.partyDate || location?.zipCode?.length !== 5) return;

    const datePart = childInfo.partyDate.slice(0, 10);
    const [y, m, d] = datePart.split('-').map(Number);
    const partyDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.round((partyDate - today) / 86400000);
    if (daysUntil < 0 || daysUntil > 30) return;

    fetchWeatherForecast(location.zipCode, childInfo.partyDate);
  }, [venues, childInfo?.partyDate, location?.zipCode, fetchWeatherForecast]);

  // Sort venues
  const sortedVenues = [...venues].sort((a, b) => {
    switch (sortBy) {
      case 'matchScore':
        return b.matchScore - a.matchScore;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'distance':
        return a.distanceInMiles - b.distanceInMiles;
      case 'price':
        return a.estimatedTotal - b.estimatedTotal;
      default:
        return 0;
    }
  });

  // Filter venues
  const filteredVenues = sortedVenues.filter((venue) => {
    switch (filterBy) {
      case 'indoor':
        return venue.setting === 'indoor';
      case 'outdoor':
        return venue.setting === 'outdoor';
      case 'highRated':
        return venue.rating >= 4;
      default:
        return true;
    }
  });

  const handleSelectVenue = (venue) => {
    selectVenue(venue);
    nextStep();
  };

  const handleCompareSelect = (venue) => {
    setShowCompare(false);
    handleSelectVenue(venue);
  };

  function handleHeartClick(venue) {
    const googlePlaceId = venue.googlePlaceId || venue.id;
    const allSaves = savedEvents.filter((ev) => ev.googlePlaceId === googlePlaceId);
    if (allSaves.length > 0) {
      allSaves.forEach((ev) => unsaveEvent(ev.id ?? ev.localId));
    } else {
      setSaveTarget({
        venue,
        eventDate: childInfo?.partyDate?.slice(0, 10) ?? null,
        partyTypes: preferences?.partyTypes?.join(',') ?? null,
        guestCount: preferences?.guestCount ?? null,
        venueWebsite: venue.website ?? null,
      });
    }
  }

  if (loading) {
    return (
      <div className="wizard-step">
        <div className="loading-state">
          <div className="loading-spinner" />
          <h3>Finding perfect venues...</h3>
          <p>Searching for party places near you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wizard-step">
        <div className="error-state">
          <span className="error-icon">!</span>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <div className="error-actions">
            <Button onClick={searchVenues}>
              Try Again
            </Button>
            <Button onClick={prevStep} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !error && venues.length === 0) {
    return (
      <div className="wizard-step">
        <div className="step-top-nav">
          <button type="button" className="btn-back" onClick={prevStep}>
            Back
          </button>
        </div>
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No venues found near you</h3>
          <p>We couldn't find any venues matching your search. Try:</p>
          <ul style={{ textAlign: 'left', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            <li>Increasing your max distance</li>
            <li>Trying a different ZIP code</li>
            <li>Selecting a different party type</li>
          </ul>
          <Button onClick={prevStep} variant="outline">
            Modify Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-step step-venue-results">
      <div className="step-top-nav">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
      </div>

      <div className="step-header">
        <h2 className="step-title">
          {filteredVenues.length} Venue{filteredVenues.length !== 1 ? 's' : ''} Found
        </h2>
        <p className="step-description">
          Sorted by best match for your {preferences.guestCount}-guest party
        </p>
      </div>

      <div className="results-controls">
        <div className="filter-chips">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterBy(option.value)}
              className={`filter-chip ${filterBy === option.value ? 'active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="sort-control">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {compareVenues.length > 0 && (
        <div className="compare-bar">
          <span>{compareVenues.length} venue{compareVenues.length !== 1 ? 's' : ''} selected</span>
          <div className="compare-bar-actions">
            <Button variant="ghost" size="small" onClick={clearCompare}>
              Clear
            </Button>
            <Button
              size="small"
              onClick={() => setShowCompare(true)}
              disabled={compareVenues.length < 2}
            >
              Compare ({compareVenues.length})
            </Button>
          </div>
        </div>
      )}

      {filteredVenues.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No venues match your filters</h3>
          <p>Try adjusting your filters or search criteria</p>
          <Button variant="outline" onClick={() => setFilterBy('all')}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="venue-grid">
          {filteredVenues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              weather={weather}
              weatherLoading={weatherLoading}
              partyDate={childInfo?.partyDate?.slice(0, 10)}
              isComparing={compareVenues.some(v => v.id === venue.id)}
              isSaved={isSaved(venue.googlePlaceId || venue.id)}
              onSelect={handleSelectVenue}
              onToggleCompare={toggleCompareVenue}
              onSave={handleHeartClick}
            />
          ))}
        </div>
      )}

      <div className="step-actions">
        <span className="results-hint">Select a venue to see full details</span>
      </div>

      {showCompare && (
        <VenueCompare
          venues={compareVenues}
          onClose={() => setShowCompare(false)}
          onSelect={handleCompareSelect}
        />
      )}

      {saveTarget && (
        <SaveModal
          venue={saveTarget.venue}
          eventDate={saveTarget.eventDate}
          partyTypes={saveTarget.partyTypes}
          guestCount={saveTarget.guestCount}
          venueWebsite={saveTarget.venueWebsite}
          onClose={() => setSaveTarget(null)}
        />
      )}
    </div>
  );
}
