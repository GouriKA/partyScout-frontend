import { useState, useRef, useEffect } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import CityAutocomplete from '../common/CityAutocomplete';
import AuthModal from '../auth/AuthModal';
import UserMenu from '../auth/UserMenu';
import SavedEventsPanel from '../savedevents/SavedEventsPanel';
import AccountPanel from '../account/AccountPanel';
import VenueCard from '../venue/VenueCard';
import SaveModal from '../savedevents/SaveModal';
import ChatPanel from '../chat/ChatPanel';
import { firebaseConfigured } from '../../firebase';
import { IDEA_CARDS } from '../../data/ideaCards';
import '../chat/ChatPanel.css';
import './LandingPage.css';

const PERSONAS = [
  { label: 'Little Kids', age: 6,  range: 'Under 7'    },
  { label: 'Tweens',      age: 10, range: 'Ages 8–13'  },
  { label: 'Teens',       age: 15, range: 'Ages 14–17' },
  { label: 'Adults',      age: 25, range: '18 & over'  },
];
const PERSONA_AGES = Object.fromEntries(PERSONAS.map(p => [p.label, p.age]));

const OCCASION_PILLS = [
  { label: '🎂 Birthday',     key: 'birthday'     },
  { label: '🥳 Just because', key: 'just-because' },
];

const PERSONA_QUERIES = {
  'Little Kids': 'birthday party venues for young kids',
  'Tweens':      'birthday party venues for tweens age 8 to 13',
  'Teens':       'birthday party venues for teenagers',
  'Adults':      'adult birthday party venues',
};

const QUICK_CHIPS = [
  '🎂 Birthday for a toddler',
  '🎨 Creative party, age 8',
  '⚡ Adventure for teens',
  '🍕 Food & treats ideas',
];

