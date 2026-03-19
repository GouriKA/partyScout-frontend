import { createContext, useContext, useReducer, useCallback } from 'react';

const PartyPlannerContext = createContext(null);

const initialState = {
  currentStep: 1,
  childInfo: {
    name: '',
    age: null,
    partyDate: null
  },
  preferences: {
    partyTypes: [],
    guestCount: 15,
    budget: { min: 0, max: 500 }
  },
  location: {
    zipCode: '',
    setting: 'any', // indoor | outdoor | any
    maxDistance: 10,
    accessibility: []
  },
  venues: [],
  persona: null,           // e.g. "Kids", "Teens", "Adults"
  llmFilterApplied: null,  // null = not yet searched; true/false after search
  weather: null,
  weatherLoading: false,
  loading: false,
  error: null,
  selectedVenue: null,
  compareVenues: [], // up to 3
  partyTypeSuggestions: [],
  budgetEstimate: null,       // { estimatedTotal, estimatedPerPerson, budgetCategory }
  budgetEstimateLoading: false,
  budgetEstimateError: null,
  allPartyTypes: [],          // full taxonomy from GET /party-types (no age filter)
  partyDetails: null          // { includedItems, notIncluded, suggestedAddOns, whatToBring, typicalDuration, ageAppropriatenessDescription }
};

const actionTypes = {
  SET_STEP: 'SET_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  UPDATE_CHILD_INFO: 'UPDATE_CHILD_INFO',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  UPDATE_LOCATION: 'UPDATE_LOCATION',
  SET_VENUES: 'SET_VENUES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SELECT_VENUE: 'SELECT_VENUE',
  TOGGLE_COMPARE_VENUE: 'TOGGLE_COMPARE_VENUE',
  CLEAR_COMPARE: 'CLEAR_COMPARE',
  SET_PARTY_TYPE_SUGGESTIONS: 'SET_PARTY_TYPE_SUGGESTIONS',
  SET_BUDGET_ESTIMATE: 'SET_BUDGET_ESTIMATE',
  SET_BUDGET_ESTIMATE_LOADING: 'SET_BUDGET_ESTIMATE_LOADING',
  SET_BUDGET_ESTIMATE_ERROR: 'SET_BUDGET_ESTIMATE_ERROR',
  SET_ALL_PARTY_TYPES: 'SET_ALL_PARTY_TYPES',
  SET_PARTY_DETAILS: 'SET_PARTY_DETAILS',
  SET_WEATHER: 'SET_WEATHER',
  SET_WEATHER_LOADING: 'SET_WEATHER_LOADING',
  RESET: 'RESET'
};

function partyPlannerReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_STEP:
      return { ...state, currentStep: action.payload };

    case actionTypes.NEXT_STEP:
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };

    case actionTypes.PREV_STEP:
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };

    case actionTypes.UPDATE_CHILD_INFO:
      return {
        ...state,
        childInfo: { ...state.childInfo, ...action.payload }
      };

    case actionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };

    case actionTypes.UPDATE_LOCATION:
      return {
        ...state,
        location: { ...state.location, ...action.payload }
      };

    case actionTypes.SET_VENUES:
      return {
        ...state,
        venues: action.payload.venues,
        persona: action.payload.persona ?? null,
        llmFilterApplied: action.payload.llmFilterApplied ?? null,
        loading: false,
        error: null,
      };

    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case actionTypes.SELECT_VENUE:
      return { ...state, selectedVenue: action.payload };

    case actionTypes.TOGGLE_COMPARE_VENUE:
      const venueId = action.payload;
      const isSelected = state.compareVenues.some(v => v.id === venueId);

      if (isSelected) {
        return {
          ...state,
          compareVenues: state.compareVenues.filter(v => v.id !== venueId)
        };
      } else if (state.compareVenues.length < 3) {
        const venue = (state.venues || []).find(v => v.id === venueId);
        return {
          ...state,
          compareVenues: venue ? [...state.compareVenues, venue] : state.compareVenues
        };
      }
      return state;

    case actionTypes.CLEAR_COMPARE:
      return { ...state, compareVenues: [] };

    case actionTypes.SET_PARTY_TYPE_SUGGESTIONS:
      return { ...state, partyTypeSuggestions: action.payload };

    case actionTypes.SET_BUDGET_ESTIMATE:
      return { ...state, budgetEstimate: action.payload, budgetEstimateLoading: false, budgetEstimateError: null };

    case actionTypes.SET_BUDGET_ESTIMATE_LOADING:
      return { ...state, budgetEstimateLoading: action.payload, budgetEstimateError: null };

    case actionTypes.SET_BUDGET_ESTIMATE_ERROR:
      return { ...state, budgetEstimateError: action.payload, budgetEstimateLoading: false };

    case actionTypes.SET_ALL_PARTY_TYPES:
      return { ...state, allPartyTypes: action.payload };

    case actionTypes.SET_PARTY_DETAILS:
      return { ...state, partyDetails: action.payload };

    case actionTypes.SET_WEATHER:
      return { ...state, weather: action.payload, weatherLoading: false };

    case actionTypes.SET_WEATHER_LOADING:
      return { ...state, weatherLoading: action.payload };

    case actionTypes.RESET:
      return initialState;

    default:
      return state;
  }
}

