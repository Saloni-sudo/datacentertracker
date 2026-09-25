import { useCallback, useEffect, useState } from 'react'
import ReportsMap from './components/ReportsMap'
import ReportForm from './components/ReportForm'
import { fetchApprovedReports } from './api/reports'
import { DISCLAIMER } from './config'
import './App.css'

function App() {
  const [reports, setReports] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadReports = useCallback(async () => {
    try {
      setReports(await fetchApprovedReports())
      setLoadError(null)
    } catch (err) {
      setLoadError(err.message)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="header__title">DataCenterTracker</h1>
          <p className="header__subtitle">
            {reports.length} approved {reports.length === 1 ? 'report' : 'reports'} —{' '}
            {DISCLAIMER.toLowerCase()}s
          </p>
        </div>
        <button
          type="button"
          className="header__button"
          onClick={() => setIsFormOpen((open) => !open)}
        >
          {isFormOpen ? 'Close' : 'Report a data center'}
        </button>
      </header>

      {loadError && <p className="app__error">{loadError}</p>}

      <main className="main">
        <ReportsMap reports={reports} />

        {isFormOpen && (
          <aside className="panel">
            <h2 className="panel__title">Submit a report</h2>
            <ReportForm onSubmitted={loadReports} />
          </aside>
        )}
      </main>
    </div>
  )
}

export default App
