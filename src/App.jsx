import { PartyPlannerProvider } from './context/PartyPlannerContext'
import { AuthProvider } from './context/AuthContext'
import WizardContainer from './components/wizard/WizardContainer'
import ErrorBoundary from './components/common/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PartyPlannerProvider>
          <div className="early-access-banner">
            🚧 Early Access — Some features may change.{' '}
            <a href="mailto:feedback@partyscout.live">Share feedback →</a>
          </div>
          <div className="app">
            <WizardContainer />
          </div>
        </PartyPlannerProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
