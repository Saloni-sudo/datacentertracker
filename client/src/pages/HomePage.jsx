import { useCallback, useEffect, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import Hero from '../components/Hero'
import MapSection from '../components/MapSection'
import KeyFigures from '../components/KeyFigures'
import RecentReports from '../components/RecentReports'
import ReportedIssues from '../components/ReportedIssues'
import { fetchApprovedReports } from '../api/reports'

const NO_FILTERS = { concern_type: '', region: '' }
const BOTH_SOURCES = { resident_submission: true, documented_facility: true }

// Both chips on means no source filter; exactly one means filter to it.
function sourceParam(sources) {
  const active = Object.keys(sources).filter((key) => sources[key])
  return active.length === 1 ? active[0] : ''
}

function HomePage() {
  const [reports, setReports] = useState([])
  const [recent, setRecent] = useState([])
  const [filters, setFilters] = useState(NO_FILTERS)
  const [sources, setSources] = useState(BOTH_SOURCES)
  const [selected, setSelected] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { stats } = useOutletContext()

  const noneSelected = !sources.resident_submission && !sources.documented_facility

  const loadReports = useCallback(async () => {
    setIsLoading(true)

    try {
      const data = noneSelected
        ? []
        : await fetchApprovedReports({ ...filters, source: sourceParam(sources) })
      setReports(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [filters, sources, noneSelected])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    fetchApprovedReports({ source: 'resident_submission', limit: 6 })
      .then(setRecent)
      .catch(() => setRecent([]))
      .finally(() => setIsLoadingRecent(false))
  }, [])

  // A row click elsewhere in the app arrives as /?report=<id>.
  useEffect(() => {
    const id = Number(searchParams.get('report'))

    if (id && reports.length > 0) {
      const match = reports.find((report) => report.id === id)

      if (match) {
        setSelected(match)
        setSearchParams({}, { replace: true })
      }
    }
  }, [searchParams, reports, setSearchParams])

  function toggleSource(key) {
    setSources((current) => ({ ...current, [key]: !current[key] }))
  }

  function selectReport(report) {
    setSelected(report)

    if (report) {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <Hero lastUpdated={stats?.last_updated} />

      <KeyFigures stats={stats} />

      <MapSection
        reports={reports}
        isLoading={isLoading}
        error={error}
        sources={sources}
        onToggleSource={toggleSource}
        filters={filters}
        onFilterChange={setFilters}
        selected={selected}
        onSelect={selectReport}
      />

      <div className="columns">
        <RecentReports reports={recent} isLoading={isLoadingRecent} onSelect={selectReport} />
        <ReportedIssues byConcernType={stats?.by_concern_type} />
      </div>
    </>
  )
}

export default HomePage
