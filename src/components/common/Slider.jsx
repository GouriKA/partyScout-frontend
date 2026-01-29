import './Slider.css';

export default function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  showMinMax = true,
  showValue = true,
  disabled = false,
  className = '',
  ...props
}) {
  const percentage = ((value - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <div className={`slider-group ${className}`}>
      {label && (
        <div className="slider-header">
          <label className="slider-label">{label}</label>
          {showValue && <span className="slider-value">{displayValue}</span>}
        </div>
      )}
      <div className="slider-wrapper">
        <input
          type="range"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="slider-input"
          style={{ '--progress': `${percentage}%` }}
          {...props}
        />
      </div>
      {showMinMax && (
        <div className="slider-range">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      )}
    </div>
  );
}
