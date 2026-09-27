function plural(count, word) {
  return `${word}${count === 1 ? '' : 's'}`
}

// One line of prose rather than stat boxes; the numbers stay live from the API.
function KeyFigures({ stats }) {
  if (!stats) {
    return <p className="figures figures--placeholder" aria-hidden="true" />
  }

  return (
    <p className="figures">
      Tracking <span className="num">{stats.sites_tracked}</span>{' '}
      {plural(stats.sites_tracked, 'documented site')} and{' '}
      <span className="num">{stats.resident_reports}</span>{' '}
      {plural(stats.resident_reports, 'resident report')} ·{' '}
      <span className="num">{stats.reports_last_30_days}</span> new in the last 30 days.
    </p>
  )
}

export default KeyFigures
