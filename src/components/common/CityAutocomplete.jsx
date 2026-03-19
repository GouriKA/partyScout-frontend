import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const DEBOUNCE_MS = 300;

/**
 * City autocomplete — fetches suggestions from our own backend.
 * No Google SDK on the frontend; no API key exposed to the browser.
 */
export default function CityAutocomplete({ value, onChange, className, placeholder }) {
  const [inputValue,   setInputValue]   = useState(value || '');
  const [suggestions,  setSuggestions]  = useState([]);
  const [open,         setOpen]         = useState(false);
  const [highlighted,  setHighlighted]  = useState(-1);
  const debounceTimer  = useRef(null);
  const wrapperRef     = useRef(null);

  // Sync external value changes (e.g. reset)
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    fetch(`${API_BASE}/api/v2/places/autocomplete?input=${encodeURIComponent(input)}`)
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(data);
        setOpen(data.length > 0);
        setHighlighted(-1);
      })
      .catch(() => {
        setSuggestions([]);
        setOpen(false);
      });
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
  };

  const handleSelect = (city) => {
    setInputValue(city);
    setSuggestions([]);
    setOpen(false);
    onChange(city);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="city-ac-wrapper" ref={wrapperRef}>
      <input
        type="text"
        className={className}
        placeholder={placeholder ?? 'Your city...'}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <ul className="city-ac-dropdown" role="listbox">
          {suggestions.map((city, i) => (
            <li
              key={city}
              role="option"
              aria-selected={i === highlighted}
              className={`city-ac-option${i === highlighted ? ' city-ac-option--active' : ''}`}
              onMouseDown={() => handleSelect(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
