import { useState } from 'react'
import './SearchForm.css'

function SearchForm({ onSearch, loading }) {
  const [formData, setFormData] = useState({
    age: '',
    zipCode: '',
    dateTime: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Get current date-time in format YYYY-MM-DDTHH:MM
  const getCurrentDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="search-form-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="age">
            🎂 Age
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="150"
            required
            placeholder="Enter age"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">
            📍 ZIP Code
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            pattern="^\d{5}$"
            required
            placeholder="e.g., 94102"
            maxLength="5"
            disabled={loading}
          />
          <small className="form-hint">5-digit US ZIP code</small>
        </div>

        <div className="form-group">
          <label htmlFor="dateTime">
            📅 Date & Time
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            min={getCurrentDateTime()}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="search-button" disabled={loading}>
          {loading ? '🔍 Searching...' : '🎉 Find Venues'}
        </button>
      </form>
    </div>
  )
}

export default SearchForm
