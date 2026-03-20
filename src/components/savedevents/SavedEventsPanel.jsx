import { useSavedEvents } from '../../context/SavedEventsContext'
import SlidePanel from '../common/SlidePanel'
import './SavedEventsPanel.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function formatPartyTypes(types) {
  if (!types) return null
  return types
    .split(',')
    .map((t) => t.trim().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' · ')
}

function venueLink(venueWebsite, googlePlaceId, venueName) {
  if (venueWebsite) return venueWebsite
  if (googlePlaceId) return `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
  return `https://www.google.com/maps/search/${encodeURIComponent(venueName)}`
}

export default function SavedEventsPanel({ open, onClose }) {
  const { savedEvents, profiles, unsaveEvent, loading } = useSavedEvents()

  const general = savedEvents.filter((ev) => (ev.profileId ?? ev.profileLocalId ?? null) === null)
  const byProfile = profiles
    .map((prof) => {
      const id = prof.id ?? prof.localId
      return {
        profile: prof,
        events: savedEvents.filter((ev) => (ev.profileId ?? ev.profileLocalId) === id),
      }
    })
    .filter((g) => g.events.length > 0)

  const isEmpty = savedEvents.length === 0

  return (
    <SlidePanel open={open} onClose={onClose} title={`Saved Venues${savedEvents.length ? ` (${savedEvents.length})` : ''}`}>
      {loading ? (
        <div className="saved-panel-empty">Loading…</div>
      ) : isEmpty ? (
        <div className="saved-panel-empty">
          <span className="saved-panel-empty-icon">☆</span>
          <p>No saved venues yet</p>
          <p className="saved-panel-empty-hint">
            Tap the star on any venue to save it for later.
          </p>
        </div>
      ) : (
        <div className="saved-panel-groups">
          {general.length > 0 && (
            <SavedGroup title="General" events={general} onUnsave={unsaveEvent} />
          )}
          {byProfile.map(({ profile, events }) => (
            <SavedGroup
              key={profile.id ?? profile.localId}
              title={profile.name ? `${profile.name} · Age ${profile.age}` : `Age ${profile.age}`}
              events={events}
              onUnsave={unsaveEvent}
            />
          ))}
        </div>
      )}
    </SlidePanel>
  )
}

function SavedGroup({ title, events, onUnsave }) {
  return (
    <div className="saved-group">
      <h3 className="saved-group-title">{title}</h3>
      <ul className="saved-group-list">
        {events.map((ev) => (
          <SavedEventCard key={ev.id ?? ev.localId} ev={ev} onUnsave={onUnsave} />
        ))}
      </ul>
    </div>
  )
}

function SavedEventCard({ ev, onUnsave }) {
  const date = formatDate(ev.eventDate)
  const types = formatPartyTypes(ev.partyTypes)
  const link = venueLink(ev.venueWebsite, ev.googlePlaceId, ev.venueName)
  const linkTitle = ev.venueWebsite ? 'Open venue website' : 'Open in Google Maps'

  return (
    <li className="saved-event-card">
      <div className="saved-event-card-top">
        <a
          className="saved-event-name"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          title={linkTitle}
        >
          {ev.venueName}
          <span className="saved-event-link-icon">↗</span>
        </a>
        <button
          className="saved-event-unsave"
          onClick={() => onUnsave(ev.id ?? ev.localId)}
          aria-label={`Remove ${ev.venueName}`}
          title="Remove"
        >
          ✕
        </button>
      </div>

      <div className="saved-event-details">
        {date && (
          <span className="saved-event-detail">
            <span className="saved-detail-icon">📅</span>
            {date}
          </span>
        )}
        {ev.guestCount && (
          <span className="saved-event-detail">
            <span className="saved-detail-icon">👥</span>
            {ev.guestCount} guests
          </span>
        )}
        {types && (
          <span className="saved-event-detail">
            <span className="saved-detail-icon">🎉</span>
            {types}
          </span>
        )}
        {!date && !ev.guestCount && !types && (
          <span className="saved-event-detail saved-event-detail--muted">No details saved</span>
        )}
      </div>
    </li>
  )
}
