import { useState } from 'react'
import { useSavedEvents } from '../../context/SavedEventsContext'
import './SaveModal.css'

export default function SaveModal({ venue, eventDate, partyTypes, guestCount, venueWebsite, onClose }) {
  const { profiles, saveEvent, createProfile } = useSavedEvents()
  const [selected, setSelected] = useState(null) // null = "Just save it", profile id/localId otherwise
  const [showAddChild, setShowAddChild] = useState(false)
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      let profileId = selected
      if (showAddChild) {
        const age = parseInt(childAge, 10)
        if (!age || age < 1 || age > 18) {
          setError('Please enter a valid age (1–18).')
          setSaving(false)
          return
        }
        const profile = await createProfile(childName.trim() || null, age)
        profileId = profile.id ?? profile.localId
      }
      await saveEvent(venue, profileId, { eventDate, partyTypes, guestCount, venueWebsite })
      onClose()
    } catch {
      setError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="save-modal-overlay" onClick={onClose}>
      <div className="save-modal" onClick={(e) => e.stopPropagation()}>
        <button className="save-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className="save-modal-title">Who is this for?</h2>
        <p className="save-modal-subtitle">{venue.name}</p>

        <div className="save-modal-options">
          <label className="save-option">
            <input
              type="radio"
              name="profile"
              checked={selected === null && !showAddChild}
              onChange={() => { setSelected(null); setShowAddChild(false) }}
            />
            <span className="save-option-label">Just save it</span>
          </label>

          {profiles.map((prof) => {
            const id = prof.id ?? prof.localId
            return (
              <label key={id} className="save-option">
                <input
                  type="radio"
                  name="profile"
                  checked={selected === id && !showAddChild}
                  onChange={() => { setSelected(id); setShowAddChild(false) }}
                />
                <span className="save-option-label">
                  {prof.name ? `${prof.name} (age ${prof.age})` : `Age ${prof.age}`}
                </span>
              </label>
            )
          })}

          <label className="save-option save-option--add">
            <input
              type="radio"
              name="profile"
              checked={showAddChild}
              onChange={() => setShowAddChild(true)}
            />
            <span className="save-option-label">+ Add child</span>
          </label>

          {showAddChild && (
            <div className="save-add-child">
              <input
                className="save-input"
                type="text"
                placeholder="Name (optional)"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                maxLength={100}
              />
              <input
                className="save-input"
                type="number"
                placeholder="Age *"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                min={1}
                max={18}
              />
            </div>
          )}
        </div>

        {error && <p className="save-modal-error">{error}</p>}

        <div className="save-modal-actions">
          <button className="save-btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="save-btn-confirm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save ★'}
          </button>
        </div>
      </div>
    </div>
  )
}
