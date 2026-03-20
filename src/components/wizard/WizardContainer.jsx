import { usePartyPlanner } from '../../context/PartyPlannerContext';
import PlanPage from '../plan/PlanPage';
import Step4_VenueResults from './Step4_VenueResults';
import Step5_PartyDetails from './Step5_PartyDetails';
import './WizardContainer.css';

export default function WizardContainer({ onHome }) {
  const { currentStep } = usePartyPlanner();

  const renderContent = () => {
    if (currentStep === 5) return <Step5_PartyDetails />;
    if (currentStep === 4) return <Step4_VenueResults />;
    return <PlanPage onHome={onHome} />;
  };

  return (
    <div className="wizard-container">
      <main className="wizard-content">
        {renderContent()}
      </main>
    </div>
  );
}
