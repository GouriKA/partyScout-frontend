import { useState } from 'react';
import { PartyPlannerProvider } from './context/PartyPlannerContext'
import { AuthProvider } from './context/AuthContext'
import WizardContainer from './components/wizard/WizardContainer'
import ErrorBoundary from './components/common/ErrorBoundary'
import FeedbackModal from './components/common/FeedbackModal'
import './App.css'

function App() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PartyPlannerProvider>
          <div className="early-access-banner">
            🚧 Early Access — Some features may change.{' '}
            <button className="banner-feedback-btn" onClick={() => setShowFeedback(true)}>
              Share feedback →
            </button>
          </div>
          <div className="app">
            <WizardContainer />
          </div>
          {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
        </PartyPlannerProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
