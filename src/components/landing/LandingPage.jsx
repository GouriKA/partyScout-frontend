import { useState } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import CityAutocomplete from '../common/CityAutocomplete';
import AuthModal from '../auth/AuthModal';
import UserMenu from '../auth/UserMenu';
import SavedEventsPanel from '../savedevents/SavedEventsPanel';
import AccountPanel from '../account/AccountPanel';
import { firebaseConfigured } from '../../firebase';
import './LandingPage.css';

const IDEA_CARDS = [
  { img: '/escape-room.avif', badge: 'Birthday pick', cat: 'Experience',   title: 'Escape Room',  saved: true,  query: 'escape room' },
  { img: '/boba-tea.webp', badge: 'Kids fave',     cat: 'Food & Treat', title: 'Boba Tea',     saved: false, query: 'boba tea' },
  { img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&h=200&q=80', badge: 'Kids fave',     cat: 'Food & Treat', title: 'Ice Cream',    saved: false, query: 'ice cream parlour' },
  { img: '/pottery.avif', badge: 'Workshop',      cat: 'Creative',     title: 'Pottery',      saved: false, query: 'pottery workshop' },
  { img: '/archery.webp', badge: 'Adventure',     cat: 'Adventure',    title: 'Archery',      saved: false, query: 'archery experience' },
];

const PERSONAS = [
  { label: 'Little Kids', age: 6,  range: 'Under 7'   },
  { label: 'Tweens',      age: 10, range: 'Ages 8–13' },
  { label: 'Teens',       age: 15, range: 'Ages 14–17' },
  { label: 'Adults',      age: 25, range: '18 & over'  },
];

const PERSONA_AGES = Object.fromEntries(PERSONAS.map(p => [p.label, p.age]));

const OCCASION_PILLS = [
  { label: '🎂 Birthday',     key: 'birthday' },
  { label: '🥳 Just because', key: 'just-because' },
];


export default function LandingPage({ onStart }) {
  const { updateChildInfo, updateLocation, searchVenuesByQuery, goToStep } = usePartyPlanner();
  const { user, loading: authLoading } = useAuth();
  const { savedEvents } = useSavedEvents();

  const [activeOccasion, setActiveOccasion] = useState('birthday');
  const [activePersona,  setActivePersona]  = useState('Kids');
  const [cityValue,      setCityValue]      = useState('');
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [showSaved,      setShowSaved]      = useState(false);
  const [showAccount,    setShowAccount]    = useState(false);

  const handleSearch = () => {
    if (cityValue) {
      updateLocation({ city: cityValue });
    }
    onStart();
  };

  const handleCardClick = (card) => {
    if (cityValue) updateLocation({ city: cityValue });
    goToStep(4);
    onStart();
    searchVenuesByQuery(card.query, cityValue);
  };

  const handlePersona = (label) => {
    setActivePersona(label);
    updateChildInfo({ age: PERSONA_AGES[label] });
    if (cityValue) updateLocation({ city: cityValue });
    onStart();
  };

  const sectionTitle = activeOccasion === 'birthday'
    ? 'Top birthday ideas near you'
    : 'Top ideas near you';

  // ── 1. Early access bar ──────────────────────────────────────────────────
  // ── 2. Navbar ────────────────────────────────────────────────────────────
  // ── 3. Hero ──────────────────────────────────────────────────────────────
  // ── 4. Celebrating someone specific? ────────────────────────────────────
  // ── 5. Top ideas card row ────────────────────────────────────────────────
  // ── 6. How it works ──────────────────────────────────────────────────────
  // ── 7. Footer CTA ────────────────────────────────────────────────────────

  return (
    <div className="lp">

      {/* ── 2. Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-icon">P</div>
          <span className="lp-logo-text">
            <span className="lp-logo-party">Party</span>Scout
          </span>
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
            user ? (
              <UserMenu onAccountClick={() => setShowAccount(true)} />
            ) : (
              <>
                <button className="lp-btn lp-btn-signin" onClick={() => setShowAuthModal(true)}>Sign in</button>
                <button className="lp-btn lp-btn-signup" onClick={() => setShowAuthModal(true)}>Sign up</button>
              </>
            )
          )}
        </div>
      </nav>

      {/* ── 3. Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-body">
          <div className="lp-eyebrow">Plan the perfect party</div>

          <h1 className="lp-hero-title">
            Every celebration<br />
            deserves the <span className="lp-pink">best</span><br />
            <span className="lp-orange">moment.</span>
          </h1>

          <p className="lp-hero-sub">
            Find venues, experiences and activities for birthdays and special
            occasions — curated for whoever you're celebrating.
          </p>

          <div className="lp-occasion-pills">
            {OCCASION_PILLS.map(({ label, key }) => (
              <button
                key={key}
                className={`lp-pill${activeOccasion === key ? ' lp-pill--active' : ''}`}
                onClick={() => setActiveOccasion(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* City dropdown + Find ideas */}
          <div className="lp-search-wrap">
            <div className="lp-search-left">
              <svg className="lp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <CityAutocomplete
                value={cityValue}
                onChange={setCityValue}
                className="lp-city-input"
                placeholder="Your city..."
              />
            </div>
            <button className="lp-search-btn" onClick={handleSearch}>
              Find ideas
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. Celebrating someone specific? ── */}
      <section className="lp-for-who">
        <div className="lp-for-who-inner">
          <div className="lp-for-who-header">
            <span className="lp-section-title">Celebrating someone specific?</span>
          </div>
          <p className="lp-for-who-sub">
            We personalise results by age so the ideas always fit.
          </p>
          <div className="lp-persona-row">
            {PERSONAS.map(({ label, range }) => (
              <button
                key={label}
                className={`lp-persona-chip${activePersona === label ? ' lp-persona-chip--active' : ''}`}
                onClick={() => handlePersona(label)}
              >
                <span className="lp-persona-chip-label">{label}</span>
                <span className="lp-persona-chip-range">{range}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Top ideas near you ── */}
      <section className="lp-cards-section">
        <div className="lp-section-header">
          <span className="lp-section-title">{sectionTitle}</span>
          <span className="lp-section-link" onClick={() => handleCardClick({ query: activeOccasion === 'birthday' ? 'birthday party venues' : 'party venues' })}>See all →</span>
        </div>
        <div className="lp-cards-row">
          {IDEA_CARDS.map((card) => (
            <div className="lp-card" key={card.title} onClick={() => handleCardClick(card)} style={{ cursor: 'pointer' }}>
              <div className="lp-card-img">
                <img src={card.img} alt={card.title} className="lp-card-photo" />
                <span className="lp-card-badge">{card.badge}</span>
              </div>
              <div className="lp-card-body">
                <p className="lp-card-cat">{card.cat}</p>
                <p className="lp-card-title">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. How it works ── */}
      <section className="lp-how">
        <div className="lp-section-header">
          <span className="lp-section-title">How it works</span>
        </div>
        <div className="lp-how-steps">
          <div className="lp-step">
            <div className="lp-step-num">01 — Pick an occasion</div>
            <div className="lp-step-title">Tell us what you're celebrating</div>
            <div className="lp-step-desc">
              Birthday or just because — we tailor ideas to the occasion and who it's for.
            </div>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">02 — Save ideas</div>
            <div className="lp-step-title">Heart the ones you love</div>
            <div className="lp-step-desc">
              Save venues for anyone — no account needed. Plan for multiple people at once.
            </div>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">03 — Make it happen</div>
            <div className="lp-step-title">Book when you're ready</div>
            <div className="lp-step-desc">
              Come back to your saved list and book directly. Everything in one place.
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Footer CTA ── */}
      <section className="lp-footer-cta">
        <h2>
          Start planning something <span className="lp-orange">special</span>
        </h2>
        <p>
          No account needed. Save ideas instantly,<br />
          sign up when you're ready to book.
        </p>
        <div className="lp-cta-row">
          <button className="lp-cta-primary" onClick={onStart}>
            Find birthday ideas →
          </button>
          <button className="lp-cta-secondary" onClick={onStart}>
            Browse all occasions
          </button>
        </div>
      </section>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <SavedEventsPanel open={showSaved} onClose={() => setShowSaved(false)} />
      <AccountPanel     open={showAccount} onClose={() => setShowAccount(false)} />
    </div>
  );
}
