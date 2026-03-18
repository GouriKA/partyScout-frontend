import { useState, useEffect } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import { useAuth } from '../../context/AuthContext';
import { useSavedEvents } from '../../context/SavedEventsContext';
import StepIndicator from './StepIndicator';
import Step1_ChildInfo from './Step1_ChildInfo';
import Step2_Preferences from './Step2_Preferences';
import Step3_Location from './Step3_Location';
import Step4_VenueResults from './Step4_VenueResults';
import Step5_PartyDetails from './Step5_PartyDetails';
import AuthModal from '../auth/AuthModal';
import UserMenu from '../auth/UserMenu';
import SavedEventsPanel from '../savedevents/SavedEventsPanel';
import AccountPanel from '../account/AccountPanel';
import Logo from '../common/Logo';
import { firebaseConfigured } from '../../firebase';
import './WizardContainer.css';

export default function WizardContainer() {
  const { currentStep, goToStep } = usePartyPlanner();
  const { user, loading: authLoading } = useAuth();
  const { savedEvents } = useSavedEvents();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    if (user) setShowAuthModal(false);
  }, [user]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ChildInfo />;
      case 2:
        return <Step3_Location />;
      case 3:
        return <Step2_Preferences />;
      case 4:
        return <Step4_VenueResults />;
      case 5:
        return <Step5_PartyDetails />;
      default:
        return <Step1_ChildInfo />;
    }
  };

  return (
    <div className="wizard-container">
      <header className="wizard-header">
        <div className="wizard-header-top">
          <div className="wizard-header-logo">
            <Logo size="md" />
          </div>
          <div className="wizard-header-titles">
            <h1 className="wizard-title">Your next party is waiting!</h1>
            <p className="wizard-subtitle">
              Find the perfect venue in just a few steps
            </p>
          </div>
          <div className="wizard-header-auth">
            <button
              className={`header-saved-btn${savedEvents.length > 0 ? ' header-saved-btn--active' : ''}`}
              onClick={() => setShowSaved(true)}
              aria-label="Saved venues"
              title="Saved venues"
            >
              ♥
              {savedEvents.length > 0 && (
                <span className="header-saved-count">{savedEvents.length}</span>
              )}
            </button>
            {firebaseConfigured && !authLoading && (
              user
                ? <UserMenu onAccountClick={() => setShowAccount(true)} />
                : <button className="sign-in-btn" onClick={() => setShowAuthModal(true)}>Sign In</button>
            )}
          </div>
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <SavedEventsPanel open={showSaved} onClose={() => setShowSaved(false)} />
      <AccountPanel open={showAccount} onClose={() => setShowAccount(false)} />

      <StepIndicator currentStep={currentStep} onStepClick={goToStep} />

      <main className="wizard-content">
        {renderStep()}
      </main>
    </div>
  );
}
