import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ReportForm from './ReportForm'
import { fetchStats } from '../api/reports'

function PublicLayout() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [stats, setStats] = useState(null)

  // Fetched once here so the hero, key figures and footer share one request.
  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <div className="site">
      <Header onSubmitClick={() => setIsFormOpen(true)} />

      <main className="site__main">
        <Outlet context={{ stats }} />
      </main>

      {isFormOpen && (
        <div className="drawer" role="dialog" aria-label="Submit a report">
          <div className="drawer__panel">
            <div className="drawer__head">
              <h2 className="drawer__title">Submit a report</h2>
              <button
                type="button"
                className="drawer__close"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <ReportForm />
          </div>
        </div>
      )}

      <Footer lastUpdated={stats?.last_updated} onSubmitClick={() => setIsFormOpen(true)} />
    </div>
  )
}

export default PublicLayout
