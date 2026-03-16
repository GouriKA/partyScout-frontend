import { createContext, useContext, useEffect, useReducer } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, firebaseConfigured } from '../firebase'

const AuthContext = createContext(null)

const initialState = {
  user: null,          // Firebase user object
  profile: null,       // Backend profile (id, displayName, etc.)
  loading: true,       // True while auth state is being resolved
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, loading: false, error: null }
    case 'SET_PROFILE':
      return { ...state, profile: action.profile }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false }
    case 'CLEAR':
      return { ...initialState, loading: false }
    default:
      return state
  }
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Sync backend profile whenever Firebase user changes
  async function syncProfile(firebaseUser) {
    if (!firebaseUser) return
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(`${API_BASE}/api/v2/auth/me`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (res.ok) {
        const profile = await res.json()
        dispatch({ type: 'SET_PROFILE', profile })
      }
    } catch {
      // Non-fatal — profile sync failure doesn't break the app
    }
  }

  useEffect(() => {
    if (!firebaseConfigured) {
      dispatch({ type: 'SET_LOADING', loading: false })
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch({ type: 'SET_USER', user: firebaseUser })
      if (firebaseUser) {
        await syncProfile(firebaseUser)
      } else {
        dispatch({ type: 'SET_PROFILE', profile: null })
      }
    })
    return unsubscribe
  }, [])

  async function signInWithGoogle() {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      await syncProfile(result.user)
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: friendlyError(err) })
    }
  }

  async function signUpWithEmail(email, password) {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(result.user)
      await syncProfile(result.user)
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: friendlyError(err) })
    }
  }

  async function signInWithEmail(email, password) {
    dispatch({ type: 'SET_LOADING', loading: true })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: friendlyError(err) })
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: friendlyError(err) })
    }
  }

  async function signOutUser() {
    await signOut(auth)
    dispatch({ type: 'CLEAR' })
  }

  // Get a fresh ID token for API calls (Firebase refreshes automatically)
  async function getIdToken() {
    if (!state.user) return null
    return state.user.getIdToken()
  }

  return (
    <AuthContext.Provider value={{
      user: state.user,
      profile: state.profile,
      loading: state.loading,
      error: state.error,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      resetPassword,
      signOut: signOutUser,
      getIdToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function friendlyError(err) {
  switch (err.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/popup-closed-by-user':
      return null  // User closed popup — not an error
    case 'auth/cancelled-popup-request':
      return null
    default:
      return 'Something went wrong. Please try again.'
  }
}
