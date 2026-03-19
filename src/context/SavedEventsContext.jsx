import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const GUEST_KEY = 'partyscout_guest'
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const SavedEventsContext = createContext(null)

// ── localStorage helpers ──────────────────────────────────────────────────────

function readGuest() {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (!raw) return { savedEvents: [], profiles: [] }
    return JSON.parse(raw)
  } catch {
    return { savedEvents: [], profiles: [] }
  }
}

function writeGuest(data) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(data))
}

function clearGuest() {
  localStorage.removeItem(GUEST_KEY)
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function SavedEventsProvider({ children }) {
  const { user, getIdToken } = useAuth()
  const [savedEvents, setSavedEvents] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const prevUserRef = useRef(null)

  // ── API helpers ─────────────────────────────────────────────────────────────

  async function authFetch(path, options = {}) {
    const token = await getIdToken()
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    if (res.status === 204) return null
    return res.json()
  }

  // ── Load from backend ───────────────────────────────────────────────────────

  async function loadFromApi() {
    setLoading(true)
    try {
      const data = await authFetch('/api/v2/saved-events')
      setSavedEvents(data.savedEvents)
      setProfiles(data.profiles)
    } catch {
      // Non-fatal — keep existing state
    } finally {
      setLoading(false)
    }
  }

  // ── Load from localStorage ──────────────────────────────────────────────────

  function loadFromGuest() {
    const data = readGuest()
    setSavedEvents(data.savedEvents)
    setProfiles(data.profiles)
  }

  // ── Merge guest → backend on login ──────────────────────────────────────────

  const mergeGuestData = useCallback(async () => {
    const guest = readGuest()
    if (!guest.savedEvents.length) return

    const items = guest.savedEvents.map((ev) => {
      const prof = guest.profiles.find((p) => p.localId === ev.profileLocalId)
      return {
        googlePlaceId: ev.googlePlaceId,
        venueName: ev.venueName,
        profileName: prof?.name ?? null,
        profileAge: prof?.age ?? null,
        eventDate: ev.eventDate ?? null,
        partyTypes: ev.partyTypes ?? null,
        guestCount: ev.guestCount ?? null,
        venueWebsite: ev.venueWebsite ?? null,
      }
    })

    try {
      const data = await authFetch('/api/v2/saved-events/merge', {
        method: 'POST',
        body: JSON.stringify(items),
      })
      setSavedEvents(data.savedEvents)
      setProfiles(data.profiles)
      clearGuest()
    } catch {
      // Merge failed — keep guest data; will retry on next login
    }
  }, [getIdToken]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Watch auth state ────────────────────────────────────────────────────────

  useEffect(() => {
    const wasLoggedIn = prevUserRef.current !== null
    const isLoggedIn = user !== null
    prevUserRef.current = user

    if (isLoggedIn) {
      if (!wasLoggedIn) {
        // Just logged in — merge guest data then load
        mergeGuestData().then(() => loadFromApi())
      } else {
        loadFromApi()
      }
    } else if (wasLoggedIn) {
      // Just signed out — clear saved state immediately
      setSavedEvents([])
      setProfiles([])
    } else {
      // Initial load while not signed in — load any guest data
      loadFromGuest()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── isSaved helper ──────────────────────────────────────────────────────────

  function isSaved(googlePlaceId, profileId = undefined) {
    if (profileId === undefined) {
      // Check if saved for any profile (or general)
      return savedEvents.some((ev) => ev.googlePlaceId === googlePlaceId)
    }
    if (user) {
      return savedEvents.some(
        (ev) => ev.googlePlaceId === googlePlaceId && (ev.profileId ?? null) === profileId
      )
    }
    // Guest mode — profileId is a localId string
    return savedEvents.some(
      (ev) =>
        ev.googlePlaceId === googlePlaceId &&
        (ev.profileLocalId ?? null) === (profileId ?? null)
    )
  }

  // ── saveEvent ───────────────────────────────────────────────────────────────

  async function saveEvent(venue, profileId = null, extra = {}) {
    const googlePlaceId = venue.googlePlaceId || venue.id
    const { eventDate = null, partyTypes = null, guestCount = null, venueWebsite = null } = extra

    if (user) {
      // Optimistic update
      const optimistic = {
        id: `optimistic-${uuid()}`,
        googlePlaceId,
        venueName: venue.name,
        profileId,
        eventDate,
        partyTypes,
        guestCount,
        venueWebsite,
        createdAt: new Date().toISOString(),
      }
      setSavedEvents((prev) => [...prev, optimistic])
      try {
        const saved = await authFetch('/api/v2/saved-events', {
          method: 'POST',
          body: JSON.stringify({ googlePlaceId, venueName: venue.name, profileId, eventDate, partyTypes, guestCount, venueWebsite }),
        })
        setSavedEvents((prev) =>
          prev.map((ev) => (ev.id === optimistic.id ? saved : ev))
        )
      } catch {
        // Rollback
        setSavedEvents((prev) => prev.filter((ev) => ev.id !== optimistic.id))
      }
    } else {
      // Guest mode — write to localStorage immediately
      const guest = readGuest()
      const alreadyExists = guest.savedEvents.some(
        (ev) => ev.googlePlaceId === googlePlaceId && (ev.profileLocalId ?? null) === (profileId ?? null)
      )
      if (alreadyExists) return
      const newEvent = {
        localId: uuid(),
        googlePlaceId,
        venueName: venue.name,
        profileLocalId: profileId ?? null,
        eventDate,
        partyTypes,
        guestCount,
        venueWebsite,
        savedAt: new Date().toISOString(),
      }
      guest.savedEvents.push(newEvent)
      writeGuest(guest)
      setSavedEvents([...guest.savedEvents])
    }
  }

  // ── unsaveEvent ─────────────────────────────────────────────────────────────

  async function unsaveEvent(savedEventId) {
    if (user) {
      // Optimistic update
      setSavedEvents((prev) => prev.filter((ev) => ev.id !== savedEventId))
      try {
        await authFetch(`/api/v2/saved-events/${savedEventId}`, { method: 'DELETE' })
      } catch {
        // Rollback — reload from API
        await loadFromApi()
      }
    } else {
      const guest = readGuest()
      guest.savedEvents = guest.savedEvents.filter((ev) => ev.localId !== savedEventId)
      writeGuest(guest)
      setSavedEvents([...guest.savedEvents])
    }
  }

  // ── deleteProfile ───────────────────────────────────────────────────────────

  async function deleteProfile(profileId) {
    if (user) {
      await authFetch(`/api/v2/profiles/${profileId}`, { method: 'DELETE' })
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
      setSavedEvents((prev) => prev.filter((ev) => ev.profileId !== profileId))
    } else {
      const guest = readGuest()
      guest.profiles = guest.profiles.filter((p) => p.localId !== profileId)
      guest.savedEvents = guest.savedEvents.filter((ev) => ev.profileLocalId !== profileId)
      writeGuest(guest)
      setProfiles([...guest.profiles])
      setSavedEvents([...guest.savedEvents])
    }
  }

  // ── createProfile ───────────────────────────────────────────────────────────

  async function createProfile(name, age) {
    if (user) {
      const profile = await authFetch('/api/v2/profiles', {
        method: 'POST',
        body: JSON.stringify({ name, age }),
      })
      setProfiles((prev) => [...prev, profile])
      return profile
    } else {
      const profile = { localId: uuid(), name, age }
      const guest = readGuest()
      guest.profiles.push(profile)
      writeGuest(guest)
      setProfiles([...guest.profiles])
      return profile
    }
  }

  return (
    <SavedEventsContext.Provider
      value={{
        savedEvents,
        profiles,
        loading,
        isSaved,
        saveEvent,
        unsaveEvent,
        createProfile,
        deleteProfile,
        mergeGuestData,
      }}
    >
      {children}
    </SavedEventsContext.Provider>
  )
}

export function useSavedEvents() {
  const ctx = useContext(SavedEventsContext)
  if (!ctx) throw new Error('useSavedEvents must be used within SavedEventsProvider')
  return ctx
}
