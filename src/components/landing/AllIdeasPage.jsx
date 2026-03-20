import { useState, useRef } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import CityAutocomplete from '../common/CityAutocomplete';
import AuthModal from '../auth/AuthModal';
import UserMenu from '../auth/UserMenu';
import SavedEventsPanel from '../savedevents/SavedEventsPanel';
import AccountPanel from '../account/AccountPanel';
import { firebaseConfigured } from '../../firebase';
import { IDEA_CARDS } from '../../data/ideaCards';
import './AllIdeasPage.css';
import './LandingPage.css';

export default function AllIdeasPage({ initialCity = '', onBack, onStart }) {
  const { updateLocation, searchVenuesByQuery, goToStep } = usePartyPlanner();
  const { user, loading: authLoading } = useAuth();
  const { savedEvents } = useSavedEvents();

  const [cityValue,     setCityValue]     = useState(initialCity);
  const [cityHighlight, setCityHighlight] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaved,     setShowSaved]     = useState(false);
  const [showAccount,   setShowAccount]   = useState(false);
  const cityInputRef = useRef(null);

  const handleCardClick = (card) => {
    if (!cityValue) {
      setCityHighlight(true);
      setTimeout(() => setCityHighlight(false), 2000);
      cityInputRef.current?.querySelector('input')?.focus();
      return;
    }
    updateLocation({ city: cityValue });
    goToStep(4);
    onStart();
    searchVenuesByQuery(card.query, cityValue);
  };

  const handleCityChange = (city) => {
    setCityValue(city);
  };

  return (
    <div className="ai-page">
      {/* Nav */}
      <nav className="ai-nav-bar">
        <div className="ai-nav-inner">
          <div className="lp-logo" onClick={onBack} style={{ cursor: 'pointer' }}>
            <div className="lp-logo-icon">P</div>
            <span className="lp-logo-text"><span className="lp-logo-party">Party</span>Scout</span>
          </div>
          <div className="lp-nav-right">
            <button
              className={`lp-nav-saved${savedEvents.length > 0 ? ' lp-nav-saved--active' : ''}`}
              onClick={() => setShowSaved(true)}
            >
              <span className="lp-nav-saved-heart">★</span>
              Saved{savedEvents.length > 0 ? ` (${savedEvents.length})` : ''}
            </button>
            {firebaseConfigured && !authLoading && (
              user
                ? <UserMenu onAccountClick={() => setShowAccount(true)} />
                : (
                  <>
                    <button className="lp-btn lp-btn-signin" onClick={() => setShowAuthModal(true)}>Sign in</button>
                    <button className="lp-btn lp-btn-signup" onClick={() => setShowAuthModal(true)}>Sign up</button>
                  </>
                )
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="ai-header">
        <button className="ai-back-btn" onClick={onBack}>← Back</button>
        <h1 className="ai-title">Top party ideas near you</h1>
        <p className="ai-subtitle">Pick an idea and we'll find the best venues for it.</p>

        {/* City input */}
        <div className={`ai-city-wrap${cityHighlight ? ' ai-city-wrap--highlight' : ''}`} ref={cityInputRef}>
          <svg className="ai-city-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <CityAutocomplete
            value={cityValue}
            onChange={handleCityChange}
            className="ai-city-input"
            placeholder="Enter your city to find venues..."
          />
        </div>
        {!cityValue && (
          <p className="ai-city-hint">Enter your city above, then click any idea to search venues.</p>
        )}
      </div>

      {/* Cards grid */}
      <div className="ai-grid">
        {IDEA_CARDS.map((card) => (
          <div
            key={card.title}
            className="ai-card"
            onClick={() => handleCardClick(card)}
          >
            <div className="ai-card-img">
              <img src={card.img} alt={card.title} />
              <span className="ai-card-badge">{card.badge}</span>
            </div>
            <div className="ai-card-body">
              <p className="ai-card-cat">{card.cat}</p>
              <p className="ai-card-title">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <SavedEventsPanel open={showSaved} onClose={() => setShowSaved(false)} />
      <AccountPanel open={showAccount} onClose={() => setShowAccount(false)} />
    </div>
  );
}
