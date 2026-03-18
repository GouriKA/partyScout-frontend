import { useState } from 'react';
import Button from './Button';
import './FeedbackModal.css';

export default function FeedbackModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', type: 'General Feedback', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v2/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <button className="feedback-close" onClick={onClose}>×</button>

        {status === 'success' ? (
          <div className="feedback-success">
            <div className="feedback-success-icon">🎉</div>
            <h3>Thanks for your feedback!</h3>
            <p>We read every submission and use it to improve PartyScout.</p>
            <Button onClick={onClose} size="large">Close</Button>
          </div>
        ) : (
          <>
            <h2 className="feedback-title">Share Feedback</h2>
            <p className="feedback-subtitle">Help us make PartyScout better for every family.</p>

            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="feedback-field">
                <label htmlFor="fb-name">Your name <span className="feedback-optional">(optional)</span></label>
                <input id="fb-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="e.g. Sarah" />
              </div>

              <div className="feedback-field">
                <label htmlFor="fb-email">Your email <span className="feedback-optional">(optional, for follow-up)</span></label>
                <input id="fb-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>

              <div className="feedback-field">
                <label htmlFor="fb-type">Feedback type</label>
                <select id="fb-type" name="type" value={form.type} onChange={handleChange}>
                  <option>General Feedback</option>
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Venue Issue</option>
                </select>
              </div>

              <div className="feedback-field">
                <label htmlFor="fb-message">Message <span className="feedback-required">*</span></label>
                <textarea
                  id="fb-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you think, what's broken, or what you'd love to see..."
                  rows={5}
                  required
                  maxLength={2000}
                />
                <span className="feedback-char-count">{form.message.length}/2000</span>
              </div>

              {status === 'error' && (
                <p className="feedback-error">Something went wrong. Please try again.</p>
              )}

              <div className="feedback-actions">
                <button type="button" className="feedback-cancel" onClick={onClose}>Cancel</button>
                <Button type="submit" disabled={!form.message.trim()} loading={status === 'submitting'} size="large">
                  Send Feedback
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
