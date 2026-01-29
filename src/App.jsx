import { PartyPlannerProvider } from './context/PartyPlannerContext'
import WizardContainer from './components/wizard/WizardContainer'
import './App.css'

function App() {
  return (
    <PartyPlannerProvider>
      <div className="app">
        <WizardContainer />
      </div>
    </PartyPlannerProvider>
  )
}

export default App
