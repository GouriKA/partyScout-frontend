import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './UserMenu.css'

export default function UserMenu({ onAccountClick }) {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0]
  const photoUrl = profile?.photoUrl || user?.photoURL

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="user-avatar"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="user-avatar-initials">
            {displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <span className="user-menu-name">{displayName}</span>
        <span className="user-menu-caret">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-info">
            <p className="user-menu-display-name">{displayName}</p>
            <p className="user-menu-email">{user?.email}</p>
          </div>
          <hr className="user-menu-divider" />
          <button
            className="user-menu-item"
            role="menuitem"
            onClick={() => { setOpen(false); onAccountClick?.() }}
          >
            My Account
          </button>
          <hr className="user-menu-divider" />
          <button
            className="user-menu-item user-menu-signout"
            role="menuitem"
            onClick={() => { setOpen(false); signOut() }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
