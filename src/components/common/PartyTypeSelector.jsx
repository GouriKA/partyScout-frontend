import { useState, useRef, useEffect } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (type) => {
    if (disabled) return;
    const isSelected = selected.includes(type);
    if (isSelected) {
      onChange(selected.filter(t => t !== type));
    } else if (selected.length < maxSelections) {
      onChange([...selected, type]);
    }
  };

  // Build trigger label from selected items
  const triggerLabel = () => {
    if (selected.length === 0) return 'Select party types...';
    const selectedOptions = options.filter(o => selected.includes(o.type));
    if (selectedOptions.length === 0) return 'Select party types...';
    if (selectedOptions.length <= 2) {
      return selectedOptions.map(o => `${partyTypeIcons[o.type] || '🎉'} ${o.displayName}`).join(', ');
    }
    const first = selectedOptions[0];
    return `${partyTypeIcons[first.type] || '🎉'} ${first.displayName} +${selectedOptions.length - 1} more`;
  };

  return (
    <div className={`party-type-selector ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`party-type-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${selected.length > 0 ? 'has-selection' : ''}`}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="party-type-trigger-label">{triggerLabel()}</span>
        <span className="party-type-trigger-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="party-type-dropdown" role="listbox" aria-multiselectable="true">
          {options.map((option) => {
            const isSelected = selected.includes(option.type);
            const canSelect = selected.length < maxSelections || isSelected;

            return (
              <button
                key={option.type}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleToggle(option.type)}
                disabled={!canSelect}
                className={`party-type-option ${isSelected ? 'selected' : ''} ${!canSelect ? 'disabled' : ''}`}
              >
                <span className="party-type-option-icon">
                  {partyTypeIcons[option.type] || '🎉'}
                </span>
                <span className="party-type-option-info">
                  <span className="party-type-option-name">{option.displayName}</span>
                  <span className="party-type-option-ages">{option.ageRange}</span>
                </span>
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
      )}

      {maxSelections > 1 && (
        <p className="party-type-hint">
          Select up to {maxSelections} party types ({selected.length}/{maxSelections} selected)
        </p>
      )}
    </div>
  );
}
