import { useEffect } from 'react'
import './SlidePanel.css'

export default function SlidePanel({ open, onClose, title, children }) {
  // Lock body scroll while panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="slide-panel-root">
      <div className="slide-panel-overlay" onClick={onClose} />
      <div className="slide-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="slide-panel-header">
          <h2 className="slide-panel-title">{title}</h2>
          <button className="slide-panel-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="slide-panel-body">
          {children}
        </div>
      </div>
    </div>
  )
}
