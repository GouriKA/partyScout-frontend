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
          <div className="app">
            <WizardContainer />
          </div>
        </PartyPlannerProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
