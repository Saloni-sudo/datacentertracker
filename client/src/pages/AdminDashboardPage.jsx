import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchReportsByStatus, updateReportStatus } from '../api/admin'
import { clearToken } from '../auth/token'
import { concernLabel } from '../config'

const STATUS_FILTERS = ['pending', 'approved', 'rejected', 'flagged']
const ACTIONS = [
  { status: 'approved', label: 'Approve' },
  { status: 'rejected', label: 'Reject' },
  { status: 'flagged', label: 'Flag' },
]

function AdminDashboardPage() {
  const [filter, setFilter] = useState('pending')
  const [reports, setReports] = useState([])
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const navigate = useNavigate()

  const loadReports = useCallback(async () => {
    try {
      setReports(await fetchReportsByStatus(filter))
      setError(null)
    } catch (err) {
      setError(err.message)
      if (err.message.includes('expired')) {
        navigate('/admin/login', { replace: true })
      }
    }
  }, [filter, navigate])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  async function handleAction(id, status) {
    setBusyId(id)

    try {
      await updateReportStatus(id, status)
      await loadReports()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  function handleLogout() {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <header className="header">
        <div>
          <h1 className="header__title">Moderation queue</h1>
          <p className="header__subtitle">
            {reports.length} {filter} {reports.length === 1 ? 'report' : 'reports'} —{' '}
            <Link to="/">back to map</Link>
          </p>
        </div>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <div className="admin__filters">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            className={status === filter ? 'chip chip--active' : 'chip'}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {error && <p className="app__error">{error}</p>}

      <div className="admin__list">
        {reports.length === 0 && <p className="admin__empty">Nothing {filter} right now.</p>}

        {reports.map((report) => (
          <article key={report.id} className="card">
            <h2 className="card__title">{concernLabel(report.concern_type)}</h2>
            <p className="card__description">{report.description}</p>
            <dl className="card__meta">
              <dt>Address</dt>
              <dd>{report.address}</dd>
              <dt>Region</dt>
              <dd>{report.region || '—'}</dd>
              <dt>Coordinates</dt>
              <dd>
                {report.latitude && report.longitude
                  ? `${report.latitude}, ${report.longitude}`
                  : 'not geocoded'}
              </dd>
              <dt>Submitted</dt>
              <dd>{new Date(report.created_at).toLocaleString()}</dd>
            </dl>

            <div className="card__actions">
              {ACTIONS.filter((action) => action.status !== report.status).map((action) => (
                <button
                  key={action.status}
                  type="button"
                  className={`chip chip--${action.status}`}
                  disabled={busyId === report.id}
                  onClick={() => handleAction(report.id, action.status)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage
