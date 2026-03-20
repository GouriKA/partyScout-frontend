import { useState } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import './PlanPage.css';

const PERSONA_MAP = [
  { label: 'Little Kids', range: 'Under 7',   maxAge: 7  },
  { label: 'Tweens',      range: 'Ages 8–13',  maxAge: 13 },
  { label: 'Teens',       range: 'Ages 14–17', maxAge: 17 },
  { label: 'Adults',      range: '18 & over',  maxAge: Infinity },
];

const THEMES = [
  { key: 'creative',       label: '🎨 Creative' },
  { key: 'adventure',      label: '⚡ Adventure' },
  { key: 'entertainment',  label: '🎭 Entertainment' },
  { key: 'food_treats',    label: '🍕 Food & Treats' },
  { key: 'gaming',         label: '🎮 Gaming' },
  { key: 'active',         label: '🏃 Active' },
  { key: 'music',          label: '🎵 Music' },
];

function getPersona(age) {
  if (!age) return null;
  return PERSONA_MAP.find(p => age <= p.maxAge) ?? PERSONA_MAP[PERSONA_MAP.length - 1];
}

export default function PlanPage({ onHome }) {
  const {
    location,
    childInfo,
    weather,
    updateChildInfo,
    updateLocation,
    updatePreferences,
    goToStep,
    searchVenues,
  } = usePartyPlanner();

  const [partyDate, setPartyDate] = useState(
    childInfo.partyDate ? childInfo.partyDate.slice(0, 10) : ''
  );
  const [partyTime, setPartyTime] = useState(
    childInfo.partyDate ? childInfo.partyDate.slice(11, 16) : ''
  );
  const [setting, setSetting] = useState(location.setting === 'any' ? '' : (location.setting || ''));
  const [selectedThemes, setSelectedThemes] = useState([]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setPartyDate(date);
    const time = partyTime || '12:00';
    updateChildInfo({ partyDate: date ? `${date}T${time}` : null });
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setPartyTime(time);
    if (partyDate) updateChildInfo({ partyDate: `${partyDate}T${time || '12:00'}` });
  };

  const handleSettingClick = (val) => {
    const next = setting === val ? '' : val;
    setSetting(next);
    updateLocation({ setting: next || 'any' });
  };

  const toggleTheme = (key) => {
    const next = selectedThemes.includes(key)
      ? selectedThemes.filter(k => k !== key)
      : [...selectedThemes, key];
    setSelectedThemes(next);
    updatePreferences({ partyTypes: next });
  };

  const handleFindVenues = () => {
    goToStep(4);
    searchVenues();
  };

  const persona = getPersona(childInfo.age);
  const city = location.city;

  // Determine weather quality for outdoor note
  const weatherGood = weather && weather.main
    ? !['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(weather.main)
    : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="plan-page">
      {/* ── Context bar ── */}
      <div className="plan-ctx-bar">
        <div className="plan-ctx-item">
          <svg className="plan-ctx-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5z"/>
            <circle cx="8" cy="6" r="1.5"/>
          </svg>
          <span>{city || 'No city set'}</span>
          <button className="plan-ctx-change" onClick={onHome}>change</button>
        </div>
        <div className="plan-ctx-divider" />
        <div className="plan-ctx-item">
          <svg className="plan-ctx-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.4l-3.7 2.2.7-4.1-3-2.9 4.2-.6z"/>
          </svg>
          <span>{persona ? `${persona.label} (${persona.range})` : 'Any age'}</span>
          <button className="plan-ctx-change" onClick={onHome}>change</button>
        </div>
        <div className="plan-ctx-divider" />
        <div className="plan-ctx-item">
          <svg className="plan-ctx-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 2h10a1 1 0 011 1v11l-6-3-6 3V3a1 1 0 011-1z"/>
          </svg>
          <span>🎂 Birthday</span>
          <button className="plan-ctx-change" onClick={onHome}>change</button>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="plan-content">
        <h2 className="plan-title">Plan the party</h2>
        <p className="plan-sub">Just two things and we'll find the best ideas near you.</p>

        {/* Section 1 — Date & time */}
        <div className="plan-section">
          <div className="plan-field-label">When is the party?</div>
          <div className="plan-two-col">
            <div>
              <input
                type="date"
                className="plan-date-input"
                value={partyDate}
                onChange={handleDateChange}
              />
              <p className="plan-field-hint">Day of the party</p>
            </div>
            <div>
              <input
                type="time"
                className="plan-date-input"
                value={partyTime}
                onChange={handleTimeChange}
              />
              <p className="plan-field-hint">Start time — helps with outdoor planning</p>
            </div>
          </div>

          {partyDate && weather && (
            <div className="plan-weather-badge">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 13, height: 13, flexShrink: 0 }}>
                <circle cx="8" cy="8" r="3"/>
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/>
              </svg>
              {formatDate(partyDate)} forecast: {weather.description || weather.main || 'See outdoor card below'}
            </div>
          )}
        </div>

        <div className="plan-divider" />

        {/* Section 2 — Setting + Themes */}
        <div className="plan-section">
          <div className="plan-field-label">Indoor or outdoor?</div>
          <div className="plan-setting-row">
            {/* Indoor */}
            <div
              className={`plan-setting-card${setting === 'indoor' ? ' active' : ''}`}
              onClick={() => handleSettingClick('indoor')}
              role="button"
            >
              <span className="plan-setting-icon">🏠</span>
              <div className="plan-setting-body">
                <div className="plan-setting-label">Indoor</div>
                <div className="plan-setting-sub">Venues, play centres, activity spaces</div>
              </div>
            </div>

            {/* Outdoor */}
            <div
              className={`plan-setting-card${setting === 'outdoor' ? ' active' : ''}`}
              onClick={() => handleSettingClick('outdoor')}
              role="button"
            >
              <span className="plan-setting-icon">🌤</span>
              <div className="plan-setting-body">
                <div className="plan-setting-label">Outdoor</div>
                <div className="plan-setting-sub">Parks, adventure, open-air events</div>
                {partyDate && weather && weatherGood !== null && (
                  <div className={`plan-weather-note${weatherGood ? ' good' : ' warn'}`}>
                    {weather.description || weather.main}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="plan-field-label plan-theme-label">
            Party theme{' '}
            <span className="plan-theme-optional">optional — pick any</span>
          </div>
          <div className="plan-theme-chips">
            {THEMES.map(({ key, label }) => (
              <button
                key={key}
                className={`plan-theme-chip${selectedThemes.includes(key) ? ' active' : ''}`}
                onClick={() => toggleTheme(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="plan-footer-row">
          <button className="plan-back-link" onClick={onHome}>← Back to search</button>
          <button className="plan-find-btn" onClick={handleFindVenues}>Find venues →</button>
        </div>
      </div>
    </div>
  );
}
