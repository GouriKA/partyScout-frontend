import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './EmailAuthForm.css'

export default function EmailAuthForm({ mode, onToggleMode }) {
  const { signInWithEmail, signUpWithEmail, resetPassword, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState(null)
  const [resetSent, setResetSent] = useState(false)

  const isSignUp = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (isSignUp) {
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.')
        return
      }
      if (password.length < 8) {
        setFormError('Password must be at least 8 characters.')
        return
      }
      await signUpWithEmail(email, password)
    } else {
      await signInWithEmail(email, password)
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setFormError('Enter your email address first.')
      return
    }
    await resetPassword(email)
    setResetSent(true)
  }

  const displayError = formError || error

  return (
    <form className="email-auth-form" onSubmit={handleSubmit} noValidate>
      {displayError && (
        <p className="auth-error" role="alert">{displayError}</p>
      )}
      {resetSent && (
        <p className="auth-success" role="status">
          Password reset email sent. Check your inbox.
        </p>
      )}

      <div className="form-field">
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={loading}
        />
      </div>

      <div className="form-field">
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          required
          disabled={loading}
          minLength={isSignUp ? 8 : undefined}
        />
      </div>

      {isSignUp && (
        <div className="form-field">
          <label htmlFor="auth-confirm-password">Confirm Password</label>
          <input
            id="auth-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
          />
        </div>
      )}

      <button
        type="submit"
        className="auth-submit-btn"
        disabled={loading}
      >
        {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
      </button>

      {!isSignUp && (
        <button
          type="button"
          className="auth-link-btn"
          onClick={handleResetPassword}
          disabled={loading}
        >
          Forgot password?
        </button>
      )}

      <p className="auth-toggle">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button" className="auth-link-btn" onClick={onToggleMode} disabled={loading}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </form>
  )
}
