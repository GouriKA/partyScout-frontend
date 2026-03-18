import { useSavedEvents } from '../../context/SavedEventsContext'
import SlidePanel from '../common/SlidePanel'
import './SavedEventsPanel.css'

export default function SavedEventsPanel({ open, onClose }) {
  const { savedEvents, profiles, unsaveEvent, loading } = useSavedEvents()

  // Group events: null profileId = general, otherwise group by profile
  const general = savedEvents.filter((ev) => (ev.profileId ?? ev.profileLocalId ?? null) === null)
  const byProfile = profiles.map((prof) => {
    const id = prof.id ?? prof.localId
    return {
      profile: prof,
      events: savedEvents.filter((ev) => (ev.profileId ?? ev.profileLocalId) === id),
    }
  }).filter((g) => g.events.length > 0)

  const isEmpty = savedEvents.length === 0

  return (
    <SlidePanel open={open} onClose={onClose} title="Saved Venues">
      {loading ? (
        <div className="saved-panel-empty">Loading…</div>
      ) : isEmpty ? (
        <div className="saved-panel-empty">
          <span className="saved-panel-empty-icon">♡</span>
          <p>No saved venues yet.</p>
          <p className="saved-panel-empty-hint">
            Tap the heart on any venue to save it for later.
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
              title={profile.name ? `${profile.name} (age ${profile.age})` : `Age ${profile.age}`}
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
          <li key={ev.id ?? ev.localId} className="saved-event-item">
            <div className="saved-event-info">
              <span className="saved-event-name">{ev.venueName}</span>
              {ev.eventDate && (
                <span className="saved-event-date">{ev.eventDate}</span>
              )}
            </div>
            <button
              className="saved-event-unsave"
              onClick={() => onUnsave(ev.id ?? ev.localId)}
              aria-label={`Remove ${ev.venueName}`}
              title="Remove"
            >
              ♥
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
