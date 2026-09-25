import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReportsMap from '../components/ReportsMap'
import ReportForm from '../components/ReportForm'
import ReportFilters from '../components/ReportFilters'
import { fetchApprovedReports } from '../api/reports'
import { DISCLAIMER } from '../config'

const NO_FILTERS = { concern_type: '', source: '', region: '' }

function PublicMapPage() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState(NO_FILTERS)
  const [loadError, setLoadError] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadReports = useCallback(async () => {
    try {
      setReports(await fetchApprovedReports(filters))
      setLoadError(null)
    } catch (err) {
      setLoadError(err.message)
    }
  }, [filters])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="header__title">DataCenterTracker</h1>
          <p className="header__subtitle">
            {reports.length} on the map — documented facilities and{' '}
            {DISCLAIMER.toLowerCase()}s, each labelled — <Link to="/stats">statistics</Link>
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

      <ReportFilters filters={filters} onChange={setFilters} resultCount={reports.length} />

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

export default PublicMapPage
