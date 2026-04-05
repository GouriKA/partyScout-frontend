import { usePartyPlanner } from '../../context/PartyPlannerContext';
import Slider from '../common/Slider';
import Button from '../common/Button';
import CityAutocomplete from '../common/CityAutocomplete';
import './WizardStep.css';

const settingOptions = [
  { value: 'any',     label: 'No preference', icon: '🏠' },
  { value: 'indoor',  label: 'Indoor',         icon: '🏢' },
  { value: 'outdoor', label: 'Outdoor',         icon: '☀️' }
];

export default function Step3_Location() {
  const {
    location,
    updateLocation,
    nextStep,
    prevStep,
    searchVenues,
  } = usePartyPlanner();

  const handleSettingChange = (setting) => {
    updateLocation({ setting });
  };

  const handleDistanceChange = (e) => {
    updateLocation({ maxDistance: parseInt(e.target.value, 10) });
  };

  const formatDistance = (value) => `${value} miles`;

  const canProceed = !!location.city;

  return (
    <div className="wizard-step">
      <div className="step-top-nav">
        <button type="button" className="btn-back" onClick={prevStep}>
          Back
        </button>
      </div>

      <div className="step-header">
        <h2 className="step-title">Where should we look?</h2>
        <p className="step-description">
          Tell us your location preferences
        </p>
      </div>

      <div className="step-form">
        <div className="form-section">
          <label className="section-label">Your city</label>
          <CityAutocomplete
            value={location.city}
            onChange={(city) => updateLocation({ city })}
            placeholder="Enter your city..."
            className="wizard-city-input"
          />
        </div>

        <div className="form-section">
          <label className="section-label">Indoor or Outdoor?</label>
          <div className="setting-options">
            {settingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSettingChange(option.value)}
                className={`setting-option ${location.setting === option.value ? 'selected' : ''}`}
              >
                <span className="setting-icon">{option.icon}</span>
                <span className="setting-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Slider
          label="How far are you willing to travel?"
          value={location.maxDistance}
          onChange={handleDistanceChange}
          min={1}
          max={25}
          step={1}
          formatValue={formatDistance}
        />
      </div>

      <div className="step-actions">
        <div /> {/* Spacer */}
        <Button
          onClick={() => { searchVenues(); nextStep(); }}
          disabled={!canProceed}
          size="large"
        >
          Find Venues
        </Button>
      </div>
    </div>
  );
}
