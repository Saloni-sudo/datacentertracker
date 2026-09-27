import { Link } from 'react-router-dom'
import ReportRow from './ReportRow'
import Skeleton from './Skeleton'

function RecentReports({ reports, isLoading, onSelect }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section__title">Recent reports</h2>
        <Link className="section__link" to="/reports">
          View all reports →
        </Link>
      </div>

      {isLoading && <Skeleton rows={3} />}

      {!isLoading && reports.length === 0 && (
        <p className="notice">No resident reports have been published yet.</p>
      )}

      {!isLoading && reports.length > 0 && (
        <p className="ledger__head label" aria-hidden="true">
          <span>Date</span>
          <span>Region</span>
          <span>Concern</span>
          <span>Report</span>
        </p>
      )}

      <ul className="ledger">
        {reports.map((report) => (
          <ReportRow key={report.id} report={report} onSelect={onSelect} />
        ))}
      </ul>
    </section>
  )
}

export default RecentReports