// API base URL from environment variable (set at build time for production)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function PartyPlannerProvider({ children }) {
  const [state, dispatch] = useReducer(partyPlannerReducer, initialState);

  // Navigation actions
  const goToStep = useCallback((step) => {
    dispatch({ type: actionTypes.SET_STEP, payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: actionTypes.NEXT_STEP });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: actionTypes.PREV_STEP });
  }, []);

  // Update actions
  const updateChildInfo = useCallback((info) => {
    dispatch({ type: actionTypes.UPDATE_CHILD_INFO, payload: info });
  }, []);

  const updatePreferences = useCallback((prefs) => {
    dispatch({ type: actionTypes.UPDATE_PREFERENCES, payload: prefs });
  }, []);

  const updateLocation = useCallback((loc) => {
    dispatch({ type: actionTypes.UPDATE_LOCATION, payload: loc });
  }, []);

  // Venue actions
  const setVenues = useCallback((payload) => {
    dispatch({ type: actionTypes.SET_VENUES, payload });
  }, []);

  const selectVenue = useCallback((venue) => {
    dispatch({ type: actionTypes.SELECT_VENUE, payload: venue });
  }, []);

  const toggleCompareVenue = useCallback((venueId) => {
    dispatch({ type: actionTypes.TOGGLE_COMPARE_VENUE, payload: venueId });
  }, []);

  const clearCompare = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_COMPARE });
  }, []);

  // Loading/Error actions
  const setLoading = useCallback((loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  }, []);

  // Party type suggestions
  const setPartyTypeSuggestions = useCallback((suggestions) => {
    dispatch({ type: actionTypes.SET_PARTY_TYPE_SUGGESTIONS, payload: suggestions });
  }, []);

  // Reset
  const reset = useCallback(() => {
    dispatch({ type: actionTypes.RESET });
  }, []);

  // API call to search venues
  const searchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);

    const requestBody = {
      age: state.childInfo.age,
      partyTypes: state.preferences.partyTypes,
      guestCount: state.preferences.guestCount,
      budgetMin: state.preferences.budget.min,
      budgetMax: state.preferences.budget.max,
      zipCode: state.location.zipCode,
      setting: state.location.setting,
      maxDistanceMiles: state.location.maxDistance,
      date: state.childInfo.partyDate
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/v2/party-wizard/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let message = 'Failed to search venues. Please try again.';
        try {
          const errorData = await response.json();
          if (errorData.message) message = errorData.message;
        } catch {}
        if (response.status === 503) {
          message = 'Venue search is temporarily unavailable. Please try again in a moment.';
        } else if (response.status >= 500) {
          message = 'Server error. Please try again in a moment.';
        } else if (response.status === 400) {
          message = 'Invalid search parameters. Please check your inputs and try again.';
        }
        throw new Error(message);
      }

      const data = await response.json();
      setVenues({
        venues: data.venues || [],
        persona: data.persona ?? null,
        llmFilterApplied: data.llmFilterApplied ?? null,
      });
      setPartyTypeSuggestions(data.partyTypeSuggestions || []);
    } catch (err) {
      if (err.name === 'TypeError') {
        setError('Unable to connect. Please check your internet connection and try again.');
      } else {
        setError(err.message);
      }
    }
  }, [state.childInfo, state.preferences, state.location, setLoading, setError, setVenues, setPartyTypeSuggestions]);

  // Fetch party type suggestions for an age
  const fetchPartyTypeSuggestions = useCallback(async (age) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v2/party-wizard/party-types/${age}`);
      if (response.ok) {
        const suggestions = await response.json();
        setPartyTypeSuggestions(suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch party type suggestions:', err);
    }
  }, [setPartyTypeSuggestions]);

  // Fetch budget estimate from API
  const fetchBudgetEstimate = useCallback(async (partyTypes, guestCount, priceLevel) => {
    if (!partyTypes.length || guestCount < 1) return;
    dispatch({ type: actionTypes.SET_BUDGET_ESTIMATE_LOADING, payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v2/party-wizard/estimate-budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyTypes, guestCount, priceLevel: priceLevel || 2 })
      });
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: actionTypes.SET_BUDGET_ESTIMATE, payload: data });
      } else {
        dispatch({ type: actionTypes.SET_BUDGET_ESTIMATE_ERROR, payload: 'Could not load budget estimate' });
      }
    } catch (err) {
      dispatch({ type: actionTypes.SET_BUDGET_ESTIMATE_ERROR, payload: 'Could not load budget estimate' });
    }
  }, []);

  // Fetch all party types (no age filter)
  const fetchAllPartyTypes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v2/party-wizard/party-types`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: actionTypes.SET_ALL_PARTY_TYPES, payload: data });
      }
    } catch (err) {
      console.error('Failed to fetch all party types:', err);
    }
  }, []);

  // Fetch weather forecast for outdoor venues
  const fetchWeatherForecast = useCallback(async (zipCode, date) => {
    if (!zipCode || zipCode.length !== 5 || !date) return;
    dispatch({ type: actionTypes.SET_WEATHER_LOADING, payload: true });
    try {
      const datePart = date.slice(0, 10);
      const response = await fetch(`${API_BASE_URL}/api/v2/weather/forecast?zipCode=${zipCode}&date=${datePart}`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: actionTypes.SET_WEATHER, payload: data });
      } else {
        dispatch({ type: actionTypes.SET_WEATHER, payload: null });
      }
    } catch {
      dispatch({ type: actionTypes.SET_WEATHER, payload: null });
    }
  }, []);

  // Fetch party details for selected types
  const fetchPartyDetails = useCallback(async (partyTypes, guestCount, priceLevel) => {
    if (!partyTypes.length || guestCount < 1) return;
    try {
      const params = new URLSearchParams();
      partyTypes.forEach(t => params.append('partyTypes', t));
      params.append('guestCount', guestCount);
      if (priceLevel) params.append('priceLevel', priceLevel);
      const response = await fetch(`${API_BASE_URL}/api/v2/party-wizard/party-details?${params}`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: actionTypes.SET_PARTY_DETAILS, payload: data });
      }
    } catch (err) {
      console.error('Failed to fetch party details:', err);
    }
  }, []);

  const value = {
    // State
    ...state,

    // Navigation
    goToStep,
    nextStep,
    prevStep,

    // Updates
    updateChildInfo,
    updatePreferences,
    updateLocation,

    // Venues
    setVenues,
    selectVenue,
    toggleCompareVenue,
    clearCompare,

    // Loading/Error
    setLoading,
    setError,

    // Party types
    setPartyTypeSuggestions,
    fetchPartyTypeSuggestions,

    // Budget estimate
    fetchBudgetEstimate,
    budgetEstimateError: state.budgetEstimateError,

    // All party types & details
    fetchAllPartyTypes,
    fetchPartyDetails,

    // Weather
    fetchWeatherForecast,

    // API
    searchVenues,

    // Reset
    reset
  };

  return (
    <PartyPlannerContext.Provider value={value}>
      {children}
    </PartyPlannerContext.Provider>
  );
}

export function usePartyPlanner() {
  const context = useContext(PartyPlannerContext);
  if (!context) {
    throw new Error('usePartyPlanner must be used within a PartyPlannerProvider');
  }
  return context;
}

export default PartyPlannerContext;
