import { useState } from 'react';
import { PartyPlannerProvider } from './context/PartyPlannerContext'
import { AuthProvider } from './context/AuthContext'
import { SavedEventsProvider } from './context/SavedEventsContext'
import LandingPage from './components/landing/LandingPage'
import WizardContainer from './components/wizard/WizardContainer'
import AppNav from './components/common/AppNav'
import ErrorBoundary from './components/common/ErrorBoundary'
import FeedbackModal from './components/common/FeedbackModal'
import './App.css'

function App() {
  const [showLanding, setShowLanding] = useState(true);
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
            {showLanding ? (
              <LandingPage onStart={() => setShowLanding(false)} />
            ) : (
              <>
                <AppNav onHome={() => setShowLanding(true)} />
                <div className="app">
                  <WizardContainer onHome={() => setShowLanding(true)} />
                </div>
              </>
            )}
            {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
          </PartyPlannerProvider>
        </SavedEventsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
