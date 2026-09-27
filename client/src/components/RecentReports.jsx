import { Link } from 'react-router-dom'
import ReportRow from './ReportRow'
import Skeleton from './Skeleton'

function RecentReports({ reports, isLoading, onSelect }) {
  return (
    <section className="section">
      <h2 className="section__title">Recent reports</h2>

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

      <p className="section__more">
        <Link to="/reports">View all reports →</Link>
      </p>
    </section>
  )
}

export default RecentReports
