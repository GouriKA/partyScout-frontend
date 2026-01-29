import { useEffect } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import Input from '../common/Input';
import Button from '../common/Button';
import './WizardStep.css';

export default function Step1_ChildInfo() {
  const {
    childInfo,
    updateChildInfo,
    nextStep,
    fetchPartyTypeSuggestions
  } = usePartyPlanner();

  // Get minimum datetime (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Fetch party type suggestions when age changes
  useEffect(() => {
    if (childInfo.age && childInfo.age >= 1 && childInfo.age <= 18) {
      fetchPartyTypeSuggestions(childInfo.age);
    }
  }, [childInfo.age, fetchPartyTypeSuggestions]);

  const handleAgeChange = (e) => {
    const value = e.target.value;
    const age = value === '' ? null : parseInt(value, 10);
    updateChildInfo({ age });
  };

  const handleDateChange = (e) => {
    updateChildInfo({ partyDate: e.target.value || null });
  };

  const handleNameChange = (e) => {
    updateChildInfo({ name: e.target.value });
  };

  const canProceed = childInfo.age !== null && childInfo.age >= 1 && childInfo.partyDate;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2 className="step-title">Tell us about the birthday child</h2>
        <p className="step-description">
          We'll use this to suggest age-appropriate party ideas
        </p>
      </div>

      <div className="step-form">
        <Input
          label="Child's name"
          type="text"
          value={childInfo.name}
          onChange={handleNameChange}
          placeholder="e.g., Emma"
          hint="Optional - used to personalize your experience"
        />

        <Input
          label="How old will they be turning?"
          type="number"
          value={childInfo.age ?? ''}
          onChange={handleAgeChange}
          placeholder="e.g., 7"
          min={1}
          max={18}
          required
          hint="We'll suggest party types perfect for this age"
        />

        <Input
          label="When is the party?"
          type="datetime-local"
          value={childInfo.partyDate || ''}
          onChange={handleDateChange}
          min={getMinDateTime()}
          required
          hint="We'll check venue availability"
        />
      </div>

      <div className="step-actions">
        <div /> {/* Spacer */}
        <Button
          onClick={nextStep}
          disabled={!canProceed}
          size="large"
        >
          Continue to Party Type
        </Button>
      </div>
    </div>
  );
}
