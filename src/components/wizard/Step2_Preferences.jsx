import { useEffect, useRef } from 'react';
import { usePartyPlanner } from '../../context/PartyPlannerContext';
import PartyTypeSelector from '../common/PartyTypeSelector';
import Input from '../common/Input';
import Slider from '../common/Slider';
import Button from '../common/Button';
import './WizardStep.css';

export default function Step2_Preferences() {
  const {
    childInfo,
    preferences,
    updatePreferences,
    partyTypeSuggestions,
    budgetEstimate,
    budgetEstimateLoading,
    budgetEstimateError,
    fetchBudgetEstimate,
    allPartyTypes,
    fetchAllPartyTypes,
    partyDetails,
    fetchPartyDetails,
    nextStep,
    prevStep
  } = usePartyPlanner();

  const handlePartyTypesChange = (types) => {
    updatePreferences({ partyTypes: types });
  };

  const handleGuestCountChange = (e) => {
    const rawValue = e.target.value;
    // Allow empty string for typing, but store as empty or parsed number
    if (rawValue === '') {
      updatePreferences({ guestCount: '' });
    } else {
      const value = parseInt(rawValue, 10);
      if (!isNaN(value) && value >= 0) {
        updatePreferences({ guestCount: value });
      }
    }
  };

  const handleBudgetChange = (e) => {
    const max = parseInt(e.target.value, 10);
    updatePreferences({ budget: { ...preferences.budget, max } });
  };

  const formatBudget = (value) => `$${value}`;

  // Fetch all party types on mount as fallback
  useEffect(() => {
    fetchAllPartyTypes();
  }, [fetchAllPartyTypes]);

  // Use age-filtered suggestions when available, otherwise show all party types
  const partyTypeOptions = partyTypeSuggestions.length > 0 ? partyTypeSuggestions : allPartyTypes;

  // Debounced fetch of budget estimate and party details when partyTypes or guestCount change
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (preferences.partyTypes.length > 0 && preferences.guestCount >= 1) {
        fetchBudgetEstimate(preferences.partyTypes, preferences.guestCount);
        fetchPartyDetails(preferences.partyTypes, preferences.guestCount);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [preferences.partyTypes, preferences.guestCount, fetchBudgetEstimate, fetchPartyDetails]);

  // Use API estimate when available, fall back to rough estimate
  const estimatedCost = budgetEstimate?.estimatedTotal ?? preferences.guestCount * 30;
  const isOverBudget = estimatedCost > preferences.budget.max;

  const handleGuestCountBlur = () => {
    // Reset to 1 if empty or invalid
    if (preferences.guestCount === '' || preferences.guestCount < 1) {
      updatePreferences({ guestCount: 1 });
    }
  };

  const canProceed = preferences.partyTypes.length > 0 && preferences.guestCount >= 1;

  return (
    <div className="wizard-step">
      <div className="step-top-nav">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
      </div>

      <div className="step-header">
        <h2 className="step-title">What kind of party?</h2>
        <p className="step-description">
          {childInfo.age
            ? `Here are popular party ideas for ${childInfo.age}-year-olds`
            : 'Select the types of parties you\'re interested in'}
        </p>
      </div>

      <div className="step-form">
        <div className="form-section">
          <label className="section-label">Party Type</label>
          <PartyTypeSelector
            options={partyTypeOptions}
            selected={preferences.partyTypes}
            onChange={handlePartyTypesChange}
            maxSelections={3}
          />
        </div>

        <div className="form-row">
          <Input
            label="Number of guests"
            type="number"
            value={preferences.guestCount}
            onChange={handleGuestCountChange}
            onBlur={handleGuestCountBlur}
            min={1}
            max={100}
            hint="Including the birthday child"
          />
        </div>

        <div className="form-section">
          <Slider
            label="Budget"
            value={preferences.budget.max}
            onChange={handleBudgetChange}
            min={100}
            max={1500}
            step={50}
            formatValue={formatBudget}
          />
          {budgetEstimate && (
            <div className="budget-estimate-info">
              <span className="budget-category">{budgetEstimate.budgetCategory}</span>
              <span className="budget-per-person">
                ~${budgetEstimate.estimatedPerPerson}/person
              </span>
            </div>
          )}
          {budgetEstimateLoading && (
            <span className="budget-loading">Estimating...</span>
          )}
          {budgetEstimateError && !budgetEstimateLoading && (
            <span className="budget-estimate-error">{budgetEstimateError}</span>
          )}
          {isOverBudget && (
            <p className="budget-warning">
              Estimated cost (~${estimatedCost}) may exceed your budget
            </p>
          )}
        </div>

        {partyDetails && (
          <div className="party-details-preview">
            <h4 className="preview-title">What's typically included</h4>
            <ul className="preview-list">
              {partyDetails.includedItems.slice(0, 4).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            {partyDetails.whatToBring && partyDetails.whatToBring.length > 0 && (
              <>
                <h4 className="preview-title">What to bring</h4>
                <ul className="preview-list bring-list">
                  {partyDetails.whatToBring.slice(0, 3).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className="step-actions">
        <div /> {/* Spacer */}
        <Button
          onClick={nextStep}
          disabled={!canProceed}
          size="large"
        >
          Continue to Location
        </Button>
      </div>
    </div>
  );
}
