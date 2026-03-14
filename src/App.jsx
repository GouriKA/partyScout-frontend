import { PartyPlannerProvider } from './context/PartyPlannerContext'
import WizardContainer from './components/wizard/WizardContainer'
import ErrorBoundary from './components/common/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <PartyPlannerProvider>
        <div className="app">
          <WizardContainer />
        </div>
      </PartyPlannerProvider>
    </ErrorBoundary>
  )
}

export default App
