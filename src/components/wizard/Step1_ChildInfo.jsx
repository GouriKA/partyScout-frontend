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

  const getDatePart = () => (childInfo.partyDate ? childInfo.partyDate.slice(0, 10) : '');
  const getTimePart = () => (childInfo.partyDate ? childInfo.partyDate.slice(11, 16) : '');

  const handleDateChange = (e) => {
    const date = e.target.value;
    const time = getTimePart() || '12:00';
    updateChildInfo({ partyDate: date ? `${date}T${time}` : null });
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    const date = getDatePart();
    updateChildInfo({ partyDate: date ? `${date}T${time}` : null });
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

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Party date"
              type="date"
              value={getDatePart()}
              onChange={handleDateChange}
              min={getMinDateTime().slice(0, 10)}
              required
              hint="Day of the party"
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label="Start time"
              type="time"
              value={getTimePart()}
              onChange={handleTimeChange}
              hint="e.g., 2:00 PM"
            />
          </div>
        </div>
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
