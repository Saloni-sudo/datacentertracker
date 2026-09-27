import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportRow from '../components/ReportRow'
import Skeleton from '../components/Skeleton'
import { fetchApprovedReports } from '../api/reports'
import { CONCERN_TYPES, SOURCE_TYPES } from '../config'

const NO_FILTERS = { concern_type: '', source: '', region: '' }

function ReportsPage() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState(NO_FILTERS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const loadReports = useCallback(async () => {
    setIsLoading(true)

    try {
      setReports(await fetchApprovedReports(filters))
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  function handleChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <section className="page">
      <h1 className="page__title">Reports</h1>
      <p className="page__intro">
        Every published report and documented site, newest first. Each one carries its source label.
      </p>

      <div className="filters">
        <label>
          <span className="label">Concern</span>
          <select name="concern_type" value={filters.concern_type} onChange={handleChange}>
          <option value="">All concerns</option>
          {CONCERN_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
          </select>
        </label>

        <label>
          <span className="label">Source</span>
          <select name="source" value={filters.source} onChange={handleChange}>
          <option value="">All sources</option>
          {SOURCE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
          </select>
        </label>

        <label>
          <span className="label">Region</span>
          <input
            name="region"
            value={filters.region}
            onChange={handleChange}
            placeholder="Filter by city or county"
          />
        </label>

        <span className="filters__count">
          <span className="num">{reports.length}</span> shown
        </span>
      </div>

      {error && <p className="notice notice--error">{error}</p>}
      {isLoading && <Skeleton rows={5} />}

      {!isLoading && reports.length === 0 && (
        <p className="notice">No reports match these filters</p>
      )}

      {!isLoading && reports.length > 0 && (
        <p className="ledger__head ledger__head--wide label" aria-hidden="true">
          <span>Date</span>
          <span>Region</span>
          <span>Concern</span>
          <span>Report</span>
        </p>
      )}

      <ul className="ledger ledger--wide">
        {reports.map((report) => (
          <ReportRow
            key={report.id}
            report={report}
            showSourceLabel
            onSelect={() => navigate(`/?report=${report.id}`)}
          />
        ))}
      </ul>
    </section>
  )
}

export default ReportsPage
