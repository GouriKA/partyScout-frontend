import { useState, useEffect, useRef } from 'react'
import GoogleSignInButton from './GoogleSignInButton'
import EmailAuthForm from './EmailAuthForm'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const modalRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Trap focus within modal
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="auth-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'signup' ? 'Create an account' : 'Sign in'}
    >
      <div className="auth-modal" ref={modalRef} tabIndex={-1}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <h2 className="auth-modal-title">
          {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="auth-modal-subtitle">
          {mode === 'signup'
            ? 'Sign up to save your party plans'
            : 'Sign in to access your saved plans'}
        </p>

        <GoogleSignInButton
          label={mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
        />

        <div className="auth-divider">
          <span>or</span>
        </div>

        <EmailAuthForm
          mode={mode}
          onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        />
      </div>
    </div>
  )
}
