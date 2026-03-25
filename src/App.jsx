import { useState } from 'react';
import { PartyPlannerProvider } from './context/PartyPlannerContext'
import { AuthProvider } from './context/AuthContext'
import { SavedEventsProvider } from './context/SavedEventsContext'
import LandingPage from './components/landing/LandingPage'
import AllIdeasPage from './components/landing/AllIdeasPage'
import WizardContainer from './components/wizard/WizardContainer'
import ErrorBoundary from './components/common/ErrorBoundary'
import FeedbackModal from './components/common/FeedbackModal'
import './App.css'

const SCREEN = { LANDING: 'landing', ALL_IDEAS: 'all-ideas', WIZARD: 'wizard' };

function App() {
  const [screen, setScreen] = useState(SCREEN.LANDING);
  const [allIdeasCity, setAllIdeasCity] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SavedEventsProvider>
          <PartyPlannerProvider>
            <div className="early-access-banner">
              We're still in development — we'd love your feedback!{' '}
              <button className="banner-feedback-btn" onClick={() => setShowFeedback(true)}>
                Share thoughts →
              </button>
            </div>
            {screen === SCREEN.LANDING && (
              <LandingPage
                onStart={() => setScreen(SCREEN.WIZARD)}
                onSeeAll={(city) => { setAllIdeasCity(city); setScreen(SCREEN.ALL_IDEAS); }}
              />
            )}
            {screen === SCREEN.ALL_IDEAS && (
              <AllIdeasPage
                initialCity={allIdeasCity}
                onBack={() => setScreen(SCREEN.LANDING)}
                onStart={() => setScreen(SCREEN.WIZARD)}
              />
            )}
            {screen === SCREEN.WIZARD && (
              <WizardContainer onHome={() => setScreen(SCREEN.LANDING)} />
            )}
            {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
          </PartyPlannerProvider>
        </SavedEventsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
