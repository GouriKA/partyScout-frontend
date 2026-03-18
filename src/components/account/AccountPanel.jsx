import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSavedEvents } from '../../context/SavedEventsContext'
import SlidePanel from '../common/SlidePanel'
import './AccountPanel.css'

export default function AccountPanel({ open, onClose }) {
  const { user, profile, signOut } = useAuth()
  const { profiles, createProfile, deleteProfile } = useSavedEvents()

  const [showAddProfile, setShowAddProfile] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState('')
  const [addError, setAddError] = useState(null)
  const [adding, setAdding] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0]
  const provider = profile?.provider || 'unknown'

  async function handleAddProfile() {
    const age = parseInt(newAge, 10)
    if (!age || age < 1 || age > 18) {
      setAddError('Enter a valid age (1–18).')
      return
    }
    setAdding(true)
    setAddError(null)
    try {
      await createProfile(newName.trim() || null, age)
      setNewName('')
      setNewAge('')
      setShowAddProfile(false)
    } catch {
      setAddError('Could not add profile. Try again.')
    } finally {
      setAdding(false)
    }
  }

  async function handleDeleteAccount() {
    await signOut()
    onClose()
  }

  return (
    <SlidePanel open={open} onClose={onClose} title="My Account">
      {/* ── Account info ── */}
      <section className="account-section">
        <h3 className="account-section-title">Account</h3>
        <div className="account-info-card">
          <div className="account-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={displayName} referrerPolicy="no-referrer" />
            ) : (
              <span>{displayName?.[0]?.toUpperCase() ?? '?'}</span>
            )}
          </div>
          <div className="account-info-details">
            <p className="account-info-name">{displayName}</p>
            <p className="account-info-email">{user?.email}</p>
            <span className="account-provider-badge">
              {provider === 'google' ? 'Google' : 'Email'}
            </span>
          </div>
        </div>
      </section>

      {/* ── Children profiles ── */}
      <section className="account-section">
        <h3 className="account-section-title">Children</h3>

        {profiles.length === 0 && !showAddProfile && (
          <p className="account-empty-hint">No children added yet.</p>
        )}

        {profiles.length > 0 && (
          <ul className="account-profiles-list">
            {profiles.map((prof) => {
              const id = prof.id ?? prof.localId
              return (
                <li key={id} className="account-profile-item">
                  <div className="account-profile-avatar">
                    {prof.name?.[0]?.toUpperCase() ?? '👶'}
                  </div>
                  <div className="account-profile-info">
                    <span className="account-profile-name">
                      {prof.name || 'Unnamed'}
                    </span>
                    <span className="account-profile-age">Age {prof.age}</span>
                  </div>
                  <button
                    className="account-profile-delete"
                    onClick={() => deleteProfile(id)}
                    aria-label={`Remove ${prof.name || 'child'}`}
                    title="Remove"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {showAddProfile ? (
          <div className="account-add-profile">
            <input
              className="account-input"
              type="text"
              placeholder="Name (optional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={100}
            />
            <input
              className="account-input"
              type="number"
              placeholder="Age *"
              value={newAge}
              onChange={(e) => setNewAge(e.target.value)}
              min={1}
              max={18}
            />
            {addError && <p className="account-error">{addError}</p>}
            <div className="account-add-profile-actions">
              <button
                className="account-btn-ghost"
                onClick={() => { setShowAddProfile(false); setNewName(''); setNewAge(''); setAddError(null) }}
                disabled={adding}
              >
                Cancel
              </button>
              <button className="account-btn-primary" onClick={handleAddProfile} disabled={adding}>
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <button className="account-btn-add" onClick={() => setShowAddProfile(true)}>
            + Add child
          </button>
        )}
      </section>

      {/* ── Sign out ── */}
      <section className="account-section">
        <button
          className="account-btn-signout"
          onClick={() => { signOut(); onClose() }}
        >
          Sign out
        </button>
      </section>

      {/* ── Delete account ── */}
      <section className="account-section account-section--danger">
        <h3 className="account-section-title account-section-title--danger">Danger zone</h3>
        {confirmDelete ? (
          <div className="account-delete-confirm">
            <p>This will permanently delete your account and all saved data.</p>
            <div className="account-add-profile-actions">
              <button className="account-btn-ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button className="account-btn-danger" onClick={handleDeleteAccount}>
                Yes, delete
              </button>
            </div>
          </div>
        ) : (
          <button className="account-btn-delete" onClick={() => setConfirmDelete(true)}>
            Delete account
          </button>
        )}
      </section>
    </SlidePanel>
  )
}
