import './PartyTypeSelector.css';

const partyTypeIcons = {
  toddler_play: '👶',
  character_party: '✨',
  bounce_house: '🚀',
  arcade: '🎮',
  sports: '🏆',
  arts_crafts: '🎨',
  outdoor: '🌳',
  escape_room: '🔑',
  movies: '🎬',
  pool_party: '🌊',
  go_karts: '🏎️',
  adventure_park: '⛰️'
};

export default function PartyTypeSelector({
  options = [],
  selected = [],
  onChange,
  maxSelections = 3,
  disabled = false,
  className = ''
}) {
  const handleToggle = (type) => {
    if (disabled) return;

    const isSelected = selected.includes(type);

    if (isSelected) {
      onChange(selected.filter(t => t !== type));
    } else if (selected.length < maxSelections) {
      onChange([...selected, type]);
    }
  };

  return (
    <div className={`party-type-selector ${className}`}>
      <div className="party-type-grid">
        {options.map((option) => {
          const isSelected = selected.includes(option.type);
          const canSelect = selected.length < maxSelections || isSelected;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => handleToggle(option.type)}
              disabled={disabled || (!canSelect && !isSelected)}
              className={`party-type-card ${isSelected ? 'selected' : ''} ${!canSelect && !isSelected ? 'disabled' : ''}`}
            >
              <span className="party-type-icon">
                {partyTypeIcons[option.type] || '🎉'}
              </span>
              <span className="party-type-name">{option.displayName}</span>
              <span className="party-type-ages">{option.ageRange}</span>
              {option.popularityScore >= 4 && (
                <span className="party-type-popular">Popular</span>
              )}
              {isSelected && (
                <span className="party-type-check">✓</span>
              )}
            </button>
          );
        })}
      </div>
      {maxSelections > 1 && (
        <p className="party-type-hint">
          Select up to {maxSelections} party types ({selected.length}/{maxSelections} selected)
        </p>
      )}
    </div>
  );
}
