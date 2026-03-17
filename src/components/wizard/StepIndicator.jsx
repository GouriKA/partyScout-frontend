import './StepIndicator.css';

const steps = [
  { number: 1, label: 'Child Info', icon: '👶' },
  { number: 2, label: 'Location', icon: '📍' },
  { number: 3, label: 'Party Type', icon: '🎉' },
  { number: 4, label: 'Venues', icon: '🏠' },
  { number: 5, label: 'Details', icon: '📋' }
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="step-indicator">
      <div className="step-track">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isClickable = step.number < currentStep;

          return (
            <div key={step.number} className="step-item-wrapper">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.number)}
                disabled={!isClickable}
                className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-circle">
                  {isCompleted ? (
                    <span className="step-check">✓</span>
                  ) : (
                    <span className="step-icon">{step.icon}</span>
                  )}
                </div>
                <span className="step-label">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
