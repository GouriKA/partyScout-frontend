import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import AuthModal from '../auth/AuthModal';
import UserMenu from '../auth/UserMenu';
import SavedEventsPanel from '../savedevents/SavedEventsPanel';
import AccountPanel from '../account/AccountPanel';
import { firebaseConfigured } from '../../firebase';
import './AppNav.css';

export default function AppNav({ onHome }) {
  const { user, loading: authLoading } = useAuth();
  const { savedEvents } = useSavedEvents();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaved,     setShowSaved]     = useState(false);
  const [showAccount,   setShowAccount]   = useState(false);

  useEffect(() => {
    if (user) setShowAuthModal(false);
  }, [user]);

  return (
    <>
      <nav className="app-nav">
        <div className="app-nav-inner">
          <div className="app-nav-logo" onClick={onHome} style={{ cursor: 'pointer' }}>
            <div className="app-nav-logo-icon">P</div>
            <span className="app-nav-logo-text">
              <span className="app-nav-logo-party">Party</span>Scout
            </span>
          </div>

          <div className="app-nav-right">
            <button
              className={`app-nav-saved${savedEvents.length > 0 ? ' app-nav-saved--active' : ''}`}
              onClick={() => setShowSaved(true)}
              aria-label="Saved venues"
            >
              <span className="app-nav-saved-heart">♥</span>
              Saved{savedEvents.length > 0 ? ` (${savedEvents.length})` : ''}
            </button>

            {firebaseConfigured && !authLoading && (
              user
                ? <UserMenu onAccountClick={() => setShowAccount(true)} />
                : (
                  <>
                    <button className="app-nav-btn app-nav-btn-signin" onClick={() => setShowAuthModal(true)}>Sign in</button>
                    <button className="app-nav-btn app-nav-btn-signup" onClick={() => setShowAuthModal(true)}>Sign up</button>
                  </>
                )
            )}
          </div>
        </div>
      </nav>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <SavedEventsPanel open={showSaved} onClose={() => setShowSaved(false)} />
      <AccountPanel     open={showAccount} onClose={() => setShowAccount(false)} />
    </>
  );
}