export default function LandingPage({ onStart, onSeeAll }) {
  const { updateChildInfo, updateLocation, searchVenuesByQuery, goToStep, selectVenue } = usePartyPlanner();
  const { user, loading: authLoading } = useAuth();
  const { savedEvents, isSaved, unsaveEvent } = useSavedEvents();

  const [activeOccasion, setActiveOccasion] = useState('birthday');
  // Initial value must match one of the PERSONAS labels exactly so the chip highlights on load
  const [activePersona,  setActivePersona]  = useState('Little Kids');
  const [cityValue,      setCityValue]      = useState('');
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [showSaved,      setShowSaved]      = useState(false);
  const [showAccount,    setShowAccount]    = useState(false);
  const [cityHighlight,  setCityHighlight]  = useState(false);
  const [pendingCard,    setPendingCard]    = useState(null);

  const [chatInput,    setChatInput]    = useState('');
  const [chatVenues,   setChatVenues]   = useState(null);
  const [saveTarget,   setSaveTarget]   = useState(null);

  // Chat overlay state
  const [chatOpen,     setChatOpen]     = useState(false);
  const [chatInitial,  setChatInitial]  = useState('');
  const [chatTrigger,  setChatTrigger]  = useState(null);

  const carouselRef   = useRef(null);
  const searchWrapRef = useRef(null);
  const navRef        = useRef(null);
  const chatColRef    = useRef(null);

  // Keep chat column anchored directly below the nav (which shifts due to the banner above it)
  useEffect(() => {
    const update = () => {
      if (!navRef.current || !chatColRef.current) return;
      const navBottom = navRef.current.getBoundingClientRect().bottom;
      const top = Math.max(navBottom, 0);
      chatColRef.current.style.top    = `${top}px`;
      chatColRef.current.style.height = `calc(100vh - ${top}px)`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Carousel auto-scroll
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: 212, behavior: 'smooth' });
    }, 3000);
    const pause = () => clearInterval(interval);
    el.addEventListener('mouseenter', pause);
    el.addEventListener('touchstart', pause);
    return () => {
      clearInterval(interval);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('touchstart', pause);
    };
  }, []);

  // ── Open / close chat overlay ──────────────────────────────────────────────
  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  // Open chat with text pre-filled in the input bar
  const openChatWith = (text) => {
    if (text) setChatInitial(text);
    setChatOpen(true);
  };

  // Open chat and auto-send the message immediately
  const openChatAndSend = (text) => {
    setChatTrigger({ text, key: Date.now() });
    setChatOpen(true);
  };

  const handleVenuesFound = (venues) => {
    setChatVenues(venues);
  };

  // ── Manual search / nav ───────────────────────────────────────────────────
  const handleSearch = () => {
    if (cityValue) updateLocation({ city: cityValue });
    onStart();
  };

  const handleSeeAll = () => {
    if (onSeeAll) onSeeAll(cityValue);
  };

  const handleCardClick = (card) => {
    if (!cityValue) {
      openChatAndSend(`Find ${card.title} venues for a birthday party`);
      return;
    }
    updateLocation({ city: cityValue });
    goToStep(4);
    onStart();
    searchVenuesByQuery(card.query, cityValue);
  };

  const handleCityChange = (city) => {
    setCityValue(city);
    if (pendingCard && city) {
      setPendingCard(null);
      updateLocation({ city });
      goToStep(4);
      onStart();
      searchVenuesByQuery(pendingCard.query, city);
    }
  };

  const handlePersona = (label) => {
    setActivePersona(label);
    updateChildInfo({ age: PERSONA_AGES[label] });
    if (cityValue) {
      updateLocation({ city: cityValue });
      goToStep(4);
      onStart();
      searchVenuesByQuery(PERSONA_QUERIES[label], cityValue);
    } else {
      onStart();
    }
  };

  const sectionTitle = activeOccasion === 'birthday'
    ? 'Top party ideas near you'
    : 'Top ideas near you';

  // ── Shared: cards + how + footer ──────────────────────────────────────────
  const renderCards = () => (
    <section className="lp-cards-section">
      {chatVenues ? (
        <div className="lp-chat-venues">
          {chatVenues.map((v, i) => {
            const venue = {
              ...v,
              googlePlaceId: v.googlePlaceId || v.id,
              matchScore: null,
              matchReasons: [],
              photos: v.photos ?? [],
              distanceInMiles: null,
              setting: v.setting ?? 'indoor',
            };
            const gpid = venue.googlePlaceId;
            const saved = isSaved(gpid);
            const handleSave = () => {
              const allSaves = savedEvents.filter(ev => ev.googlePlaceId === gpid);
              if (allSaves.length > 0) {
                allSaves.forEach(ev => unsaveEvent(ev.id ?? ev.localId));
              } else {
                setSaveTarget({ venue, eventDate: null, partyTypes: null, guestCount: null, venueWebsite: venue.website ?? null });
              }
            };
            return (
              <VenueCard
                key={gpid || venue.id || i}
                venue={venue}
                isSaved={saved}
                onSave={handleSave}
                showCompareCheckbox={false}
              />
            );
          })}
        </div>
      ) : (
        <>
          <div className="lp-city-row">
            <span className="lp-city-row-label">📍 Search near</span>
            <CityAutocomplete
              value={cityValue}
              onChange={handleCityChange}
              placeholder="Your city…"
              className="lp-city-input"
            />
            {cityValue && (
              <button className="lp-city-clear" onClick={() => handleCityChange('')} aria-label="Clear city">✕</button>
            )}
          </div>

          <div className="lp-section-header">
            <span className="lp-section-title">{sectionTitle}</span>
            <div className="lp-carousel-controls">
              <button className="lp-carousel-btn" aria-label="Previous" onClick={() => carouselRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}>‹</button>
              <button className="lp-carousel-btn" aria-label="Next"     onClick={() => carouselRef.current?.scrollBy({ left:  220, behavior: 'smooth' })}>›</button>
              <span className="lp-section-link" onClick={handleSeeAll}>See all →</span>
            </div>
          </div>
          <div className="lp-cards-row" ref={carouselRef}>
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
        </>
      )}
    </section>
  );

  const renderHow = () => (
    <section className="lp-how">
      <div className="lp-section-header">
        <span className="lp-section-title">How it works</span>
      </div>
      <div className="lp-how-steps">
        <div className="lp-step">
          <div className="lp-step-num">01 — Pick an occasion</div>
          <div className="lp-step-title">Tell us what you're celebrating</div>
          <div className="lp-step-desc">Birthday or just because — we tailor ideas to the occasion and who it's for.</div>
        </div>
        <div className="lp-step">
          <div className="lp-step-num">02 — Save ideas</div>
          <div className="lp-step-title">Heart the ones you love</div>
          <div className="lp-step-desc">Save venues for anyone — no account needed. Plan for multiple people at once.</div>
        </div>
        <div className="lp-step">
          <div className="lp-step-num">03 — Make it happen</div>
          <div className="lp-step-title">Book when you're ready</div>
          <div className="lp-step-desc">Come back to your saved list and book directly. Everything in one place.</div>
        </div>
      </div>
    </section>
  );

  const renderFooter = () => (
    <section className="lp-footer-cta">
      <h2>Start planning something <span className="lp-orange">special</span></h2>
      <p>No account needed. Save ideas instantly,<br />sign up when you're ready to book.</p>
      <div className="lp-cta-row">
        <button className="lp-cta-primary" onClick={onStart}>Find birthday ideas →</button>
        <button className="lp-cta-secondary" onClick={onStart}>Browse all occasions</button>
      </div>
    </section>
  );

  const chatContext = {
    city: cityValue || null,
    persona: null,
    occasion: activeOccasion === 'birthday' ? 'birthday' : null,
  };

  return (
    <div className="lp">

      {/* ── Navbar ── */}
      <nav ref={navRef} className="lp-nav lp-nav--sticky">
        <div
          className="lp-logo"
          onClick={chatOpen ? closeChat : undefined}
          style={chatOpen ? { cursor: 'pointer' } : undefined}
        >
          <div className="lp-logo-icon">P</div>
          <span className="lp-logo-text">
            <span className="lp-logo-party">Party</span>Scout
          </span>
        </div>
        <div className="lp-nav-right">
          <button
            className={`lp-nav-chat-btn${chatOpen ? ' lp-nav-chat-btn--active' : ''}`}
            onClick={() => chatOpen ? closeChat() : openChat()}
          >
            Ask AI
          </button>
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

      {/* ── Body: scrollable content + sticky chat column ── */}
      <div className={`lp-body${chatOpen ? ' lp-body--chat-open' : ''}`}>
      <div className="lp-main">
        <section className="lp-hero">
          <div className="lp-hero-inner">
            <div className="lp-eyebrow">Plan the perfect party</div>
            <h1 className="lp-hero-title">
              Every celebration deserves<br />
              the <span className="lp-pink">best</span> <span className="lp-orange">moment.</span>
            </h1>
            <p className="lp-hero-sub">
              Tell us what you're planning and we'll find the perfect venue — or use the filters below.
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

            {/* Primary chat bar */}
            <div className="lp-chat-bar">
              <input
                className="lp-chat-bar-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { openChatAndSend(chatInput); setChatInput(''); } }}
                placeholder="e.g. Birthday for my 7 year old in Austin, 15 kids..."
              />
              <button className="lp-chat-bar-btn" onClick={() => { if (chatInput.trim()) { openChatAndSend(chatInput); setChatInput(''); } else openChat(); }}>
                Find venues →
              </button>
            </div>

            {/* Quick-start chips */}
            <div className="lp-quickstart-chips">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} className="lp-qs-chip" onClick={() => openChatAndSend(chip)}>
                  {chip}
                </button>
              ))}
            </div>

          </div>
        </section>

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

        {chatVenues && (
          <div className="lp-results-strip">
            <span className="lp-results-strip-label">
              {chatVenues.length} venues found
            </span>
            <button
              className="lp-results-strip-clear"
              onClick={() => setChatVenues(null)}
            >
              Clear ✕
            </button>
          </div>
        )}

        {renderCards()}
        {renderHow()}
        {renderFooter()}
      </div>{/* lp-main */}

      {/* ── Chat column (always mounted — preserves history) ── */}
      <div ref={chatColRef} className={`lp-chat-col${chatOpen ? ' lp-chat-col--open' : ''}`}>
        <ChatPanel
          existingContext={chatContext}
          suggestions={QUICK_CHIPS}
          onVenuesFound={handleVenuesFound}
          onVenueSelect={(venue) => { selectVenue(venue); goToStep(5); closeChat(); onStart(); }}
          onClose={closeChat}
          initialText={chatInitial}
          triggerSend={chatTrigger}
        />
      </div>
      </div>{/* lp-body */}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <SavedEventsPanel open={showSaved} onClose={() => setShowSaved(false)} />
      <AccountPanel     open={showAccount} onClose={() => setShowAccount(false)} />
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
