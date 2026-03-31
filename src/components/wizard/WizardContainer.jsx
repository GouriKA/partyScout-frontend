import { useState } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import AppNav from '../common/AppNav';
import ChatPanel from '../chat/ChatPanel';
import Step4_VenueResults from './Step4_VenueResults';
import Step5_PartyDetails from './Step5_PartyDetails';
import './WizardContainer.css';

function getPersonaLabel(age) {
  if (!age) return null;
  if (age <= 7) return 'Little Kids';
  if (age <= 13) return 'Tweens';
  if (age <= 17) return 'Teens';
  return 'Adults';
}

export default function WizardContainer({ onHome }) {
  const { currentStep, prevStep, goToStep, location, childInfo, setVenues, selectVenue } = usePartyPlanner();
  const [chatOpen, setChatOpen] = useState(false);

  const handleGoHome = () => {
    goToStep(1);
    onHome();
  };

  const handleBack = () => {
    if (currentStep === 5) prevStep();
    else handleGoHome();
  };

  const renderContent = () => {
    if (currentStep === 5) return <div className="wizard-step-wrapper"><Step5_PartyDetails /></div>;
    return <div className="wizard-step-wrapper"><Step4_VenueResults /></div>;
  };

  const persona = getPersonaLabel(childInfo?.age);
  const city = location?.city;
  const contextParts = [];
  if (persona) contextParts.push(persona);
  contextParts.push('Birthday');
  if (city) contextParts.push(city);
  const contextLabel = contextParts.join(' · ');

  const suggestions = currentStep === 5
    ? ['What should I know?', 'Any alternatives?']
    : ['Outdoor only', 'Has party rooms', 'Compare top 2'];

  const handleVenuesFound = (venues) => {
    setVenues({ venues, llmFilterApplied: true });
    if (currentStep < 4) goToStep(4);
    setChatOpen(false);
  };

  const handleVenueSelect = (venue) => {
    selectVenue(venue);
    goToStep(5);
    setChatOpen(false);
  };

  const chatContext = {
    city:     location?.city || null,
    persona:  null,
    occasion: 'birthday',
  };

  return (
    <div className="wizard-container">
      <AppNav
        onHome={handleGoHome}
        onChatToggle={() => setChatOpen(o => !o)}
        chatOpen={chatOpen}
      />

      <div className={`wizard-body${chatOpen ? ' wizard-body--chat-open' : ''}`}>
        <main className="wizard-content">
          <div className="wizard-back-row">
            <button className="wizard-back-btn" onClick={handleBack}>
              {currentStep === 5 ? '← Results' : '← Back'}
            </button>
          </div>
          {renderContent()}
        </main>

        <div className={`wizard-chat-col${chatOpen ? ' wizard-chat-col--open' : ''}`}>
          <ChatPanel
            existingContext={chatContext}
            contextLabel={contextLabel}
            suggestions={suggestions}
            onVenuesFound={handleVenuesFound}
            onVenueSelect={handleVenueSelect}
            onClose={() => setChatOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
