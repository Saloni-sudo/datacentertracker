import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatsCharts from '../components/StatsCharts'
import { fetchStats } from '../api/reports'

function StatsPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats().then(setStats).catch((err) => setError(err.message))
  }, [])

  return (
    <div className="page stats">
      <header className="page__head">
        <h1 className="page__title">Statistics</h1>
        <p className="page__intro">
          {stats ? `${stats.total_approved} approved reports` : 'Loading…'} —{' '}
          <Link to="/">back to map</Link>
        </p>
      </header>

      {error && <p className="app__error">{error}</p>}

      <div className="stats__body">
        {stats && <StatsCharts stats={stats} />}
        <p className="stats__note">
          Counts cover approved reports only, and mix documented facilities with unverified
          resident submissions — see the source breakdown above.
        </p>
      </div>
    </div>
  )
}

export default StatsPage
