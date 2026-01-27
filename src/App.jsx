import { useState } from 'react'
import './App.css'
import SearchForm from './components/SearchForm'
import VenueResults from './components/VenueResults'

function App() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState(null)

  const handleSearch = async (formData) => {
    setLoading(true)
    setError(null)

    try {
      // Ensure datetime has seconds (append :00 if missing)
      const dateTimeWithSeconds = formData.dateTime.length === 16
        ? `${formData.dateTime}:00`
        : formData.dateTime

      const response = await fetch('http://localhost:8080/api/birthdays/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          areaCode: formData.zipCode,
          time: dateTimeWithSeconds,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch venues')
      }

      const data = await response.json()
      setVenues(data.venueOptions || [])
      setSearchParams(data.searchParameters)
    } catch (err) {
      setError(err.message)
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎉 Birthday Party Planner</h1>
        <p>Find the perfect venue for your celebration!</p>
      </header>

      <main className="app-main">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <p>🔍 Searching for venues...</p>
          </div>
        )}

        {!loading && venues.length > 0 && (
          <VenueResults venues={venues} searchParams={searchParams} />
        )}

        {!loading && !error && venues.length === 0 && searchParams && (
          <div className="no-results">
            <p>No venues found. Try adjusting your search criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
